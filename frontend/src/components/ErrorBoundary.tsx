'use client';

import React, { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to monitoring service
    logger.error('Component Error Boundary caught an error', error, {
      component: 'ErrorBoundary',
      errorInfo: errorInfo.componentStack,
    });

    // Update error count
    this.setState(prev => ({
      errorCount: prev.errorCount + 1,
    }));
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorCount: 0,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-6">
          <div className="max-w-md w-full text-center">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">
              Something Went Wrong
            </h1>

            <p className="text-zinc-400 text-sm mb-8">
              We encountered an unexpected error. Our team has been notified.
              {this.state.errorCount > 2 && (
                <span className="block mt-2 text-red-400">
                  Multiple errors detected. Please try refreshing the page.
                </span>
              )}
            </p>

            {this.state.error && (
              <div className="mb-6 p-4 bg-zinc-900/50 border border-red-500/20 rounded-lg text-left overflow-hidden">
                <p className="text-[10px] font-mono text-red-400 break-all whitespace-pre-wrap">
                  {typeof this.state.error === 'string' 
                    ? this.state.error 
                    : this.state.error instanceof Error 
                      ? this.state.error.message 
                      : JSON.stringify(this.state.error, null, 2)}
                </p>
                {this.state.error instanceof Error && this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-[8px] text-zinc-500 cursor-pointer hover:text-zinc-400">View Stack Trace</summary>
                    <pre className="text-[8px] text-zinc-600 mt-2 max-h-40 overflow-auto">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={this.resetError}
                className="flex-1 py-3 bg-white text-black font-bold uppercase text-xs rounded-lg hover:bg-gray-100 transition-colors"
              >
                Try Again
              </button>

              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.location.href = '/';
                  }
                }}
                className="flex-1 py-3 bg-zinc-900 text-white font-bold uppercase text-xs rounded-lg border border-white/10 hover:border-white/20 transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
