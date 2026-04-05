import { customAlphabet } from 'nanoid';

/*
  Generates a nanoid using a custom alphabet that excludes ambiguous characters.
*/
export function generateNanoId(size: number = 15): string {
  const alphabet = '2346789abcdefghijkmnpqrtwxyzABCDEFGHJKLMNPQRTUVWXYZ';
  return customAlphabet(alphabet, size)();
}

/*
  Generates a project ID by creating a nanoid and inserting dashes every 5 characters.
  Example: "abcde-fghij-klmno"
*/
export function generateProjectId(size: number = 15): string {
  const id = generateNanoId(size);
  return id.match(/.{1,5}/g)?.join('-') ?? id;
}
