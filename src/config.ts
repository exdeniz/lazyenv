import { cosmiconfig } from 'cosmiconfig';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import type { EnvSwitcherConfig } from './types.js';

const CONFIG_NAME = 'env-switcher';

export async function loadConfig(startDir: string): Promise<EnvSwitcherConfig | null> {
  const explorer = cosmiconfig(CONFIG_NAME, {
    searchPlaces: [
      `.${CONFIG_NAME}rc`,
      `.${CONFIG_NAME}rc.json`,
      `.${CONFIG_NAME}rc.js`,
      `${CONFIG_NAME}.config.js`,
      `.${CONFIG_NAME}.json`,
    ],
  });

  // Поиск в текущей директории и выше
  let result = await explorer.search(startDir);

  // Если не найден, ищем в home директории
  if (!result) {
    const homeConfigPath = join(homedir(), `.${CONFIG_NAME}.json`);
    result = await explorer.load(homeConfigPath);
  }

  return result?.config ?? null;
}

export function getDefaultConfig(): EnvSwitcherConfig {
  return {
    commands: [
      {
        name: 'Start development server',
        command: 'npm run dev',
      },
    ],
  };
}
