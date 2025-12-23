import { app, BrowserWindow } from "electron";
import { serialWorkerManager } from "../tools/workers/serial-worker-manager";
import { mockSerialWorkerManager } from "../tools/workers/mock-serial-worker-manager";
import { createMainWindow } from "../tools/windows/window-manager";
import { loadConfig } from "../tools/utils/config-loader";

/**
 * Registers application lifecycle event handlers
 */
export function registerLifecycleHandlers(): void {
  app.on("ready", handleAppReady);
  app.on("window-all-closed", handleAllWindowsClosed);
  app.on("activate", handleActivate);
}

/**
 * Handler for when the app is ready
 */
function handleAppReady(): void {
  createMainWindow();
}

/**
 * Handler for when all windows are closed
 */
function handleAllWindowsClosed(): void {
  // Disconnect serial worker before quitting
  const config = loadConfig();
  if (config.serial.useMock) {
    mockSerialWorkerManager.disconnect();
  } else {
    serialWorkerManager.disconnect();
  }

  // On macOS, apps typically stay active until user quits with Cmd+Q
  if (process.platform !== "darwin") {
    app.quit();
  }
}

/**
 * Handler for macOS activate event
 */
function handleActivate(): void {
  // On macOS, re-create window when dock icon is clicked and no windows open
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
}
