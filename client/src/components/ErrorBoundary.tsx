import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary caught error]', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-obsidian-950 text-slate-200 flex flex-col items-center justify-center p-6 select-none font-sans">
          <div className="max-w-md w-full bg-obsidian-900 border border-obsidian-700/80 rounded-2xl p-8 shadow-2xl flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-5 shadow-lg">
              <AlertCircle className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Workstation Notice</h2>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              An unexpected interface error occurred during rendering. You can reload the workstation or reset to default state.
            </p>

            {this.state.error && (
              <div className="w-full bg-obsidian-950 border border-obsidian-800 rounded-lg p-3 mb-5 text-left overflow-x-auto text-[11px] font-mono text-rose-300">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <button
              onClick={this.handleReset}
              className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-glow-blue transition active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reload Workstation</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
