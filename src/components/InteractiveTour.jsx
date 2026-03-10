import React, { useState } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const InteractiveTour = ({ run, setRun, onTourFinish }) => {
  const [steps] = useState([
    {
      target: 'body',
      content: (
        <div>
          <h3 className="text-xl font-black text-indigo-600 dark:text-indigo-400 mb-2">¡Bienvenido a Couplify! 👋</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Tu nueva herramienta para dominar las finanzas en pareja. 
            Déjanos darte un rápido recorrido de 1 minuto para que le saques el jugo al máximo.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-cuentas',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Cuentas y Saldos 💳</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Aquí configuras cuánto dinero tienen en efectivo, sus tarjetas de crédito o cuentas bancarias. 
            Mantén todo al día desde "Configurar Cuentas".
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-metas',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">El sueño juntos 🎯</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Un depa nuevo? ¿La boda? ¿Un viaje? Aquí pueden crear sus metas de ahorro compartidas. 
            El progreso se irá llenando automáticamente al aportar.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-fijos',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Tus Obligaciones 📅</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Registra tu alquiler, luz, agua, o cuotas. Todo lo que <b>debes</b> pagar este mes va aquí. 
            Al pagarlos, tu presupuesto disponible bajará y tu saldo en cuenta se ajustará.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-variable',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Gastos Hormiga ☕</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Ese café extra, la salida al cine o las compras del súper. Regístralos aquí.
            Couplify se encargará de mostrarte a final de mes en qué categoría gastaron más.
          </p>
        </div>
      ),
      placement: 'top',
    },
    {
      target: '.tour-ia',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Tu Asesor Financiero 🤖</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Dudas si pueden pagar esa salida el finde? Pídele a nuestra Inteligencia Artificial que 
            lea sus datos y les dé el mejor consejo financiero al instante.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-reporte',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Reportes Mensuales 📊</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Si necesitan ver cómo les fue, siempre pueden generar un reporte PDF muy bonito con la distribución de sus finanzas anuales aquí.
            <br/><br/><b>¡Eso es todo! ¡A ahorrar! 🎉</b>
          </p>
        </div>
      ),
      placement: 'bottom',
    }
  ]);

  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRun(false); // Detiene el tour
      localStorage.setItem('hasSeenCouplifyTour', 'true'); // Marca que ya lo vió
      
      // Auto-navigate to Monthly view if they actually finished the tour (didn't skip)
      if (status === STATUS.FINISHED && onTourFinish) {
        // Small delay to let the tooltip closing animation finish
        setTimeout(() => {
          onTourFinish();
        }, 300);
      }
    }
  };

  return (
    <Joyride
      callback={handleJoyrideCallback}
      continuous
      hideCloseButton
      run={run}
      scrollToFirstStep
      showProgress
      showSkipButton
      steps={steps}
      styles={{
        options: {
          arrowColor: '#ffffff',
          backgroundColor: '#ffffff',
          overlayColor: 'rgba(15, 23, 42, 0.75)', // slate-900 con 75% opacidad
          primaryColor: '#4f46e5',
          textColor: '#1e293b',
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: 'left',
        },
        tooltipFooter: {
          marginTop: '24px',
        },
        tooltip: {
          borderRadius: '32px',
          padding: '32px 24px',
        },
        tooltipContent: {
          padding: '10px',
        },
        spotlight: {
          borderRadius: '24px',
        },
        buttonNext: {
          backgroundColor: '#4f46e5',
          color: '#ffffff',
          borderRadius: '16px',
          padding: '10px 20px',
          fontWeight: '900',
          textTransform: 'uppercase',
          fontSize: '11px',
          letterSpacing: '0.05em',
          outline: 'none',
        },
        buttonBack: {
          marginRight: 10,
          color: '#64748b',
          fontWeight: 'bold',
          fontSize: '11px',
        },
        buttonSkip: {
          color: '#94a3b8',
          fontSize: '11px',
          fontWeight: 'bold',
        }
      }}
      locale={{
        back: 'ATRÁS',
        close: 'CERRAR',
        last: '¡EMPEZAR!',
        next: 'SIGUIENTE',
        skip: 'SALTAR'
      }}
    />
  );
};

export default InteractiveTour;
