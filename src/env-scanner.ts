import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { EnvFile } from './types.js';

export async function scanEnvFiles(directory: string): Promise<EnvFile[]> {
  try {
    const files = await readdir(directory);

    const envFiles: EnvFile[] = files
      .filter((file) => file.startsWith('.env.'))
      .map((file) => ({
        name: file,
        path: join(directory, file),
      }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return envFiles;
  } catch (error) {
    console.error('Error scanning directory:', error);
    return [];
  }
}
