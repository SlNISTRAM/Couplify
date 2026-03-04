import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';

const DateTimeSelector = ({ value, onChange, color = 'indigo', size = 'md', showLabel = true }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [currentDate, setCurrentDate] = useState(value ? new Date(value) : new Date());
  
  // Color configuration
  const theme = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-100 dark:border-indigo-900/40',
      active: 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20',
      ring: 'ring-indigo-500'
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-900/40',
      active: 'bg-violet-600 text-white shadow-lg shadow-violet-600/20',
      ring: 'ring-violet-500'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/40',
      active: 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20',
      ring: 'ring-emerald-500'
    }
  }[color] || theme.indigo;

  const isToday = (d) => {
    const today = new Date();
    return d.getDate() === today.getDate() && 
           d.getMonth() === today.getMonth() && 
           d.getFullYear() === today.getFullYear();
  };

  const isYesterday = (d) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return d.getDate() === yesterday.getDate() && 
           d.getMonth() === yesterday.getMonth() && 
           d.getFullYear() === yesterday.getFullYear();
  };

  const handleQuickSelect = (type) => {
    const newDate = new Date();
    if (type === 'yesterday') {
      newDate.setDate(newDate.getDate() - 1);
      newDate.setHours(0, 0, 0, 0); // Yesterday usually implies date only
    }
    // 'today' button keeps current time for "Right Now" feel
    
    onChange(newDate.toISOString());
    setCurrentDate(newDate);
    setShowPicker(false);
  };

  const handleTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(':');
    const newDate = new Date(currentDate);
    newDate.setHours(parseInt(hours), parseInt(minutes));
    onChange(newDate.toISOString());
    setCurrentDate(newDate);
  };

  const handleDateChange = (day) => {
    const newDate = new Date(currentDate);
    newDate.setDate(day);
    newDate.setHours(0, 0, 0, 0); // New dates from calendar default to no-time
    onChange(newDate.toISOString());
    setCurrentDate(newDate);
  };

  // Simplified calendar logic
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  
  const formatDateDisplay = () => {
    if (!value) return "Momento actual";
    const d = new Date(value);
    const hasTime = d.getHours() !== 0 || d.getMinutes() !== 0;
    
    const timeStr = hasTime ? `, ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}` : '';
    
    if (isToday(d)) return `Hoy${timeStr}`;
    if (isYesterday(d)) return `Ayer${timeStr}`;
    
    return d.toLocaleString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      ...(hasTime ? { hour: '2-digit', minute: '2-digit' } : {})
    });
  };

  if (!showLabel) {
    return (
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setShowPicker(true)}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-all border ${
            value 
              ? theme.bg + ' ' + theme.border + ' ' + theme.text 
              : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'
          } ${size === 'xs' ? 'h-6 px-1.5' : ''}`}
        >
          <Clock size={size === 'xs' ? 10 : 12} />
          <span className={`${size === 'xs' ? 'text-[8px]' : 'text-[9px]'} font-black uppercase tracking-tighter whitespace-nowrap`}>
            {value ? formatDateDisplay() : 'Definir'}
          </span>
        </button>

        {showPicker && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 animate-fade-in" onClick={() => setShowPicker(false)}></div>
            <div className="relative w-full max-w-[320px] bg-white dark:bg-slate-900 rounded-[32px] border border-white/20 shadow-2xl overflow-hidden animate-scale-in p-6 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Seleccionar Fecha</h3>
                <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={20} />
                </button>
              </div>

              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                  {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                </h4>
                <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2">
                  <input 
                    type="time"
                    value={`${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`}
                    onChange={handleTimeChange}
                    className="bg-transparent border-none p-0 text-sm font-black text-slate-700 dark:text-slate-200 focus:ring-0 w-28"
                  />
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                  <span key={d} className="text-[10px] font-black text-slate-400 text-center py-2 uppercase opacity-50">{d}</span>
                ))}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => <div key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = currentDate.getDate() === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDateChange(day)}
                      className={`aspect-square rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                        isSelected ? theme.active : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setShowPicker(false)}
                className={`w-full py-4 ${theme.active} rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl`}
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleQuickSelect('today')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
            value && isToday(new Date(value)) && !showPicker
              ? theme.active + ' border-transparent'
              : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => handleQuickSelect('yesterday')}
          className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
            value && isYesterday(new Date(value)) && !showPicker
              ? theme.active + ' border-transparent'
              : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          Ayer
        </button>
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
            showPicker || (value && !isToday(new Date(value)) && !isYesterday(new Date(value)))
              ? theme.active + ' border-transparent'
              : 'bg-white dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarIcon size={12} />
          <span>{showPicker ? 'Cerrar' : value ? formatDateDisplay() : 'Calendario'}</span>
        </button>
      </div>

      {showPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-950/80 animate-fade-in"
            onClick={() => setShowPicker(false)}
          ></div>
          
          {/* Modal Content */}
          <div className="relative w-full max-w-[320px] bg-white dark:bg-slate-900 rounded-[32px] border border-white/20 shadow-2xl overflow-hidden animate-scale-in p-6 space-y-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Seleccionar Fecha</h3>
              <button onClick={() => setShowPicker(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>

            {/* Header Month */}
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">
                {currentDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
              </h4>
              <div className="flex items-center space-x-2">
                <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2">
                  <input 
                    type="time"
                    value={`${currentDate.getHours().toString().padStart(2, '0')}:${currentDate.getMinutes().toString().padStart(2, '0')}`}
                    onChange={handleTimeChange}
                    className="bg-transparent border-none p-0 text-sm font-black text-slate-700 dark:text-slate-200 focus:ring-0 w-28"
                  />
                </div>
              </div>
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1">
              {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-400 text-center py-2 uppercase opacity-50">{d}</span>
              ))}
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const isSelected = currentDate.getDate() === day;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDateChange(day)}
                    className={`aspect-square rounded-xl text-xs font-bold flex items-center justify-center transition-all ${
                      isSelected 
                        ? theme.active 
                        : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className={`w-full py-4 ${theme.active} rounded-2xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-xl`}
            >
              Confirmar Fecha
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateTimeSelector;
