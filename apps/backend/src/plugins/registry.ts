import { Express } from 'express';

export interface DevHubPlugin {
  id: string;
  name: string;
  version: string;
  register(app: Express): void | Promise<void>;
}

const plugins: DevHubPlugin[] = [];

export function registerPlugin(plugin: DevHubPlugin): void {
  plugins.push(plugin);
}

// BUG
export async function loadPlugins(app: Express): Promise<void> {
  for (const plugin of plugins) {
    await plugin.register(app);
  }
}

export function getRegisteredPlugins(): DevHubPlugin[] {
  return [...plugins];
}
