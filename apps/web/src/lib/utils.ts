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

/**
 * Remove IndexedDB with the given name.
 */
export function deleteIndexedDB(dbName: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase(dbName);

    deleteRequest.onsuccess = () => {
      console.log(`IndexedDB database "${dbName}" deleted successfully.`);
      resolve();
    };

    deleteRequest.onerror = event => {
      console.error(`Error deleting IndexedDB database "${dbName}":`, event);
      reject(event);
    };

    deleteRequest.onblocked = () => {
      console.warn(`Deletion of IndexedDB database "${dbName}" is blocked.`);
    };
  });
}
