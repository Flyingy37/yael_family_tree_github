/**
 * ErrorBoundary — catches render errors in child component trees.
 */
import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-4 text-red-600">
            <strong>Something went wrong.</strong>
            <pre className="mt-2 text-xs text-red-400 whitespace-pre-wrap">
              {this.state.error?.message}
            </pre>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
