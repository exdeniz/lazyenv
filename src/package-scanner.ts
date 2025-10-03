import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Command } from './types.js';

export async function scanPackageScripts(directory: string): Promise<Command[]> {
  try {
    const packagePath = join(directory, 'package.json');
    const content = await readFile(packagePath, 'utf-8');
    const packageJson = JSON.parse(content);

    if (!packageJson.scripts || typeof packageJson.scripts !== 'object') {
      return [];
    }

    const commands: Command[] = Object.entries(packageJson.scripts).map(([name, script]) => ({
      name,
      command: `npm run ${name}`,
    }));

    return commands;
  } catch (error) {
    console.error('Error reading package.json:', error);
    return [];
  }
}
