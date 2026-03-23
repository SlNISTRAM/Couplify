import React from 'react';
import { formatCurrency } from '../utils/helpers';
import { PieChart, TrendingUp, BarChart3 } from 'lucide-react';

const COLORS = [
    '#4f46e5', // Indigo
    '#d946ef', // Fuchsia
    '#0ea5e9', // Sky
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#6366f1', // Violet
    '#f43f5e', // Rose
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#84cc16', // Lime
    '#a855f7', // Purple
    '#14b8a6', // Teal
    '#ec4899', // Pink
];

const DonutChart = ({ data, total }) => {
    const [activeIndex, setActiveIndex] = React.useState(null);
    
    // Simple SVG Donut logic
    const segments = [];
    let currentCumulative = 0;
    
    data.forEach((item, index) => {
        const percent = (item.value / total) * 100;
        const startPercent = currentCumulative;
        const endPercent = currentCumulative + percent;
        
        // Convert percentage to circle coordinates
        const x1 = Math.cos(2 * Math.PI * (startPercent / 100));
        const y1 = Math.sin(2 * Math.PI * (startPercent / 100));
        const x2 = Math.cos(2 * Math.PI * (endPercent / 100));
        const y2 = Math.sin(2 * Math.PI * (endPercent / 100));
        
        const largeArcFlag = percent > 50 ? 1 : 0;
        
        // Path for the slice
        const pathData = [
            `M ${x1} ${y1}`,
            `A 1 1 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `L 0 0`,
        ].join(' ');

        segments.push({
            path: pathData,
            color: COLORS[index % COLORS.length],
            name: item.name,
            value: item.value,
            percent: percent.toFixed(1)
        });

        currentCumulative = endPercent;
    });

    const activeSegment = activeIndex !== null ? segments[activeIndex] : null;

    return (
        <div className="flex flex-col md:flex-row items-center space-y-8 md:space-y-0 md:space-x-10 py-6">
            <div className="relative w-48 h-48 group/chart">
                <svg viewBox="-1.1 -1.1 2.2 2.2" className="transform -rotate-90 w-full h-full drop-shadow-xl overflow-visible">
                    {segments.map((s, i) => {
                        const isActive = activeIndex === i;
                        return (
                            <path 
                                key={i} 
                                d={s.path} 
                                fill={s.color} 
                                className={`transition-all duration-300 cursor-pointer ${isActive ? 'scale-[1.05]' : 'opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}
                                onMouseEnter={() => setActiveIndex(i)}
                                onMouseLeave={() => setActiveIndex(null)}
                                onTouchStart={(e) => {
                                    e.preventDefault();
                                    setActiveIndex(i);
                                }}
                            />
                        );
                    })}
                    {/* Inner hole for donut */}
                    <circle 
                        cx="0" 
                        cy="0" 
                        r="0.75" 
                        className="fill-white dark:fill-slate-900 transition-all duration-500" 
                        onMouseEnter={() => setActiveIndex(null)}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none px-4">
                    {activeSegment ? (
                        <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                            <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none mb-1 tracking-widest truncate max-w-[100px]">
                                {activeSegment.name}
                            </span>
                            <span className="text-lg font-black text-indigo-500 tracking-tighter transition-all">
                                {formatCurrency(activeSegment.value)}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 mt-0.5">{activeSegment.percent}%</span>
                        </div>
                    ) : (
                        <div className="animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center">
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase leading-none tracking-widest mb-1">Total</span>
                            <span className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">{formatCurrency(total)}</span>
                        </div>
                    )}
                </div>
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-x-6 gap-y-4">
                {segments.map((s, i) => (
                    <div 
                        key={i} 
                        className={`flex items-center space-x-3 cursor-pointer transition-all duration-200 group/legend ${activeIndex === i ? 'translate-x-1' : 'opacity-70 hover:opacity-100'}`}
                        onMouseEnter={() => {
                            setActiveIndex(i);
                        }}
                        onMouseLeave={() => setActiveIndex(null)}
                        onClick={() => setActiveIndex(activeIndex === i ? null : i)}
                    >
                        <div 
                            className={`w-3 h-3 rounded-full shadow-sm transition-transform duration-300 ${activeIndex === i ? 'scale-125 ring-2 ring-offset-2 ring-indigo-500' : ''}`} 
                            style={{ backgroundColor: s.color }}
                        ></div>
                        <div className="flex flex-col min-w-0">
                            <span className={`text-[10px] font-black uppercase truncate tracking-tight transition-colors ${activeIndex === i ? 'text-indigo-500' : 'text-slate-400 group-hover/legend:text-slate-600 dark:group-hover/legend:text-slate-300'}`}>
                                {s.name}
                            </span>
                            <div className="flex items-baseline space-x-1">
                                <span className={`text-sm font-black tracking-tight ${activeIndex === i ? 'text-slate-800 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {s.percent}%
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const AreaChartTrend = ({ data }) => {
    if (!data || data.length === 0) return null;

    const maxVal = Math.max(...data.map(d => d.total), 1);
    // Rounded max for better visual reference
    const referenceMax = Math.ceil(maxVal / 100) * 100;
    
    const height = 120;
    const width = 400;
    const paddingX = 40; // Increased to fit Y labels
    const paddingY = 20;

    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * (width - 2 * paddingX) + paddingX;
        const y = (height - paddingY) - ((d.total / referenceMax) * (height - 2 * paddingY));
        return `${x},${y}`;
    }).join(' ');

    const areaPoints = `${paddingX},${height - paddingY} ${points} ${width - paddingX},${height - paddingY}`;

    // Reference lines (0, 50%, 100%)
    const refLines = [0, 0.5, 1];

    return (
        <div className="w-full mt-6">
            <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full overflow-visible">
                {/* Gradient Definition */}
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Y-Axis Reference Lines & Labels */}
                {refLines.map((ref, i) => {
                    const y = (height - paddingY) - (ref * (height - 2 * paddingY));
                    const val = Math.round(ref * referenceMax);
                    return (
                        <g key={i} className="opacity-20 dark:opacity-30">
                            <line 
                                x1={paddingX} y1={y} x2={width - paddingX} y2={y} 
                                stroke="currentColor" strokeDasharray="4 4" 
                                className="text-slate-300 dark:text-slate-600"
                            />
                            <text 
                                x={paddingX - 8} y={y + 3} 
                                textAnchor="end" 
                                className="text-[8px] fill-slate-400 dark:fill-slate-500 font-bold"
                            >
                                {val}
                            </text>
                        </g>
                    );
                })}
                
                {/* X-Axis Labels */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * (width - 2 * paddingX) + paddingX;
                    return (
                        <text key={i} x={x} y={height + 5} textAnchor="middle" className="text-[9px] fill-slate-400 dark:fill-slate-300 font-black uppercase tracking-tighter">
                            {d.name?.substring(0, 3) || '???'}
                        </text>
                    );
                })}

                {/* Area */}
                <polyline points={areaPoints} fill="url(#areaGradient)" />
                
                {/* Line */}
                <polyline points={points} fill="none" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                
                {/* Points */}
                {data.map((d, i) => {
                    const x = (i / (data.length - 1)) * (width - 2 * paddingX) + paddingX;
                    const y = (height - paddingY) - ((d.total / referenceMax) * (height - 2 * paddingY));
                    return (
                        <g key={i} className="group/point">
                            <circle cx={x} cy={y} r="4" className="fill-white dark:fill-slate-900" stroke="#6366f1" strokeWidth="2" />
                            {/* Value on hover or always if prominent */}
                            {/* <text x={x} y={y - 8} textAnchor="middle" className="text-[8px] fill-indigo-600 font-bold opacity-0 group-hover/point:opacity-100 transition-opacity">
                                {Math.round(d.total)}
                            </text> */}
                        </g>
                    );
                })}
            </svg>
        </div>
    );
};

const ExpenseCharts = ({ distribution, trend, title = "Análisis de Gastos", subLabel = "A dónde se va el dinero este mes", showTrend = true }) => {
    return (
        <div className={`grid grid-cols-1 ${showTrend ? 'lg:grid-cols-2' : ''} gap-8 mb-10`}>
            {/* Distribution Chart */}
            <div className="app-card p-6 md:p-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                            <PieChart size={20} />
                        </div>
                        <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
                    </div>
                </div>
                <p className="text-slate-400 text-xs font-bold mb-4 uppercase tracking-wider">{subLabel}</p>
                <DonutChart 
                    data={distribution} 
                    total={distribution.reduce((sum, item) => sum + item.value, 0)} 
                />
            </div>

            {/* Trend Chart */}
            {showTrend && (
                <div className="app-card p-6 md:p-8">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                            <div className="p-3 rounded-2xl bg-fuchsia-50 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400">
                                <TrendingUp size={20} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Tendencia</h3>
                        </div>
                        <div className="px-3 py-1 bg-fuchsia-100 text-fuchsia-700 rounded-full text-[10px] font-black uppercase">Último Año</div>
                    </div>
                    <p className="text-slate-400 text-xs font-bold mb-8 uppercase tracking-wider">Gastos variables mes a mes</p>
                    <AreaChartTrend data={trend} />
                </div>
            )}
        </div>
    );
};

export default ExpenseCharts;
