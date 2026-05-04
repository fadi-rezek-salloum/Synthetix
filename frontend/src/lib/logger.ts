/**
 * Structured logging service for the application
 * In development: logs to console with formatting
 * In production: sends to monitoring service (Sentry, LogRocket, etc.)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  context?: string;
  userId?: number;
  component?: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context?.component ? ` [${context.component}]` : '';
    return `[${timestamp}]${contextStr} ${message}`;
  }

  private sendToMonitoring(level: LogLevel, message: string, context?: LogContext) {
    // TODO: Integrate with Sentry or other error tracking service
    // Example: Sentry.captureMessage(message, level);
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // Send to monitoring service
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          message,
          context,
          timestamp: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail to avoid infinite loops
      });
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.debug(this.formatMessage('debug', message, context), context);
    }
  }

  info(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.info(this.formatMessage('info', message, context), context);
    }
    this.sendToMonitoring('info', message, context);
  }

  warn(message: string, context?: LogContext) {
    if (this.isDevelopment) {
      console.warn(this.formatMessage('warn', message, context), context);
    }
    this.sendToMonitoring('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `${message} - ${errorMessage}`;

    if (this.isDevelopment) {
      console.error(this.formatMessage('error', message, context), error, context);
    }

    this.sendToMonitoring('error', fullMessage, {
      ...context,
      error: {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      },
    });
  }

  // Convenience method for API errors
  apiError(endpoint: string, statusCode: number, error?: unknown, context?: LogContext) {
    this.error(`API Error [${statusCode}]: ${endpoint}`, error, {
      ...context,
      endpoint,
      statusCode,
    });
  }
}

export const logger = new Logger();
