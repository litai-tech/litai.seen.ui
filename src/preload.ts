import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron";
import { SystemAPI, SettingsAPI, SerialAPI } from "./types";

const systemAPI: SystemAPI = {
  getSystemStats: () => ipcRenderer.invoke("system:getStats"),
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

contextBridge.exposeInMainWorld("systemAPI", systemAPI);
contextBridge.exposeInMainWorld("settingsAPI", settingsAPI);
contextBridge.exposeInMainWorld("serialAPI", serialAPI);