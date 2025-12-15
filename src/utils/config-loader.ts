import path from "node:path";
import fs from "node:fs";
import { AppConfig } from "../types/config";

/**
 * Loads the application configuration based on the environment
 * @returns The loaded configuration object
 */
export function loadConfig(): AppConfig {
  const env = process.env.APP_ENV || "target";
  const configFileName = `config.${env}.json`;
  const configPath = path.join(process.cwd(), "configs", configFileName);

  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }

  const configContent = fs.readFileSync(configPath, "utf-8");
  const config: AppConfig = JSON.parse(configContent);

  return config;
}
