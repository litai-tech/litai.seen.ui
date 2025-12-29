/**
 * Application environment configuration types
 */

export interface SerialConfig {
  useMock: boolean;
  mockInputFile: string;
  mockInterval: number;
  workerPath: string;
  portPath: string;
  baudRate: number;
}

export interface WiFiConfig {
  enabled: boolean;
}

export interface AppConfig {
  environment: "local" | "target";
  serial: SerialConfig;
  wifi: WiFiConfig;
  useOnScreenKeyboard: boolean;
}
