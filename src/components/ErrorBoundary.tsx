import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  private handleHome = () => {
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 via-background to-orange-50 dark:from-red-950/10 dark:via-background dark:to-orange-950/10">
          <Card className="max-w-2xl w-full">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Oops! Something went wrong</h1>
                <p className="text-muted-foreground">
                  We're sorry for the inconvenience. The error has been logged and we'll fix it soon.
                </p>
              </div>

              {/* Error Details (only in dev) */}
              {import.meta.env.DEV && this.state.error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-900">
                  <p className="font-semibold text-red-600 mb-2">Error Details:</p>
                  <pre className="text-xs overflow-auto max-h-48 text-red-800 dark:text-red-200">
                    {this.state.error.toString()}
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleHome}
                  className="flex-1"
                  size="lg"
                >
                  <Home className="w-5 h-5 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              {/* Contact Support */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                Need help? Contact us at{' '}
                <a href="mailto:support@coachos.com" className="text-primary hover:underline">
                  support@coachos.com
                </a>
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

/**
 * Smaller error display for inline errors
 */
export function InlineError({ 
  error, 
  retry 
}: { 
  error: string | Error; 
  retry?: () => void;
}) {
  return (
    <Card className="border-red-200 dark:border-red-900">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-600 mb-1">Error</h3>
            <p className="text-sm text-muted-foreground">
              {typeof error === 'string' ? error : error.message}
            </p>
            {retry && (
              <Button
                onClick={retry}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
