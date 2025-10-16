/**
 * Logging utility with consistent formatting
 */

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

/**
 * Logger class for consistent logging across the application
 */
export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  private formatMessage(level: LogLevel, message: string, meta?: Record<string, unknown>): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level}] [${this.context}] ${message}${metaStr}`;
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    console.debug(this.formatMessage(LogLevel.DEBUG, message, meta));
  }

  info(message: string, meta?: Record<string, unknown>): void {
    console.log(this.formatMessage(LogLevel.INFO, message, meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    console.warn(this.formatMessage(LogLevel.WARN, message, meta));
  }

  error(message: string, error?: Error | unknown, meta?: Record<string, unknown>): void {
    const errorMeta = error instanceof Error 
      ? { message: error.message, stack: error.stack, ...meta }
      : { error, ...meta };
    console.error(this.formatMessage(LogLevel.ERROR, message, errorMeta));
  }
}

/**
 * Creates a logger instance for a specific context
 * @param context Context name (e.g., module name, class name)
 * @returns Logger instance
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

