import React, { useState, useEffect, useCallback } from 'react';
import { Calculator, X, Delete, Minus, Plus, Divide, Hash } from 'lucide-react';

const FloatingCalculator = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [display, setDisplay] = useState('0');
    const [equation, setEquation] = useState('');
    const [shouldReset, setShouldReset] = useState(false);

    const handleNumber = useCallback((num) => {
        setDisplay(prev => {
            if (prev === '0' || shouldReset) {
                setShouldReset(false);
                return num;
            }
            return prev + num;
        });
    }, [shouldReset]);

    const handleOperator = useCallback((op) => {
        setEquation(display + ' ' + op + ' ');
        setShouldReset(true);
    }, [display]);

    const calculate = useCallback(() => {
        try {
            // eslint-disable-next-line no-eval
            const result = eval(equation + display);
            setDisplay(String(Number(result.toFixed(2))));
            setEquation('');
            setShouldReset(true);
        } catch (e) {
            setDisplay('Error');
            setEquation('');
        }
    }, [equation, display]);

    const clear = useCallback(() => {
        setDisplay('0');
        setEquation('');
    }, []);

    const backspace = useCallback(() => {
        setDisplay(prev => {
            if (prev.length > 1) return prev.slice(0, -1);
            return '0';
        });
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key >= '0' && e.key <= '9') handleNumber(e.key);
            if (['+', '-', '*', '/'].includes(e.key)) {
                e.preventDefault();
                handleOperator(e.key);
            }
            if (e.key === 'Enter' || e.key === '=') {
                e.preventDefault();
                calculate();
            }
            if (e.key === 'Backspace') {
                e.preventDefault();
                backspace();
            }
            if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
                clear();
            }
            if (e.key === '.') handleNumber('.');
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, handleNumber, handleOperator, calculate, clear, backspace]);

    const Button = ({ children, onClick, className = "" }) => (
        <button 
            onClick={onClick}
            className={`h-12 landscape:h-9 flex items-center justify-center rounded-xl landscape:rounded-lg font-bold landscape:text-xs transition-all active:scale-90 ${className}`}
        >
            {children}
        </button>
    );

    return (
        <div className="fixed bottom-32 landscape:bottom-24 md:bottom-8 right-6 landscape:right-2 z-[100] flex flex-col items-end">
            {/* Calculator Panel */}
            {isOpen && (
                <div className="mb-4 w-72 landscape:w-60 glass-panel p-4 landscape:p-3 rounded-3xl landscape:rounded-2xl shadow-2xl border border-white/20 animate-fade-in-up landscape:max-h-[85vh] landscape:overflow-y-auto no-scrollbar">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculadora</span>
                        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Display */}
                    <div className="bg-slate-900/10 dark:bg-white/5 p-4 landscape:p-2 rounded-2xl landscape:rounded-xl mb-4 landscape:mb-2 text-right overflow-hidden transition-all">
                        <div className="text-[10px] landscape:text-[8px] text-slate-400 font-mono h-4 truncate">{equation}</div>
                        <div className="text-2xl landscape:text-lg font-black text-slate-800 dark:text-white truncate tracking-tighter">{display}</div>
                    </div>

                    {/* Buttons Grid */}
                    <div className="grid grid-cols-4 gap-2 landscape:gap-1.5">
                        <Button onClick={clear} className="bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400 col-span-2">AC</Button>
                        <Button onClick={backspace} className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <Delete size={18} />
                        </Button>
                        <Button onClick={() => handleOperator('/')} className="bg-indigo-500 text-white shadow-md shadow-indigo-500/20">
                            <Divide size={18} />
                        </Button>

                        {[7, 8, 9].map(n => (
                            <Button key={n} onClick={() => handleNumber(String(n))} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700">
                                {n}
                            </Button>
                        ))}
                        <Button onClick={() => handleOperator('*')} className="bg-indigo-500 text-white shadow-md shadow-indigo-500/20">×</Button>

                        {[4, 5, 6].map(n => (
                            <Button key={n} onClick={() => handleNumber(String(n))} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700">
                                {n}
                            </Button>
                        ))}
                        <Button onClick={() => handleOperator('-')} className="bg-indigo-500 text-white shadow-md shadow-indigo-500/20">
                            <Minus size={18} />
                        </Button>

                        {[1, 2, 3].map(n => (
                            <Button key={n} onClick={() => handleNumber(String(n))} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700">
                                {n}
                            </Button>
                        ))}
                        <Button onClick={() => handleOperator('+')} className="bg-indigo-500 text-white shadow-md shadow-indigo-500/20">
                            <Plus size={18} />
                        </Button>

                        <Button onClick={() => handleNumber('0')} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 col-span-2">0</Button>
                        <Button onClick={() => handleNumber('.')} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700">.</Button>
                        <Button onClick={calculate} className="bg-brand-primary text-white shadow-lg shadow-brand-primary/30">=</Button>
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'bg-rose-500 rotate-90' : 'bg-brand-primary'}`}
            >
                {isOpen ? <X size={28} /> : <Calculator size={28} />}
            </button>
        </div>
    );
};

export default FloatingCalculator;
