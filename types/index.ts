/**
 * Central export file for all TypeScript types
 */

export type {
  SystemStats,
  SystemStatsError,
  SystemAPI,
  SettingsAPI,
  SerialAPI,
  AppAPI,
  AppInfo,
  ConfigAPI,
  WiFiAPI,
  WiFiNetwork,
  WiFiConnection,
  WiFiStatus,
} from "./api";

export type { AppSettings, SettingsKey } from "./settings";
export { DEFAULT_SETTINGS } from "./settings";

export type { WorkerInputMessage, WorkerOutputMessage } from "./worker";

export type { SerialDataHandler, SerialErrorHandler } from "./serial";

export type { AppConfig, SerialConfig, WiFiConfig } from "./config";
