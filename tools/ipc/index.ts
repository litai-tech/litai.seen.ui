import { registerSystemHandlers } from "./system-handlers";
import { registerSettingsHandlers } from "./settings-handlers";
import { registerSerialHandlers } from "./serial-handlers";
import { registerAppHandlers } from "./app-handlers";
import { registerConfigHandlers } from "./config-handlers";
import { registerWiFiHandlers } from "./wifi-handlers";

/**
 * Registers all IPC handlers for the application
 */
export function registerAllIpcHandlers(): void {
  registerSystemHandlers();
  registerSettingsHandlers();
  registerSerialHandlers();
  registerAppHandlers();
  registerConfigHandlers();
  registerWiFiHandlers();
}

// Re-export individual handler registration functions if needed
export { registerSystemHandlers, registerSettingsHandlers, registerSerialHandlers, registerAppHandlers, registerConfigHandlers, registerWiFiHandlers };
