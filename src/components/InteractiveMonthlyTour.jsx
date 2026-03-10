import React, { useState, useEffect } from 'react';
import Joyride, { STATUS } from 'react-joyride';

const InteractiveMonthlyTour = ({ run, setRun, monthName, onTourFinish }) => {
  const [steps] = useState([
    {
      target: 'body',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h3 className="text-xl font-black text-indigo-600 mb-2">¡Bienvenido a {monthName}! 🗓️</h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            Aquí es donde ocurre la magia mes a mes. 
            Te daré un tour rápido para que veas cómo registrar y controlar tu dinero.
          </p>
        </div>
      ),
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '.tour-mensual-disponible',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Tu Billetera Real 💰</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Este bloque muestra cuánto dinero en total (Sueldos + Extras + Acarreo del mes pasado) tienes disponible <b>HOY</b> para gastar de forma segura.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-mensual-ingresos',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Paso 1: Cobranzas 💸</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Cada vez que recibas tu sueldo o un ingreso extra, haz clic en el <span className="text-emerald-500 font-bold">Círculo</span> para marcarlo como "Cobrado".
            Esto inyectará dinero a tu saldo disponible superior.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-mensual-ahorro',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Paso 2: Págate a ti primero 🐷</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Antes de gastar, separa el dinero para sus metas. Aquí puedes apartar tu cuota mensual. ¡Marcarlo como completado aumentará el progreso de su meta global en el Dashboard!
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-mensual-fijos',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Paso 3: Obligaciones 🧾</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            Luz, agua, alquiler. Carga todos tus gastos fijos del mes aquí. A medida que vayas pagándolos, tu "Disponible Total" irá disminuyendo.
          </p>
        </div>
      ),
      placement: 'bottom',
    },
    {
      target: '.tour-mensual-variables',
      content: (
        <div className="text-left text-slate-800 mb-6">
          <h4 className="font-bold mb-2 text-lg">Paso 4: El día a día 🛒</h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            ¿Salida al cine? ¿Cena? Regístralo aquí. Cuida de no sobrepasar el límite de tu "Presupuesto Diario" detallado arriba.
            <br/><br/><b>¡Usa Couplify como un hábito y verás los resultados! 🚀</b>
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
      setRun(false);
      localStorage.setItem('hasSeenCouplifyMonthlyTour', 'true');
      
      if (status === STATUS.FINISHED && onTourFinish) {
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
          overlayColor: 'rgba(15, 23, 42, 0.75)',
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
        last: '¡VAMOS!',
        next: 'SIGUIENTE',
        skip: 'SALTAR'
      }}
    />
  );
};

export default InteractiveMonthlyTour;
