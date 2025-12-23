import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { SystemAPI, SettingsAPI, SerialAPI, AppAPI, ConfigAPI } from "../types";

console.log("[Preload] Preload script is executing");

const systemAPI: SystemAPI = {
  getSystemStats: () => ipcRenderer.invoke("system:getStats"),
  getLocalIp: () => ipcRenderer.invoke("system:getLocalIp"),
};

const settingsAPI: SettingsAPI = {
  get: <T = unknown>(key: string) => ipcRenderer.invoke("settings:get", key) as Promise<T>,
  set: <T = unknown>(key: string, value: T) => ipcRenderer.invoke("settings:set", key, value),
  reset: () => ipcRenderer.invoke("settings:reset"),
};

const serialAPI: SerialAPI = {
  sendData: (data: string) => ipcRenderer.invoke("serial:sendData", data),

  onSerialData: (callback: (data: string) => void) => {
    ipcRenderer.on("serial:dataReceived", (_event: IpcRendererEvent, data: string) => callback(data));
  },

  onSerialError: (callback: (error: string) => void) => {
    ipcRenderer.on("serial:error", (_event: IpcRendererEvent, error: string) => callback(error));
  },
};

const appAPI: AppAPI = {
  getAvailableApps: () => {
    console.log("[Preload] appAPI.getAvailableApps called");
    return ipcRenderer.invoke("app:getAvailableApps");
  },
  loadApp: (appName: string, openDevTools: boolean) => {
    console.log(`[Preload] appAPI.loadApp called with ${appName}, ${openDevTools}`);
    return ipcRenderer.invoke("app:loadApp", appName, openDevTools);
  },
  goToAppSelector: () => {
    console.log("[Preload] appAPI.goToAppSelector called");
    return ipcRenderer.invoke("app:goToAppSelector");
  },
};

const configAPI: ConfigAPI = {
  getConfig: () => ipcRenderer.invoke("config:getConfig"),
};

console.log("[Preload] Exposing APIs to main world");
contextBridge.exposeInMainWorld("systemAPI", systemAPI);
contextBridge.exposeInMainWorld("settingsAPI", settingsAPI);
contextBridge.exposeInMainWorld("serialAPI", serialAPI);
contextBridge.exposeInMainWorld("appAPI", appAPI);
contextBridge.exposeInMainWorld("configAPI", configAPI);
console.log("[Preload] APIs exposed successfully");