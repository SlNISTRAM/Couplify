import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Bot, X, Sparkles, TrendingDown, TrendingUp, AlertCircle, CheckCircle2, ChevronRight, Send, MessageCircle, ArrowLeft } from 'lucide-react';
import { getFinancialInsights, getAiChatResponse } from '../services/aiAdvisor';
import { useFinance } from '../hooks/useFinance';

const AiAssistant = ({ isOpen, onClose, currentYear, currentMonthIndex, userName }) => {
  const { monthsData } = useFinance();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState([]);
  
  // Chat State
  const [chatMode, setChatMode] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Helper to format markdown bold (**text**) to HTML
  const formatMarkdown = (text) => {
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setChatMode(false);
    try {
        const results = await getFinancialInsights(monthsData, currentYear, currentMonthIndex, userName);
        setInsights(results);
    } catch (error) {
        console.error("Analysis Failed:", error);
    } finally {
        setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || isSending) return;
    
    const userMessage = userInput.trim();
    setUserInput('');
    
    // Add user message to history
    const newHistory = [...chatHistory, { role: 'user', content: userMessage }];
    setChatHistory(newHistory);
    setIsSending(true);

    try {
        const aiResponse = await getAiChatResponse(userMessage, chatHistory, monthsData, currentYear, currentMonthIndex, userName);
        setChatHistory([...newHistory, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
        console.error("Chat error:", error);
        setChatHistory([...newHistory, { role: 'assistant', content: 'Lo siento, hubo un error. ¿Puedes intentar de nuevo?' }]);
    } finally {
        setIsSending(false);
    }
  };

  const startChat = () => {
    setChatMode(true);
    setInsights([]);
    if (chatHistory.length === 0) {
        setChatHistory([{
            role: 'assistant',
            content: `¡Hola ${userName || 'invitado'}! 👋 Soy FinanSmart, tu asesor financiero personal. Puedo ayudarte con consultas sobre tus gastos, ahorros y metas. ¿En qué te puedo ayudar hoy?`
        }]);
    }
  };

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Aggressive scroll reset
  const contentRef = React.useRef(null);
  React.useEffect(() => {
    if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [chatHistory, insights, isAnalyzing]);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-in-up border border-white/20 dark:border-slate-800 max-h-[90vh] md:max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {(chatMode || insights.length > 0) && (
                <button
                  onClick={() => { setChatMode(false); setInsights([]); setChatHistory([]); }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
                  title="Volver al menú"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <div className="p-3 bg-brand-primary rounded-2xl shadow-lg shadow-brand-primary/20">
                <Bot className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-white">Asistente AI</h3>
                <p className="text-xs font-bold text-brand-primary uppercase tracking-widest">Consejero Financiero</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"
            >
              <X size={20} />
            </button>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {chatMode ? 'Pregúntame lo que necesites sobre tus finanzas.' : `Hola ${userName || 'invitado'}, analizo tus números para ayudarte a optimizar tus ahorros.`}
          </p>
        </div>

        {/* Content Area */}
        <div ref={contentRef} className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50 dark:bg-slate-900/50">
          {!chatMode && insights.length === 0 && !isAnalyzing ? (
            <div className="text-center py-6">
              <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                <Sparkles className="text-brand-primary animate-pulse" size={32} />
              </div>
              <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">¿Qué necesitas?</h4>
              <p className="text-slate-500 text-sm mb-8 px-4">Elige cómo quieres que te ayude:</p>
              
              <div className="space-y-3">
                <button 
                  onClick={handleAnalyze}
                  className="btn-primary w-full py-4 text-lg flex items-center justify-center space-x-2 shadow-xl shadow-brand-primary/20"
                >
                  <Sparkles size={20} />
                  <span>Analizar mi Mes</span>
                  <ChevronRight size={20} />
                </button>
                
                <button 
                  onClick={startChat}
                  className="w-full py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl font-bold border-2 border-slate-200 dark:border-slate-700 hover:border-brand-primary dark:hover:border-brand-primary transition-all flex items-center justify-center space-x-2"
                >
                  <MessageCircle size={20} />
                  <span>Hacer una Consulta</span>
                </button>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="space-y-6 py-10">
              <div className="flex flex-col items-center justify-center">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-100 dark:border-slate-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-20 h-20 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
                    <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-brand-primary" size={28} />
                 </div>
                 <p className="mt-6 text-sm font-bold text-slate-400 animate-pulse text-center px-8">
                    Conectando con Google Gemini...<br/>
                    <span className="text-xs font-normal opacity-70">Analizando patrones de gasto y ahorro</span>
                 </p>
              </div>
            </div>
          ) : chatMode ? (
            <div className="space-y-4 pb-4">
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-br-sm selection:bg-white/30 selection:text-white' 
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-700 rounded-bl-sm'
                  }`}>
                    <p 
                      className="text-sm leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(msg.content) }}
                    />
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {insights.map((insight, idx) => (
                <div 
                  key={idx}
                  className="bg-white dark:bg-slate-800 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50 flex items-start space-x-4 animate-fade-in"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                    insight.type === 'success' ? 'bg-emerald-100/50 text-emerald-600' : 
                    insight.type === 'danger' ? 'bg-rose-100/50 text-rose-600' : 
                    insight.type === 'warning' ? 'bg-amber-100/50 text-amber-600' : 'bg-indigo-100/50 text-indigo-600'
                  }`}>
                    {insight.type === 'success' && <CheckCircle2 size={20} />}
                    {(insight.type === 'danger' || insight.type === 'warning') && <AlertCircle size={20} />}
                    {insight.type === 'info' && <TrendingUp size={20} />}
                  </div>
                  <div>
                    <h5 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-tight mb-1">{insight.title}</h5>
                    <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 flex gap-2">
                 <button 
                  onClick={handleAnalyze}
                  className="flex-1 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-sm hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                  Actualizar Análisis
                </button>
                <button 
                  onClick={startChat}
                  className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 hover:border-brand-primary transition-all text-sm active:scale-95"
                >
                  Hacer Consulta
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Chat Input (only in chat mode) */}
        {chatMode && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
            <div className="flex space-x-2">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Escribe tu pregunta..."
                className="flex-1 glass-input py-3 text-sm"
                disabled={isSending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isSending}
                className="p-3 bg-brand-primary text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AiAssistant;
