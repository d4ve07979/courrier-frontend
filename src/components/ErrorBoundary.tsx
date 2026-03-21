import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

// Vrai Error Boundary React
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('❌ Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage error={this.state.error?.message || 'Une erreur est survenue'} />;
    }

    return this.props.children;
  }
}

interface ErrorMessageProps {
  error: string;
  onRetry?: () => void;
  showBackendHelp?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  error, 
  onRetry, 
  showBackendHelp = true 
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
        
        <h3 className="text-xl font-semibold text-white mb-2">
          Erreur de connexion
        </h3>
        
        <p className="text-slate-400 mb-6">
          {error}
        </p>

        {showBackendHelp && (
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center gap-2 mb-3">
              <Settings className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-blue-400">
                Vérifications à effectuer
              </span>
            </div>
            <ul className="text-sm text-slate-300 space-y-2">
              <li>• Le backend Spring Boot est-il démarré sur le port 8089 ?</li>
              <li>• La base de données est-elle accessible ?</li>
              <li>• L'utilisateur admin a-t-il été créé dans la base ?</li>
              <li>• Les tables sont-elles correctement initialisées ?</li>
            </ul>
          </div>
        )}

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Réessayer
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;