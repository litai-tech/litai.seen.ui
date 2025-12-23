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

export interface AppConfig {
  environment: "local" | "target";
  serial: SerialConfig;
  useOnScreenKeyboard: boolean;
}
