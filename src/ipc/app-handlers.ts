import { ipcMain, BrowserWindow } from "electron";
import * as fs from "fs";
import * as path from "path";

export interface AppInfo {
  name: string;
  path: string;
}

/**
 * Gets the apps directory path (works in both dev and production)
 */
function getAppsDir(): string {
  // In development, apps are in project root
  // In production (packaged), apps are in extraResources
  if (process.env.NODE_ENV === 'production') {
    return path.join(process.resourcesPath, 'apps');
  }
  return path.join(__dirname, '../../apps');
}

/**
 * Gets all available apps from the apps directory
 */
export function getAvailableApps(): AppInfo[] {
  const appsDir = getAppsDir();

  try {
    if (!fs.existsSync(appsDir)) {
      console.warn("Apps directory not found:", appsDir);
      return [];
    }

    const entries = fs.readdirSync(appsDir, { withFileTypes: true });
    const apps: AppInfo[] = [];

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const appPath = path.join(appsDir, entry.name);
        const indexPath = path.join(appPath, "index.html");

        // Check if the app has an index.html file
        if (fs.existsSync(indexPath)) {
          apps.push({
            name: entry.name,
            path: appPath,
          });
        }
      }
    }

    return apps;
  } catch (error) {
    console.error("Error reading apps directory:", error);
    return [];
  }
}

/**
 * Loads an app in the main window
 */
export function loadApp(appName: string, openDevTools: boolean): void {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (!mainWindow) {
    console.error("No main window found");
    return;
  }

  const appsDir = getAppsDir();
  const appPath = path.join(appsDir, appName);
  const indexPath = path.join(appPath, "index.html");

  if (!fs.existsSync(indexPath)) {
    console.error(`App not found: ${appName}`);
    return;
  }

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // In dev mode, construct URL to app through Vite dev server
    // This allows Vite to handle module resolution and HMR
    const appUrl = `${MAIN_WINDOW_VITE_DEV_SERVER_URL}/../apps/${appName}/index.html`;
    console.log(`Loading app in dev mode: ${appUrl}`);
    mainWindow.loadURL(appUrl).catch(err => {
      console.error(`Failed to load app URL: ${err}`);
      // Fallback to file loading
      mainWindow.loadFile(indexPath);
    });
  } else {
    mainWindow.loadFile(indexPath);
  }

  // Open DevTools if requested
  if (openDevTools) {
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.webContents.closeDevTools();
  }
}

/**
 * Returns to the app selector screen
 */
export function goToAppSelector(): void {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (!mainWindow) {
    console.error("No main window found");
    return;
  }

  // Load the app selector
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }
}

/**
 * Registers IPC handlers for app-related operations
 */
export function registerAppHandlers(): void {
  ipcMain.handle("app:getAvailableApps", async () => {
    return getAvailableApps();
  });

  ipcMain.handle("app:loadApp", async (_event, appName: string, openDevTools: boolean) => {
    loadApp(appName, openDevTools);
  });

  ipcMain.handle("app:goToAppSelector", async () => {
    goToAppSelector();
  });
}
