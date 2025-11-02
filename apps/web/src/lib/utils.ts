import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { customAlphabet } from 'nanoid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateNanoId() {
  const alphabet = '2346789abcdefghijkmnpqrtwxyzABCDEFGHJKLMNPQRTUVWXYZ';
  return customAlphabet(alphabet, 15)();
}
