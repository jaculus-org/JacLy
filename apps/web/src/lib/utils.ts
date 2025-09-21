import { clsx, type ClassValue } from 'clsx';
import { customAlphabet } from 'nanoid';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/*
  Generates a nanoid using a custom alphabet that excludes ambiguous characters.
*/
export function generateNanoId() {
  const alphabet = '2346789abcdefghijkmnpqrtwxyzABCDEFGHJKLMNPQRTUVWXYZ';
  return customAlphabet(alphabet, 15)();
}

/*
  Generates a project name by creating a nanoid and inserting dashes every 5 characters.
  Example: "abcde-fghij-klmno"
*/
export function generateProjectName() {
  const id = generateNanoId();
  return id.match(/.{1,5}/g)?.join('-') ?? id;
}
