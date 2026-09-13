import { MCPToolRegistry, mcpRegistry } from './registry';
import { foodMCPTools } from './tools/food';
import { travelMCPTools } from './tools/travel';
import { cinemaMCPTools } from './tools/cinema';
import { mobilityMCPTools } from './tools/mobility';
import { calendarMCPTools } from './tools/calendar';

export function registerAllDefaultMCPTools(): MCPToolRegistry {
  mcpRegistry.registerTools([
    ...foodMCPTools,
    ...travelMCPTools,
    ...cinemaMCPTools,
    ...mobilityMCPTools,
    ...calendarMCPTools,
  ]);
  return mcpRegistry;
}

// Auto-register on import
registerAllDefaultMCPTools();

export * from './types';
export * from './registry';
export * from './executor';
