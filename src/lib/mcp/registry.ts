import { MCPTool, MCPServiceCategory } from './types';

export class MCPToolRegistry {
  private static instance: MCPToolRegistry;
  private tools: Map<string, MCPTool> = new Map();

  private constructor() {}

  public static getInstance(): MCPToolRegistry {
    if (!MCPToolRegistry.instance) {
      MCPToolRegistry.instance = new MCPToolRegistry();
    }
    return MCPToolRegistry.instance;
  }

  public registerTool(tool: MCPTool): void {
    this.tools.set(tool.name, tool);
  }

  public registerTools(tools: MCPTool[]): void {
    tools.forEach((t) => this.registerTool(t));
  }

  public getTool(name: string): MCPTool | undefined {
    return this.tools.get(name);
  }

  public getAllTools(): MCPTool[] {
    return Array.from(this.tools.values());
  }

  public getToolsByCategory(category: MCPServiceCategory): MCPTool[] {
    return this.getAllTools().filter((t) => t.category === category);
  }

  public getToolsByScopes(grantedScopes: string[]): MCPTool[] {
    const scopeSet = new Set(grantedScopes);
    return this.getAllTools().filter((tool) =>
      tool.requiredScopes.every((scope) => scopeSet.has(scope) || scope === 'read:public')
    );
  }

  public clear(): void {
    this.tools.clear();
  }
}

export const mcpRegistry = MCPToolRegistry.getInstance();
