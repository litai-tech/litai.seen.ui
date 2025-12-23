/**
 * Application settings stored in electron-store
 */
export interface AppSettings {
  serialBaudRate: number;
  serialPortPath: string;
}

/**
 * Default settings for the application
 */
export const DEFAULT_SETTINGS: AppSettings = {
  serialBaudRate: 115200,
  serialPortPath: "/dev/ttyS3",
};

/**
 * Type-safe keys for settings
 */
export type SettingsKey = keyof AppSettings;
