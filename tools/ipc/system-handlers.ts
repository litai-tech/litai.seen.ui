import { ipcMain } from "electron";
import si from "systeminformation";
import { SystemStats, SystemStatsError } from "../../types";

/**
 * Registers IPC handlers for system information
 */
export function registerSystemHandlers(): void {
  ipcMain.handle("system:getStats", handleGetSystemStats);
  ipcMain.handle("system:getLocalIp", handleGetLocalIp);
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

/**
 * Handler for getting local IP address
 * Returns the first non-internal IPv4 address found
 */
async function handleGetLocalIp(): Promise<string | null> {
  try {
    const networkInterfaces = await si.networkInterfaces();

    // Find the first non-internal IPv4 address
    for (const iface of networkInterfaces) {
      if (!iface.internal && iface.ip4 && iface.ip4 !== '127.0.0.1') {
        return iface.ip4;
      }
    }

    return null;
  } catch (e) {
    console.error("Error fetching local IP:", e);
    return null;
  }
}
