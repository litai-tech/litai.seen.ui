import { BrowserWindow } from "electron";
import path from "node:path";
import { serialWorkerManager } from "../workers/serial-worker-manager";
import { settingsStore } from "../ipc/settings-handlers";

/**
 * Configuration for the main window
 */
const WINDOW_CONFIG = {
  width: 1920,
  height: 1080,
  autoHideMenuBar: true,
} as const;

/**
 * Creates and configures the main browser window
 * @returns The created BrowserWindow instance
 */
export function createMainWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    ...WINDOW_CONFIG,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  loadWindowContent(mainWindow);
  setupDevTools(mainWindow);
  initializeSerialWorker(mainWindow);

  return mainWindow;
}

/**
 * Loads the appropriate content into the window
 */
function loadWindowContent(window: BrowserWindow): void {
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    window.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

/**
 * Opens DevTools in development mode
 */
function setupDevTools(window: BrowserWindow): void {
  window.webContents.openDevTools();
}

/**
 * Initializes the serial worker with settings from the store
 */
function initializeSerialWorker(window: BrowserWindow): void {
  const baudRate = settingsStore.get("serialBaudRate");
  const portPath = settingsStore.get("serialPortPath");
  const workerPath = "/home/rock/ui/serial-worker/index.js";

  serialWorkerManager.initialize(window, workerPath, portPath, baudRate);
}
