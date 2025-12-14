import { app, ipcMain, BrowserWindow, IpcMainInvokeEvent } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";
import si from "systeminformation";
import Store from "electron-store";
import { fork, ChildProcess } from "child_process";
import {
  AppSettings,
  DEFAULT_SETTINGS,
  SystemStats,
  SystemStatsError,
  WorkerInputMessage,
  WorkerOutputMessage,
} from "./types";

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const store = new Store<AppSettings>({
  defaults: DEFAULT_SETTINGS,
});

let portConnected = false;
let worker: ChildProcess | null = null;

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    //fullscreen: true,
    autoHideMenuBar: true,
    //frame: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools();
  setupSerialPort(mainWindow);
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  const disconnectMessage: WorkerInputMessage = { type: "disconnect" };
  worker?.send(disconnectMessage);
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.handle("system:getStats", async (): Promise<SystemStats | SystemStatsError> => {
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
});

ipcMain.handle("settings:get", (_event: IpcMainInvokeEvent, key: string) => store.get(key));
ipcMain.handle("settings:set", (_event: IpcMainInvokeEvent, key: string, value: unknown) => store.set(key, value));
ipcMain.handle("settings:reset", (_event: IpcMainInvokeEvent) => store.clear());

ipcMain.handle("serial:sendData", (_event: IpcMainInvokeEvent, data: string) => {
  data = ensureNewline(data, true);
  console.log(data);
  if (portConnected) {
    const message: WorkerInputMessage = { type: "send", data };
    worker?.send(message);
  }
});

function ensureNewline(data: string, useCRLF = false): string {
  const ending = useCRLF ? '\r\n' : '\n';
  if (data.endsWith('\r\n') || data.endsWith('\n')) {
    return data;
  }
  return data + ending;
}

function setupSerialPort(window: BrowserWindow): void {
  // Spawn worker with system Node.js
  worker = fork("/home/rock/ui/serial-worker/index.js", [], {
    execPath: "node",
  });

  worker.on("message", (msg: WorkerOutputMessage) => {
    if (msg.type === "data") {
      window?.webContents.send("serial:dataReceived", msg.data);
    }
    if (msg.type === "error") {
      window?.webContents.send("serial:error", msg.error);
    }
    if (msg.type === "connected") {
      window?.webContents.send("serial:connected");
    }
  });

  const baudRate = store.get("serialBaudRate");
  const portPath = store.get("serialPortPath");
  if (!portConnected) {
    const connectMessage: WorkerInputMessage = {
      type: "connect",
      path: portPath,
      baudRate,
    };
    worker?.send(connectMessage);
    portConnected = true;
  }
}
