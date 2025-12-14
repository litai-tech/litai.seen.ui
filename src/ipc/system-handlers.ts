import { ipcMain } from "electron";
import si from "systeminformation";
import { SystemStats, SystemStatsError } from "../types";

/**
 * Registers IPC handlers for system information
 */
export function registerSystemHandlers(): void {
  ipcMain.handle("system:getStats", handleGetSystemStats);
}

/**
 * Handler for getting system statistics
 */
async function handleGetSystemStats(): Promise<SystemStats | SystemStatsError> {
  try {
    const cpuUsage = await si.currentLoad();
    const mem = await si.mem();
    const temp = await si.cpuTemperature();

    return {
      cpuLoad: cpuUsage.currentLoad.toFixed(2),
      totalRAM: mem.total / 1024 / 1024,
      usedRAM: mem.used / 1024 / 1024,
      cpuTemp: temp.main,
    };
  } catch (e) {
    console.error("Error fetching system info:", e);
    return { error: "Failed to fetch system information" };
  }
}
