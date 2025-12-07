import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('systemAPI', {
  getSystemStats: () => ipcRenderer.invoke('system:getStats')
});

contextBridge.exposeInMainWorld('settingsAPI', {
  get: (key: string) => ipcRenderer.invoke('settings:get', key),
  set: (key: string, value: any) => ipcRenderer.invoke('settings:set', key, value),
  reset: () => ipcRenderer.invoke('settings:reset')
});

contextBridge.exposeInMainWorld('serialAPI', {
  sendData: (data: string) => ipcRenderer.invoke('serial:sendData', data),

  onSerialData: (callback: (data: string) => void) => {
    ipcRenderer.on('serial:dataReceived', (_event, data) => callback(data));
  },
  onSerialError: (callback: (error: string) => void) => {
    ipcRenderer.on('serial:error', (_event, error) => callback(error));
  },
});