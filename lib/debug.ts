/**
 * Comprehensive debugging system for SavedFeast Mobile App
 */

export interface DebugConfig {
  enabled: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  includeTimestamps: boolean;
  includeStackTraces: boolean;
  logToConsole: boolean;
  logToFile?: boolean;
}

export interface DebugContext {
  component?: string;
  function?: string;
  userId?: string;
  orderId?: string;
  mealId?: string;
  requestId?: string;
}

class DebugLogger {
  private config: DebugConfig;
  private logs: Array<{
    timestamp: string;
    level: string;
    message: string;
    context?: DebugContext;
    data?: any;
    stack?: string;
  }> = [];

  constructor(config: Partial<DebugConfig> = {}) {
    this.config = {
      enabled: __DEV__ || config.enabled || false,
      logLevel: config.logLevel || 'info',
      includeTimestamps: config.includeTimestamps !== false,
      includeStackTraces: config.includeStackTraces || false,
      logToConsole: config.logToConsole !== false,
      ...config,
    };
  }

  private sanitizeStackTrace(stack?: string | null): string | undefined {
    if (!stack) {
      return stack === null ? undefined : stack;
    }

    return stack
      .split('\n')
      .filter(line => line.trim() && !line.includes('InternalBytecode'))
      .join('\n');
  }

  private sanitizeData<T = any>(data: T): T {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data === 'string') {
      const sanitized = this.sanitizeStackTrace(data);
      return (sanitized ?? data) as T;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeData(item)) as T;
    }

    if (typeof data === 'object') {
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(data as Record<string, any>)) {
        if (typeof value === 'string' && (key.toLowerCase().includes('stack') || value.includes('InternalBytecode'))) {
          const sanitizedValue = this.sanitizeStackTrace(value);
          result[key] = sanitizedValue ?? value;
        } else {
          result[key] = this.sanitizeData(value);
        }
      }
      return result as T;
    }

    return data;
  }

  private shouldLog(level: string): boolean {
    if (!this.config.enabled) return false;

    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex <= currentLevelIndex;
  }

  private formatMessage(level: string, message: string, context?: DebugContext, data?: any): string {
    const parts: string[] = [];

    if (this.config.includeTimestamps) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${level.toUpperCase()}]`);

    if (context?.component) {
      parts.push(`[${context.component}]`);
    }

    if (context?.function) {
      parts.push(`[${context.function}]`);
    }

    if (context?.userId) {
      parts.push(`[User:${context.userId}]`);
    }

    if (context?.orderId) {
      parts.push(`[Order:${context.orderId}]`);
    }

    if (context?.mealId) {
      parts.push(`[Meal:${context.mealId}]`);
    }

    if (context?.requestId) {
      parts.push(`[Req:${context.requestId}]`);
    }

    parts.push(message);

    if (data !== undefined) {
      const sanitizedData = this.sanitizeData(data);
      parts.push(`\nData: ${JSON.stringify(sanitizedData, null, 2)}`);
    }

    return parts.join(' ');
  }

  private log(level: string, message: string, context?: DebugContext, data?: any): void {
    if (!this.shouldLog(level)) return;

    const sanitizedData = this.sanitizeData(data);
    const formattedMessage = this.formatMessage(level, message, context, sanitizedData);
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data: sanitizedData,
      stack: this.config.includeStackTraces ? this.sanitizeStackTrace(new Error().stack) : undefined,
    };

    this.logs.push(logEntry);

    if (this.config.logToConsole) {
      switch (level) {
        case 'error':
          console.error(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'debug':
          console.debug(formattedMessage);
          break;
        default:
          console.log(formattedMessage);
      }
    }
  }

  error(message: string, context?: DebugContext, data?: any): void {
    this.log('error', message, context, data);
  }

  warn(message: string, context?: DebugContext, data?: any): void {
    this.log('warn', message, context, data);
  }

  info(message: string, context?: DebugContext, data?: any): void {
    this.log('info', message, context, data);
  }

  debug(message: string, context?: DebugContext, data?: any): void {
    this.log('debug', message, context, data);
  }

  // API-specific logging methods
  apiRequest(method: string, url: string, data?: any, context?: DebugContext): void {
    this.info(`API Request: ${method} ${url}`, context, data);
  }

  apiResponse(method: string, url: string, status: number, data?: any, context?: DebugContext): void {
    const level = status >= 400 ? 'error' : 'info';
    this.log(level, `API Response: ${method} ${url} - ${status}`, context, data);
  }

  apiError(method: string, url: string, error: any, context?: DebugContext): void {
    const sanitizedErrorData = this.sanitizeData({
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      stack: error.stack,
    });
    this.error(`API Error: ${method} ${url}`, context, sanitizedErrorData);
  }

  // Component-specific logging methods
  componentRender(component: string, props?: any): void {
    this.debug(`Component rendered: ${component}`, { component }, props);
  }

  componentError(component: string, error: any, props?: any): void {
    this.error(`Component error: ${component}`, { component }, {
      error: error.message,
      stack: this.sanitizeStackTrace(error.stack),
      props,
    });
  }

  // Order-specific logging methods
  orderCreated(orderId: number, orderData: any, context?: DebugContext): void {
    this.info(`Order created: ${orderId}`, { ...context, orderId: orderId.toString() }, orderData);
  }

  orderUpdated(orderId: number, status: string, context?: DebugContext): void {
    this.info(`Order updated: ${orderId} - ${status}`, { ...context, orderId: orderId.toString() });
  }

  orderError(orderId: number, error: any, context?: DebugContext): void {
    this.error(`Order error: ${orderId}`, { ...context, orderId: orderId.toString() }, this.sanitizeData(error));
  }

  // Cart-specific logging methods
  cartAction(action: string, itemId: number, quantity: number, context?: DebugContext): void {
    this.debug(`Cart ${action}: Item ${itemId}, Quantity ${quantity}`, context);
  }

  // User-specific logging methods
  userAction(action: string, userId: number, context?: DebugContext): void {
    this.info(`User ${action}: ${userId}`, { ...context, userId: userId.toString() });
  }

  // Utility methods
  getLogs(): Array<any> {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Performance monitoring
  timeStart(label: string, context?: DebugContext): void {
    this.debug(`Timer started: ${label}`, context);
  }

  timeEnd(label: string, context?: DebugContext): void {
    this.debug(`Timer ended: ${label}`, context);
  }
}

// Create singleton instance
export const debug = new DebugLogger({
  enabled: __DEV__,
  logLevel: 'debug',
  includeTimestamps: true,
  includeStackTraces: true,
  logToConsole: true,
});

// Export types and class for advanced usage
export { DebugLogger };
