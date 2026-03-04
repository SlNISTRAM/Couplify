import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-8 text-white font-mono">
            <div className="max-w-2xl w-full bg-slate-800 p-6 rounded-2xl border border-rose-500 shadow-2xl">
                <h1 className="text-3xl font-bold text-rose-500 mb-4">💥 Algo salió mal</h1>
                <p className="mb-4 text-slate-300">La aplicación ha encontrado un error crítico.</p>
                <div className="bg-black/50 p-4 rounded-xl overflow-auto max-h-64 mb-6 border border-white/10">
                    <p className="text-rose-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                    <pre className="text-xs text-slate-500 whitespace-pre-wrap">
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </pre>
                </div>
                <button 
                    onClick={() => window.location.reload()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold transition-colors"
                >
                    Recargar Página
                </button>
            </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
