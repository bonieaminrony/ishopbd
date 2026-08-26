import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
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
    console.error("Uncaught error in component tree:", error, errorInfo);
    // @ts-ignore
    this.setState({ errorInfo });
  }

  private handleReload = () => {
    try {
      localStorage.removeItem("cached_products");
      localStorage.removeItem("cached_categories");
      localStorage.removeItem("rokomari_products");
      localStorage.removeItem("rokomari_categories");
      localStorage.removeItem("products_last_fetch");
    } catch {}
    window.location.reload();
  };

  private handleGoHome = () => {
    try {
      localStorage.removeItem("cached_products");
      localStorage.removeItem("cached_categories");
      localStorage.removeItem("rokomari_products");
      localStorage.removeItem("rokomari_categories");
      localStorage.removeItem("products_last_fetch");
    } catch {}
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F4F3EF',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
            padding: '36px 28px',
            textAlign: 'center',
            border: '1px solid #E6E4DD'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              backgroundColor: '#FBEBE5',
              color: '#BB7154',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px',
              margin: '0 auto 20px'
            }}>
              ⚠️
            </div>
            
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#2C3534', marginBottom: '8px' }}>
              সাময়িক যান্ত্রিক ত্রুটি
            </h2>
            
            <p style={{ fontSize: '14px', color: '#5C6E6C', lineHeight: 1.6, marginBottom: '24px' }}>
              পৃষ্ঠাটি লোড করার সময় একটি অপ্রত্যাশিত ত্রুটি ঘটেছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন অথবা হোমপেজে ফিরে যান।
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                onClick={this.handleReload}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#6FA838',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '12px',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(92, 110, 108, 0.25)'
                }}
              >
                🔄 রিলোড করুন
              </button>
              
              <button
                onClick={this.handleGoHome}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#F4F3EF',
                  color: '#2C3534',
                  fontWeight: 700,
                  fontSize: '14px',
                  borderRadius: '12px',
                  border: '1px solid #D1CDC0',
                  cursor: 'pointer'
                }}
              >
                🏠 হোমপেজে যান
              </button>
            </div>

            {this.state.error && (
              <details style={{ marginTop: '24px', textAlign: 'left', fontSize: '12px', color: '#BB7154' }}>
                <summary style={{ cursor: 'pointer', fontWeight: 700, marginBottom: '8px' }}>
                  ▶ কারিগরি বিবরণ (Developer Details)
                </summary>
                <pre style={{ backgroundColor: '#FAF8F5', border: '1px solid #EFECE6', padding: '12px', borderRadius: '10px', overflowX: 'auto', whiteSpace: 'pre-wrap', color: '#8C3D2B', fontSize: '11px' }}>
                  {this.state.error.toString()}
                  {"\n\n"}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}

export default ErrorBoundary;
