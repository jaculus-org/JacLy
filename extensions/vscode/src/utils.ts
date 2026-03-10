import { type Logger } from '@jaculus/common';

export class JacLogger implements Logger {
  error(message?: string): void {
    console.error(message + '\n');
  }
  warn(message?: string): void {
    console.warn(message + '\n');
  }
  info(message?: string): void {
    console.info(message + '\n');
  }
  verbose(message?: string): void {
    console.log('[VERBOSE]', message + '\n');
  }
  debug(message?: string): void {
    console.debug(message + '\n');
  }
  silly(message?: string): void {
    console.log('[SILLY]', message + '\n');
  }
}

export const logger = new JacLogger();
export default logger;
