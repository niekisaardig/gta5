import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  declare props: Readonly<Props>;
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h2 className="text-xl font-black text-white">Er is een fout opgetreden</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              De applicatie kon niet worden geladen of er is een opslagfout opgetreden in de browser.
            </p>
            {this.state.error && (
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-left font-mono text-[11px] text-red-300 overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <div className="pt-2 flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
              >
                Opnieuw Proberen
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold transition"
              >
                Cache Wis &amp; Herstart
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
