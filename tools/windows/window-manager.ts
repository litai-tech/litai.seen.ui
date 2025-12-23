import { BrowserWindow } from "electron";
import path from "node:path";
import { serialWorkerManager } from "../workers/serial-worker-manager";
import { mockSerialWorkerManager } from "../workers/mock-serial-worker-manager";
import { settingsStore } from "../ipc/settings-handlers";
import { loadConfig } from "../utils/config-loader";
import { getAvailableApps } from "../ipc/app-handlers";

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

  // Check if we should auto-start an app
  const apps = getAvailableApps();
  if (apps.length === 1) {
    // Auto-start the only available app
    console.log(`Auto-starting app: ${apps[0].name}`);
    loadAppDirectly(mainWindow, apps[0].name);
    setupDevTools(mainWindow);
    initializeSerialWorker(mainWindow);
  } else {
    // Show app selector
    loadWindowContent(mainWindow);
    setupDevTools(mainWindow);
    // Don't initialize serial worker yet - wait for app selection
  }

  return mainWindow;
}

/**
 * Loads the app selector into the window
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
 * Loads an app directly (for auto-start)
 */
function loadAppDirectly(window: BrowserWindow, appName: string): void {
  // Use getAppsDir from app-handlers to ensure consistent path resolution
  const appsDir = process.env.NODE_ENV === 'production'
    ? path.join(process.resourcesPath, 'apps')
    : path.join(__dirname, '../../apps');

  const appPath = path.join(appsDir, appName);
  const indexPath = path.join(appPath, "index.html");

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // In dev mode, construct URL to app through Vite dev server
    const appUrl = `${MAIN_WINDOW_VITE_DEV_SERVER_URL}/../apps/${appName}/index.html`;
    console.log(`Auto-starting app in dev mode: ${appUrl}`);
    window.loadURL(appUrl).catch(err => {
      console.error(`Failed to load app URL: ${err}`);
      // Fallback to file loading
      window.loadFile(indexPath);
    });
  } else {
    window.loadFile(indexPath);
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
