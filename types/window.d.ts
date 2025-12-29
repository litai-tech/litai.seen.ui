import { SystemAPI, SettingsAPI, SerialAPI, AppAPI, ConfigAPI, WiFiAPI } from "./api";

/**
 * Global window interface extensions
 * This file declares the APIs exposed by the preload script
 */
declare global {
  interface Window {
    systemAPI: SystemAPI;
    settingsAPI: SettingsAPI;
    serialAPI: SerialAPI;
    appAPI: AppAPI;
    configAPI: ConfigAPI;
    wifiAPI: WiFiAPI;

    // Utility functions exposed to window object
    updateSystemInfo: () => Promise<void>;
    sendSerialRawData: (data: string) => Promise<void>;
    sendSerialObj: (obj: object) => Promise<void>;
  }
}

export {};
