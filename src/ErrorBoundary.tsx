import React, { ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // @ts-ignore
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, background: '#fee', color: '#c00', minHeight: '100vh', fontFamily: 'monospace' }}>
          <h2>Application Crashed!</h2>
          <details open style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error Message</summary>
            {this.state.error && this.state.error.toString()}
          </details>
          <details open style={{ whiteSpace: 'pre-wrap', marginTop: 10 }}>
            <summary>Component Stack</summary>
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
