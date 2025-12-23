import { ipcMain } from "electron";
import { loadConfig } from "../utils/config-loader";
import { AppConfig } from "../../types/config";

/**
 * Registers IPC handlers for config-related operations
 */
export function registerConfigHandlers(): void {
  ipcMain.handle("config:getConfig", async (): Promise<AppConfig> => {
    return loadConfig();
  });
}
