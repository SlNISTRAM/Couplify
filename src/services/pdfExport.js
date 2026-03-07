import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '../utils/helpers';

export const generateFinancialReport = (userName, selectedYear, yearData, globalSavings, yearDistribution, monthlyTrend) => {
  console.log('🔍 generateFinancialReport called');
  console.log('Parameters:', { userName, selectedYear, yearDataLength: yearData?.length, globalSavings, yearDistribution });
  
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Color palette matching the app
    const colors = {
      primary: [99, 102, 241],      // indigo-600
      secondary: [236, 72, 153],    // pink-500
      accent: [139, 92, 246],       // violet-500
      success: [34, 197, 94],       // green-500
      warning: [251, 146, 60],      // orange-400
      text: [30, 41, 59],           // slate-800
      textLight: [100, 116, 139],   // slate-500
      bg: [248, 250, 252]           // slate-50
    };

    // Helper function to add page header
    const addHeader = () => {
      // Logo/Brand area with gradient effect
      doc.setFillColor(...colors.primary);
      doc.rect(0, 0, pageWidth, 35, 'F');
      
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('COUPLIFY', 15, 15);
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Informe Financiero Anual', 15, 25);
    };

    // Helper function to add page footer
    const addFooter = (pageNum) => {
      doc.setFontSize(8);
      doc.setTextColor(...colors.textLight);
      doc.setFont('helvetica', 'normal');
      doc.text(`Pagina ${pageNum}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
      doc.text(`Generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 15, pageHeight - 10);
    };

    // Page 1: Header and Executive Summary
    console.log('Adding header...');
    addHeader();
    yPos = 50;

    // User info section
    doc.setFontSize(16);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text(`Hola, ${userName || 'Invitado'}`, 15, yPos);
    
    yPos += 10;
    doc.setFontSize(12);
    doc.setTextColor(...colors.textLight);
    doc.setFont('helvetica', 'normal');
    doc.text(`Resumen financiero del año ${selectedYear}`, 15, yPos);

    yPos += 15;

    // Calculate key metrics
    console.log('Calculating metrics...');
    const totalIncome = yearData.reduce((sum, m) => {
      const baseRealized = m.incomeStatus?.base ? m.income.base : 0;
      const bonusRealized = m.incomeStatus?.bonus ? m.income.bonus : 0;
      const extraRealized = (m.additionalIncomes || []).reduce((s, i) => 
        s + (i.received ? Number(i.amount) : 0), 0);
      return sum + baseRealized + bonusRealized + extraRealized;
    }, 0);

    const totalSavings = yearData.reduce((sum, m) => {
      const detail = m.savingsPayments || {};
      const realized = Object.values(detail).reduce((acc, goal) => {
        return acc + (Number(goal.userPaid || 0) + Number(goal.partnerPaid || 0));
      }, 0);
      return sum + realized;
    }, 0);

    const totalFixedExpenses = yearData.reduce((sum, m) => 
      sum + Object.values(m.payments || {}).reduce((s, p) => s + (Number(p.amountPaid) || 0), 0), 0);

    const totalVariable = (yearDistribution || []).reduce((sum, item) => sum + item.value, 0);
    const totalExpenses = totalFixedExpenses + totalVariable;
    const netBalance = totalIncome - totalExpenses - totalSavings;
    const savingsRate = totalIncome > 0 ? ((totalSavings / totalIncome) * 100).toFixed(1) : 0;

    // Executive Summary Table
    console.log('Adding executive summary...');
    doc.setFontSize(14);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumen Ejecutivo', 15, yPos);
    yPos += 8;

    autoTable(doc, {
      startY: yPos,
      head: [['Concepto', 'Monto']],
      body: [
        ['Ingresos Totales', formatCurrency(totalIncome)],
        ['Ahorros Realizados', formatCurrency(totalSavings)],
        ['Gastos Fijos', formatCurrency(totalFixedExpenses)],
        ['Gastos Variables', formatCurrency(totalVariable)],
        ['Total Gastos', formatCurrency(totalExpenses)],
        ['Balance Neto', formatCurrency(netBalance)],
        ['Tasa de Ahorro', `${savingsRate}%`],
      ],
      theme: 'striped',
      headStyles: {
        fillColor: colors.primary,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: colors.text
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 100 },
        1: { halign: 'right', cellWidth: 'auto' }
      },
      alternateRowStyles: {
        fillColor: colors.bg
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Savings Goals Section
    console.log('Adding savings goals...');
    doc.setFontSize(14);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Metas de Vida', 15, yPos);
    yPos += 8;

    const goalsBody = Object.values(globalSavings).map(goal => {
      const progress = goal.target > 0 
        ? ((goal.saved / goal.target) * 100).toFixed(1) 
        : 0;
      return [goal.name, formatCurrency(goal.saved), formatCurrency(goal.target), `${progress}%`];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Meta', 'Ahorrado', 'Objetivo', 'Progreso']],
      body: goalsBody,
      theme: 'striped',
      headStyles: {
        fillColor: colors.secondary,
        fontSize: 11,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 10,
        textColor: colors.text
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { halign: 'right', cellWidth: 40 },
        2: { halign: 'right', cellWidth: 40 },
        3: { halign: 'center', cellWidth: 'auto' }
      },
      alternateRowStyles: {
        fillColor: colors.bg
      }
    });

    yPos = doc.lastAutoTable.finalY + 15;

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      addFooter(1);
      doc.addPage();
      addHeader();
      yPos = 50;
    }

    // Expense Distribution Section
    console.log('Adding expense distribution...');
    doc.setFontSize(14);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribucion de Gastos Variables', 15, yPos);
    yPos += 8;

    if (yearDistribution && yearDistribution.length > 0) {
      const expenseData = yearDistribution.map(item => [
        item.name,
        formatCurrency(item.value),
        `${((item.value / totalVariable) * 100).toFixed(1)}%`
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Categoria', 'Monto', '% del Total']],
        body: expenseData,
        theme: 'striped',
        headStyles: {
          fillColor: colors.accent,
          fontSize: 11,
          fontStyle: 'bold',
          halign: 'left'
        },
        bodyStyles: {
          fontSize: 10,
          textColor: colors.text
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 80 },
          1: { halign: 'right', cellWidth: 50 },
          2: { halign: 'center', cellWidth: 'auto' }
        },
        alternateRowStyles: {
          fillColor: colors.bg
        }
      });

      yPos = doc.lastAutoTable.finalY + 15;
    }

    // Check if we need a new page for monthly breakdown
    if (yPos > pageHeight - 60) {
      addFooter(1);
      doc.addPage();
      addHeader();
      yPos = 50;
    }

    // Monthly Breakdown Section
    console.log('Adding monthly breakdown...');
    doc.setFontSize(14);
    doc.setTextColor(...colors.text);
    doc.setFont('helvetica', 'bold');
    doc.text('Desglose Mensual', 15, yPos);
    yPos += 8;

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const monthlyData = yearData.map((m, idx) => {
      const monthIncome = (m.incomeStatus?.base ? m.income.base : 0) + 
                          (m.incomeStatus?.bonus ? m.income.bonus : 0) +
                          (m.additionalIncomes || []).reduce((s, i) => s + (i.received ? Number(i.amount) : 0), 0);
      
      const monthSavings = Object.values(m.savingsPayments || {}).reduce((s, g) => s + (Number(g.userPaid || 0) + Number(g.partnerPaid || 0)), 0);
      
      const monthExpenses = Object.values(m.payments || {}).reduce((s, p) => s + (Number(p.amountPaid) || 0), 0);

      return [
        monthNames[idx],
        formatCurrency(monthIncome),
        formatCurrency(monthSavings),
        formatCurrency(monthExpenses),
        formatCurrency(monthIncome - monthSavings - monthExpenses)
      ];
    });

    autoTable(doc, {
      startY: yPos,
      head: [['Mes', 'Ingresos', 'Ahorros', 'Gastos', 'Balance']],
      body: monthlyData,
      theme: 'grid',
      headStyles: {
        fillColor: colors.primary,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        textColor: colors.text
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 30, halign: 'left' },
        1: { halign: 'right', cellWidth: 35 },
        2: { halign: 'right', cellWidth: 35 },
        3: { halign: 'right', cellWidth: 35 },
        4: { halign: 'right', cellWidth: 'auto' }
      }
    });

    // Add footer to all pages
    console.log('Adding footers...');
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addFooter(i);
    }

    // Save the PDF
    console.log('Saving PDF...');
    doc.save(`informe-financiero-${selectedYear}.pdf`);
    console.log('✅ PDF generated successfully!');
    
  } catch (error) {
    console.error('❌ Error generating PDF:', error);
    alert(`Error al generar el informe: ${error.message}`);
  }
};

// Keep the old function for backward compatibility if needed elsewhere
export const exportToPdf = async (elementId, filename = 'reporte-finanzas.pdf') => {
  console.warn('exportToPdf is deprecated. Use generateFinancialReport instead.');
};
