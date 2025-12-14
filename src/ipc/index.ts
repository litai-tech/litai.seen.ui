import { registerSystemHandlers } from "./system-handlers";
import { registerSettingsHandlers } from "./settings-handlers";
import { registerSerialHandlers } from "./serial-handlers";

/**
 * Registers all IPC handlers for the application
 */
export function registerAllIpcHandlers(): void {
  registerSystemHandlers();
  registerSettingsHandlers();
  registerSerialHandlers();
}

// Re-export individual handler registration functions if needed
export { registerSystemHandlers, registerSettingsHandlers, registerSerialHandlers };
