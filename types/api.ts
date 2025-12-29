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
  getLocalIp: () => Promise<string | null>;
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
  goToAppSelector: () => Promise<void>;
}

/**
 * Config API exposed to renderer process
 */
export interface ConfigAPI {
  getConfig: () => Promise<any>;
}

/**
 * WiFi network information
 */
export interface WiFiNetwork {
  ssid: string;
  signal: number; // 0-100
  security: string; // e.g., "WPA2", "WPA3", "Open", "WEP"
}

/**
 * WiFi connection parameters
 */
export interface WiFiConnection {
  ssid: string;
  password: string;
  autoconnect?: boolean;
}

/**
 * WiFi connection status
 */
export interface WiFiStatus {
  connected: boolean;
  ssid?: string;
  signal?: number;
}

/**
 * WiFi API exposed to renderer process
 */
export interface WiFiAPI {
  listAvailableNetworks: () => Promise<WiFiNetwork[]>;
  connect: (connection: WiFiConnection) => Promise<void>;
  disconnect: () => Promise<void>;
  getCurrentConnection: () => Promise<WiFiStatus>;
}
