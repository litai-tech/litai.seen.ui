import { ipcMain, IpcMainInvokeEvent } from "electron";
import Store from "electron-store";
import { AppSettings, DEFAULT_SETTINGS } from "../types";

// Initialize the settings store
export const settingsStore = new Store<AppSettings>({
  defaults: DEFAULT_SETTINGS,
});

/**
 * Registers IPC handlers for settings management
 */
export function registerSettingsHandlers(): void {
  ipcMain.handle("settings:get", handleGetSetting);
  ipcMain.handle("settings:set", handleSetSetting);
  ipcMain.handle("settings:reset", handleResetSettings);
}

/**
 * Handler for getting a setting value
 */
function handleGetSetting(_event: IpcMainInvokeEvent, key: string): unknown {
  return settingsStore.get(key);
}

/**
 * Handler for setting a value
 */
function handleSetSetting(
  _event: IpcMainInvokeEvent,
  key: string,
  value: unknown
): void {
  settingsStore.set(key, value);
}

/**
 * Handler for resetting all settings to defaults
 */
function handleResetSettings(_event: IpcMainInvokeEvent): void {
  settingsStore.clear();
}
