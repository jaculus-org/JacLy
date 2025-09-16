import { Logger } from '@jaculus/common';

export class JacLogger implements Logger {
  error(message?: string): void {
    console.error(message);
  }
  warn(message?: string): void {
    console.warn(message);
  }
  info(message?: string): void {
    console.info(message);
  }
  verbose(message?: string): void {
    console.log('[VERBOSE]', message);
  }
  debug(message?: string): void {
    console.debug(message);
  }
  silly(message?: string): void {
    console.log('[SILLY]', message);
  }
}

export const logger = new JacLogger();
export default logger;
