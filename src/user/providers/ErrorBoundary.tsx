import { Component, ErrorInfo, ReactNode } from 'react';
import { useToast } from './ToastProvider';

type ErrorBoundaryProps = {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundaryInner extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true } satisfies ErrorBoundaryState;
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
    console.error('ErrorBoundary', error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="max-w-md text-muted-foreground">
            We encountered an unexpected error. Please refresh the page or contact support if the problem persists.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ErrorBoundary({ children, fallback }: Omit<ErrorBoundaryProps, 'onError'>) {
  const toast = useToast();
  return (
    <ErrorBoundaryInner
      fallback={fallback}
      onError={error =>
        toast.push({
          title: 'Unexpected error',
          description: error.message,
          type: 'error',
        })
      }
    >
      {children}
    </ErrorBoundaryInner>
  );
}
