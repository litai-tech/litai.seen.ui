import { app } from "electron";
import started from "electron-squirrel-startup";
import { registerAllIpcHandlers } from "./ipc";
import { registerLifecycleHandlers } from "./app/lifecycle";

/**
 * Main entry point for the Electron application
 */

// Handle creating/removing shortcuts on Windows when installing/uninstalling
if (started) {
  app.quit();
}

// Register all IPC handlers
registerAllIpcHandlers();

// Register application lifecycle handlers
registerLifecycleHandlers();
