import type { SearchResult } from "#internal/nitro/virtual/polyfill"; // placeholder to keep type import path valid in Nitro
import type { SearchRequest } from "../types/models";

// 由于上面的导入可能会被优化器处理，这里再显式导入我们的真实类型
import type { SearchResult as RealSearchResult } from "../types/models";

export interface AsyncSearchPlugin {
  name(): string;
  priority(): number;
  search(
    keyword: string,
    ext?: Record<string, any>
  ): Promise<RealSearchResult[]>;
  setMainCacheKey(key: string): void;
  setCurrentKeyword(keyword: string): void;
  skipServiceFilter(): boolean;
}

export class BaseAsyncPlugin implements AsyncSearchPlugin {
  private pluginName: string;
  private pluginPriority: number;
  protected mainCacheKey: string = "";
  protected currentKeyword: string = "";

  constructor(name: string, priority: number) {
    this.pluginName = name;
    this.pluginPriority = priority;
  }

  name(): string {
    return this.pluginName;
  }
  priority(): number {
    return this.pluginPriority;
  }
  setMainCacheKey(key: string): void {
    this.mainCacheKey = key;
  }
  setCurrentKeyword(keyword: string): void {
    this.currentKeyword = keyword;
  }
  skipServiceFilter(): boolean {
    return false;
  }

  async search(
    _keyword: string,
    _ext?: Record<string, any>
  ): Promise<RealSearchResult[]> {
    return [];
  }
}

// 全局注册表（与 Go 侧一致的语义）
const globalRegistry = new Map<string, AsyncSearchPlugin>();

export function registerGlobalPlugin(plugin: AsyncSearchPlugin) {
  if (!plugin) return;
  const name = plugin.name();
  if (!name) return;
  globalRegistry.set(name, plugin);
}

export function getRegisteredPlugins(): AsyncSearchPlugin[] {
  return Array.from(globalRegistry.values());
}

export class PluginManager {
  private plugins: AsyncSearchPlugin[] = [];

  registerPlugin(plugin: AsyncSearchPlugin) {
    this.plugins.push(plugin);
  }
  registerAllGlobalPlugins() {
    for (const p of getRegisteredPlugins()) this.registerPlugin(p);
  }
  getPlugins(): AsyncSearchPlugin[] {
    return this.plugins;
  }
}
