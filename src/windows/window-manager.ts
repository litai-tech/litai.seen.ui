import { BrowserWindow } from "electron";
import path from "node:path";
import { serialWorkerManager } from "../workers/serial-worker-manager";
import { mockSerialWorkerManager } from "../workers/mock-serial-worker-manager";
import { settingsStore } from "../ipc/settings-handlers";
import { loadConfig } from "../utils/config-loader";

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
 * Uses mock worker in local environment, real worker in target environment
 */
function initializeSerialWorker(window: BrowserWindow): void {
  const config = loadConfig();

  if (config.serial.useMock) {
    // Use mock worker for local development
    console.log("Initializing mock serial worker");
    mockSerialWorkerManager.initialize(
      window,
      config.serial.mockInputFile,
      config.serial.mockInterval
    );
  } else {
    // Use real serial worker for target environment
    console.log("Initializing real serial worker");
    const baudRate = config.serial.baudRate || settingsStore.get("serialBaudRate");
    const portPath = config.serial.portPath || settingsStore.get("serialPortPath");
    const workerPath = config.serial.workerPath;

    serialWorkerManager.initialize(window, workerPath, portPath, baudRate);
  }
}
