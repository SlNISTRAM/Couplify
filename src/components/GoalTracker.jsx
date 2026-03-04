import React, { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import { formatCurrency, formatCompactCurrency } from '../utils/helpers';
import { useFinance } from '../hooks/useFinance';
import { 
  Heart, Home, Target, Car, Plane, GraduationCap, Wallet, 
  Smartphone, Briefcase, Palmtree, Zap, ShoppingBag, 
  Coffee, Camera, Music, Dumbbell, Star, MapPin, 
  Pencil, X, Check, Lock, Unlock, Calendar, TrendingUp
} from 'lucide-react';

const ICON_MAP = {
  Home: <Home size={20} />,
  Target: <Target size={20} />,
  Heart: <Heart size={20} />,
  Car: <Car size={20} />,
  Plane: <Plane size={20} />,
  GraduationCap: <GraduationCap size={20} />,
  Wallet: <Wallet size={20} />,
  Smartphone: <Smartphone size={20} />,
  Briefcase: <Briefcase size={20} />,
  Palmtree: <Palmtree size={20} />,
  Zap: <Zap size={20} />,
  ShoppingBag: <ShoppingBag size={20} />,
  Coffee: <Coffee size={20} />,
  Camera: <Camera size={20} />,
  Music: <Music size={20} />,
  Dumbbell: <Dumbbell size={20} />,
  Star: <Star size={20} />,
  MapPin: <MapPin size={20} />
};

const COLOR_PRESETS = [
  { id: 'indigo', color: 'from-blue-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
  { id: 'rose', color: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-600' },
  { id: 'emerald', color: 'from-emerald-400 to-teal-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
  { id: 'amber', color: 'from-amber-400 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' },
  { id: 'violet', color: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600' },
  { id: 'cyan', color: 'from-cyan-400 to-blue-500', bg: 'bg-cyan-50', text: 'text-cyan-600' },
  { id: 'slate', color: 'from-slate-600 to-slate-800', bg: 'bg-slate-100', text: 'text-slate-800' }
];

const SimulatorCard = ({ goal }) => {
  const [extraSavings, setExtraSavings] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);

  // If no average monthly savings, show a message
  if (!goal.avgMonthly || goal.avgMonthly <= 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 text-center">
        <span className="text-[10px] font-bold text-slate-400">Comienza a ahorrar para activar el simulador</span>
      </div>
    );
  }

  const remaining = goal.target - goal.saved;
  
  // If goal is already completed
  if (remaining <= 0) {
    return (
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-3 border border-emerald-200 dark:border-emerald-800 text-center">
        <span className="text-[10px] font-bold text-emerald-600">🎉 ¡Meta completada!</span>
      </div>
    );
  }

  const currentMonths = Math.ceil(remaining / goal.avgMonthly);
  const newMonthlyRate = goal.avgMonthly + extraSavings;
  const simulatedMonths = newMonthlyRate > 0 ? Math.ceil(remaining / newMonthlyRate) : currentMonths;
  const diff = currentMonths - simulatedMonths;

  const getSimulatedDate = (months) => {
    if (!months || months <= 0 || !isFinite(months)) return '---';
    const date = new Date();
    date.setMonth(date.getMonth() + months);
    const monthName = date.toLocaleString('es-ES', { month: 'short' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${date.getFullYear()}`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/40 dark:to-slate-800/20 rounded-2xl p-3 border border-slate-100 dark:border-slate-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between group/toggle"
      >
        <div className="flex items-center space-x-2">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">
            Simulador "¿Qué pasaría si...?"
          </span>
        </div>
        <div className="flex items-center space-x-2">
          {extraSavings > 0 && (
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
              ¡{diff} meses antes!
            </span>
          )}
          <span className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>▼</span>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-3 animate-fade-in">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                Ahorro extra mensual:
              </span>
              <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                +S/ {extraSavings}
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="1000"
              step="50"
              value={extraSavings}
              onChange={(e) => setExtraSavings(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            
            <div className="flex justify-between text-[9px] text-slate-400">
              <span>S/ 0</span>
              <span>S/ 500</span>
              <span>S/ 1,000</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white dark:bg-slate-900/40 rounded-xl p-2 border border-slate-200 dark:border-slate-700">
              <div className="text-[9px] font-bold text-slate-400 uppercase mb-1">Actual</div>
              <div className="text-xs font-black text-slate-700 dark:text-slate-200">{getSimulatedDate(currentMonths)}</div>
              <div className="text-[9px] text-slate-500">{currentMonths} meses</div>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2 border border-emerald-200 dark:border-emerald-800">
              <div className="text-[9px] font-bold text-emerald-600 uppercase mb-1">Con +S/ {extraSavings}</div>
              <div className="text-xs font-black text-emerald-700 dark:text-emerald-400">{getSimulatedDate(simulatedMonths)}</div>
              <div className="text-[9px] text-emerald-600">{simulatedMonths} meses</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GoalTracker = ({ stats }) => {
  const { updateGoalMetadata } = useFinance();
  const [editingGoal, setEditingGoal] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', icon: '', target: '', isLocked: false, color: '', bg: '', text: '' });
  
  // Modal State
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: '',
    onConfirm: () => {},
    type: 'warning'
  });

  const closeConfirm = () => setConfirmConfig(prev => ({ ...prev, isOpen: false }));

  if (!stats || !stats.depa || !stats.boda) return <div className="p-8 text-center text-slate-400">Calculando metas...</div>;
  
  const handleEdit = (id, goal) => {
    if (goal.isLocked) return;
    setEditingGoal(id);
    setEditForm({ 
      name: goal.name, 
      icon: goal.iconName, 
      target: goal.target, 
      isLocked: goal.isLocked,
      color: goal.color,
      bg: goal.bg,
      text: goal.textColor
    });
  };

  const saveEdit = () => {
    updateGoalMetadata(editingGoal, editForm);
    setEditingGoal(null);
  };

  const goals = [
    { 
        id: 'depa', 
        name: stats.depa.name, 
        iconName: stats.depa.icon || 'Target',
        icon: ICON_MAP[stats.depa.icon || 'Target'], 
        color: stats.depa.color || 'from-blue-500 to-indigo-600',
        bg: stats.depa.bg || 'bg-indigo-50',
        textColor: stats.depa.text || 'text-indigo-600',
        saved: stats.depa.saved,
        target: stats.depa.target,
        isLocked: stats.depa.isLocked
    },
    { 
        id: 'boda', 
        name: stats.boda.name, 
        iconName: stats.boda.icon || 'Star',
        icon: ICON_MAP[stats.boda.icon || 'Star'], 
        color: stats.boda.color || 'from-rose-500 to-pink-600',
        bg: stats.boda.bg || 'bg-rose-50',
        textColor: stats.boda.text || 'text-rose-600',
        saved: stats.boda.saved,
        target: stats.boda.target,
        isLocked: stats.boda.isLocked
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {goals.map(goal => {
        const percentage = Math.min(Math.round((goal.saved / goal.target) * 100), 100);
        
        return (
          <div key={goal.id} className="app-card p-6 overflow-hidden relative group">
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="flex items-center space-x-3">
                <button 
                  onClick={() => !goal.isLocked && handleEdit(goal.id, goal)}
                  className={`p-3 rounded-2xl ${goal.bg} ${goal.textColor} dark:bg-slate-800 dark:text-slate-100 ${!goal.isLocked ? 'hover:scale-110 active:scale-95 transition-all shadow-sm ring-1 ring-slate-100 dark:ring-slate-700' : 'cursor-default opacity-80'}`}
                >
                  {goal.isLocked ? <div className="relative">{goal.icon}</div> : goal.icon}
                </button>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{goal.name}</h3>
                    {!goal.isLocked ? (
                      <button onClick={() => handleEdit(goal.id, goal)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-300 hover:text-indigo-500">
                        <Pencil size={12} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => {
                          setConfirmConfig({
                            isOpen: true,
                            title: 'Desbloquear Meta',
                            message: `¿Quieres desbloquear "${goal.name}" para poder editar su nombre, icono o monto?`,
                            confirmText: 'Sí, desbloquear',
                            type: 'info',
                            onConfirm: () => {
                              updateGoalMetadata(goal.id, { isLocked: false });
                            }
                          });
                        }}
                        className="p-1 text-slate-300 hover:text-indigo-500 transition-colors active:scale-95"
                      >
                        <Lock size={12} className="text-indigo-400" />
                      </button>
                    )}
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-2xl font-black text-slate-800 dark:text-white">{formatCompactCurrency(goal.saved)}</span>
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">/ {formatCompactCurrency(goal.target)}</span>
                  </div>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-2xl ${goal.bg} ${goal.textColor} font-black text-xl dark:bg-slate-800 dark:text-white`}>
                {percentage}%
              </div>
            </div>

            {/* Progress Bar */}
            <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative z-10">
              <div 
                className={`h-full bg-gradient-to-r ${goal.color} transition-all duration-1000 ease-out`}
                style={{ width: `${percentage}%` }}
              >
                <div className="w-full h-full opacity-30 animate-pulse bg-white"></div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-slate-50 dark:border-slate-800/50">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center">
                        <Calendar size={12} className="mr-1" /> Proyección
                    </span>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        {goal.avgMonthly > 0 ? (() => {
                            const remaining = goal.target - goal.saved;
                            const months = Math.ceil(remaining / goal.avgMonthly);
                            if (months <= 0) return '¡Meta completada!';
                            const date = new Date();
                            date.setMonth(date.getMonth() + months);
                            const monthName = date.toLocaleString('es-ES', { month: 'long' });
                            return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${date.getFullYear()}`;
                        })() : 'Sin aportes suficientes'}
                    </span>
                </div>

                <SimulatorCard goal={goal} />
            </div>

            {/* Subtle BG Graphic */}
            <div className={`absolute -right-4 -bottom-4 opacity-10 ${goal.textColor}`}>
                {React.cloneElement(goal.icon, { size: 120 })}
            </div>
          </div>
        );
      })}

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setEditingGoal(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-fade-in-up border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tighter">Personalizar Meta</h2>
              <button onClick={() => setEditingGoal(null)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Nombre</label>
                  <input 
                    type="text"
                    value={editForm.name}
                    onChange={e => setEditForm({...editForm, name: e.target.value})}
                    className="w-full glass-input p-4 text-xs font-bold"
                    placeholder="Ej: Mi primera casa"
                  />
                </div>
                <div className="w-32">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Monto Meta</label>
                  <input 
                    type="number"
                    value={editForm.target}
                    onChange={e => setEditForm({...editForm, target: e.target.value})}
                    className="w-full glass-input p-4 text-xs font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1">Tema de Color</label>
                <div className="flex flex-wrap gap-2 px-1">
                  {COLOR_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => setEditForm({...editForm, color: preset.color, bg: preset.bg, text: preset.text})}
                      className={`w-8 h-8 rounded-full bg-gradient-to-r ${preset.color} transition-all ring-offset-2 dark:ring-offset-slate-900 ${
                        editForm.color === preset.color ? 'ring-2 ring-indigo-500 scale-110' : 'opacity-60 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block px-1 flex justify-between">
                  <span>Icono Representativo</span>
                  <button 
                    onClick={() => setEditForm({...editForm, isLocked: !editForm.isLocked})}
                    className={`flex items-center space-x-1 transition-colors ${editForm.isLocked ? 'text-indigo-600' : 'text-slate-300'}`}
                  >
                    {editForm.isLocked ? <Lock size={10} /> : <Unlock size={10} />}
                    <span className="text-[8px] font-black">{editForm.isLocked ? 'FIJADO' : 'LIBRE'}</span>
                  </button>
                </label>
                <div className="grid grid-cols-5 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-3xl max-h-48 overflow-y-auto no-scrollbar border border-slate-100 dark:border-slate-700/50">
                  {Object.entries(ICON_MAP).map(([name, icon]) => (
                    <button
                      key={name}
                      onClick={() => setEditForm({...editForm, icon: name})}
                      className={`aspect-square flex items-center justify-center rounded-2xl transition-all ${
                        editForm.icon === name 
                        ? 'bg-indigo-600 text-white shadow-lg scale-110' 
                        : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 border border-slate-100 dark:border-slate-700'
                      }`}
                    >
                      {React.cloneElement(icon, { size: 18 })}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={saveEdit}
                className="w-full py-4 bg-indigo-600 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-sm flex items-center justify-center space-x-2"
              >
                <Check size={18} />
                <span>Guardar Cambios</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Global Confirm Modal */}
      <ConfirmModal 
        isOpen={confirmConfig.isOpen}
        onClose={closeConfirm}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        type={confirmConfig.type}
      />
    </div>
  );
};

export default GoalTracker;
