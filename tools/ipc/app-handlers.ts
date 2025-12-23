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
  console.log(`[Main] loadApp called with appName: ${appName}, openDevTools: ${openDevTools}`);

  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (!mainWindow) {
    console.error("[Main] No main window found");
    return;
  }

  const appsDir = getAppsDir();
  console.log(`[Main] Apps directory: ${appsDir}`);

  const appPath = path.join(appsDir, appName);
  const indexPath = path.join(appPath, "index.html");
  console.log(`[Main] App index path: ${indexPath}`);

  if (!fs.existsSync(indexPath)) {
    console.error(`[Main] App not found: ${appName} at ${indexPath}`);
    return;
  }

  console.log(`[Main] App found, preparing to load...`);

  // Load the app
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    // In dev mode, serve through Vite dev server
    // Vite root is 'tools/', so we need to go up to access apps
    // Vite root is now project root, so apps are directly accessible
    const baseUrl = MAIN_WINDOW_VITE_DEV_SERVER_URL.endsWith('/')
      ? MAIN_WINDOW_VITE_DEV_SERVER_URL
      : `${MAIN_WINDOW_VITE_DEV_SERVER_URL}/`;
    const appUrl = `${baseUrl}apps/${appName}/index.html`;
    console.log(`[Main] Loading app in dev mode: ${appUrl}`);

    mainWindow.loadURL(appUrl).then(() => {
      console.log(`[Main] Successfully loaded app via Vite`);
      mainWindow.webContents.executeJavaScript(`console.log("[Main via WebContents] App loaded successfully: ${appUrl}")`);
    }).catch(err => {
      console.error(`[Main] Failed to load app URL: ${err}`);
      mainWindow.webContents.executeJavaScript(`console.error("[Main via WebContents] Failed to load URL: ${appUrl}, Error: ${err}")`);
      // Fallback to file for now so we can at least see the app
      mainWindow.loadFile(indexPath);
    });
  } else {
    // In production, use file protocol
    console.log(`[Main] Loading app in production mode from file: ${indexPath}`);
    mainWindow.loadFile(indexPath);
  }

  // Open DevTools if requested
  if (openDevTools) {
    console.log(`[Main] Opening DevTools`);
    mainWindow.webContents.openDevTools();
  } else {
    console.log(`[Main] Closing DevTools`);
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
    console.log("[Main] IPC: app:getAvailableApps called");
    const apps = getAvailableApps();
    console.log(`[Main] IPC: Found ${apps.length} apps`);
    return apps;
  });

  ipcMain.handle("app:loadApp", async (_event, appName: string, openDevTools: boolean) => {
    console.log(`[Main] IPC: app:loadApp called with appName: ${appName}, openDevTools: ${openDevTools}`);
    loadApp(appName, openDevTools);
    return { success: true };
  });

  ipcMain.handle("app:goToAppSelector", async () => {
    console.log("[Main] IPC: app:goToAppSelector called");
    goToAppSelector();
  });
}
