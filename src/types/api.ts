/**
 * System statistics returned from the main process
 */
export interface SystemStats {
  cpuLoad: string;
  totalRAM: number;
  usedRAM: number;
  cpuTemp: number;
}

/**
 * System API error response
 */
export interface SystemStatsError {
  error: string;
}

/**
 * System API exposed to renderer process
 */
export interface SystemAPI {
  getSystemStats: () => Promise<SystemStats | SystemStatsError>;
}

/**
 * Settings API exposed to renderer process
 */
export interface SettingsAPI {
  get: <T = any>(key: string) => Promise<T>;
  set: <T = any>(key: string, value: T) => Promise<void>;
  reset: () => Promise<void>;
}

/**
 * Serial API exposed to renderer process
 */
export interface SerialAPI {
  sendData: (data: string) => Promise<void>;
  onSerialData: (callback: (data: string) => void) => void;
  onSerialError: (callback: (error: string) => void) => void;
}

/**
 * App information
 */
export interface AppInfo {
  name: string;
  path: string;
}

/**
 * App API exposed to renderer process
 */
export interface AppAPI {
  getAvailableApps: () => Promise<AppInfo[]>;
  loadApp: (appName: string, openDevTools: boolean) => Promise<void>;
}

/**
 * Config API exposed to renderer process
 */
export interface ConfigAPI {
  getConfig: () => Promise<any>;
}
