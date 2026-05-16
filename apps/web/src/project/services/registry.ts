import { getRequest } from '@jaculus/jacly/project';
import { Registry } from '@jaculus/project/registry';
import { logger } from '@/core';

const productionRegisters = ['https://registry.jaculus.org/'];

export const defaultRegisters = import.meta.env.DEV
  ? ['http://127.0.0.1:3737/', ...productionRegisters]
  : productionRegisters;

export function createProjectRegistry(registers: string[] = defaultRegisters) {
  return new Registry([...registers], getRequest, logger);
}
