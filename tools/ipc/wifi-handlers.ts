import { ipcMain, IpcMainInvokeEvent } from "electron";
import { exec } from "child_process";
import { promisify } from "util";
import { loadConfig } from "../utils/config-loader";

const execPromise = promisify(exec);

export interface WiFiNetwork {
  ssid: string;
  signal: number; // 0-100
  security: string; // e.g., "WPA2", "WPA3", "Open", "WEP"
}

export interface WiFiConnection {
  ssid: string;
  password: string;
  autoconnect?: boolean;
}

export interface WiFiStatus {
  connected: boolean;
  ssid?: string;
  signal?: number;
}

/**
 * Execute nmcli command only on target environment
 */
async function execNmcli(args: string): Promise<string> {
  const config = loadConfig();

  if (config.environment !== "target") {
    throw new Error("WiFi API is only available on target environment (Linux Debian with NetworkManager)");
  }

  try {
    const { stdout, stderr } = await execPromise(`nmcli ${args}`);
    if (stderr && stderr.trim()) {
      console.warn("nmcli stderr:", stderr);
    }
    return stdout;
  } catch (error) {
    console.error("nmcli error:", error);
    throw new Error(`nmcli command failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * List available WiFi networks
 */
async function handleListAvailableNetworks(): Promise<WiFiNetwork[]> {
  try {
    // Request fresh scan and get results
    // Format: SSID:SIGNAL:SECURITY
    const output = await execNmcli(
      'device wifi list --rescan yes -t -f SSID,SIGNAL,SECURITY'
    );

    const networks: WiFiNetwork[] = [];
    const lines = output.trim().split('\n');
    const seenSSIDs = new Set<string>();

    for (const line of lines) {
      if (!line.trim()) continue;

      const parts = line.split(':');
      if (parts.length < 3) continue;

      const ssid = parts[0].trim();
      const signalStr = parts[1].trim();
      const security = parts.slice(2).join(':').trim();

      // Skip empty SSIDs or duplicates (keep strongest signal)
      if (!ssid || seenSSIDs.has(ssid)) continue;

      const signal = parseInt(signalStr, 10);
      if (isNaN(signal)) continue;

      seenSSIDs.add(ssid);

      networks.push({
        ssid,
        signal,
        security: security || "Open"
      });
    }

    // Sort by signal strength (strongest first)
    networks.sort((a, b) => b.signal - a.signal);

    return networks;
  } catch (error) {
    console.error("Failed to list WiFi networks:", error);
    throw error;
  }
}

/**
 * Connect to a WiFi network
 */
async function handleConnect(
  _event: IpcMainInvokeEvent,
  connection: WiFiConnection
): Promise<void> {
  try {
    const { ssid, password, autoconnect = false } = connection;

    if (!ssid) {
      throw new Error("SSID is required");
    }

    // Check if connection profile already exists
    let connectionExists = false;
    try {
      const profiles = await execNmcli('connection show -t -f NAME');
      connectionExists = profiles.split('\n').some(name => name.trim() === ssid);
    } catch (error) {
      // Ignore error, assume connection doesn't exist
      console.warn("Failed to check existing connections:", error);
    }

    if (connectionExists) {
      // Modify existing connection if needed
      if (password) {
        await execNmcli(`connection modify "${ssid}" wifi-sec.key-mgmt wpa-psk`);
        await execNmcli(`connection modify "${ssid}" wifi-sec.psk "${password}"`);
      }

      // Set autoconnect preference
      await execNmcli(`connection modify "${ssid}" connection.autoconnect ${autoconnect ? 'yes' : 'no'}`);

      // Connect to existing profile
      await execNmcli(`connection up "${ssid}"`);
    } else {
      // Create new connection
      let cmd = `device wifi connect "${ssid}"`;

      if (password) {
        cmd += ` password "${password}"`;
      }

      await execNmcli(cmd);

      // Set autoconnect preference after connection is created
      if (autoconnect !== undefined) {
        try {
          await execNmcli(`connection modify "${ssid}" connection.autoconnect ${autoconnect ? 'yes' : 'no'}`);
        } catch (error) {
          console.warn("Failed to set autoconnect preference:", error);
        }
      }
    }

    console.log(`Successfully connected to ${ssid}`);
  } catch (error) {
    console.error("Failed to connect to WiFi:", error);
    throw new Error(`Failed to connect: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Disconnect from current WiFi network
 */
async function handleDisconnect(): Promise<void> {
  try {
    // Get current WiFi device name
    const devices = await execNmcli('device status -t -f DEVICE,TYPE,STATE');
    const lines = devices.split('\n');

    let wifiDevice: string | null = null;
    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 3 && parts[1] === 'wifi' && parts[2] === 'connected') {
        wifiDevice = parts[0];
        break;
      }
    }

    if (!wifiDevice) {
      throw new Error("No active WiFi connection found");
    }

    // Disconnect the device
    await execNmcli(`device disconnect "${wifiDevice}"`);
    console.log("Successfully disconnected from WiFi");
  } catch (error) {
    console.error("Failed to disconnect from WiFi:", error);
    throw new Error(`Failed to disconnect: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get current WiFi connection status
 */
async function handleGetCurrentConnection(): Promise<WiFiStatus> {
  try {
    // Get WiFi device status and connection info
    const devices = await execNmcli('device status -t -f DEVICE,TYPE,STATE,CONNECTION');
    const lines = devices.split('\n');

    for (const line of lines) {
      const parts = line.split(':');
      if (parts.length >= 4 && parts[1] === 'wifi' && parts[2] === 'connected') {
        const ssid = parts[3].trim();

        // Get signal strength for current connection
        try {
          const wifiInfo = await execNmcli(`device wifi list -t -f SSID,SIGNAL`);
          const wifiLines = wifiInfo.split('\n');

          for (const wifiLine of wifiLines) {
            const wifiParts = wifiLine.split(':');
            if (wifiParts.length >= 2 && wifiParts[0].trim() === ssid) {
              const signal = parseInt(wifiParts[1].trim(), 10);
              return {
                connected: true,
                ssid,
                signal: isNaN(signal) ? undefined : signal
              };
            }
          }
        } catch (error) {
          console.warn("Failed to get signal strength:", error);
        }

        return {
          connected: true,
          ssid
        };
      }
    }

    return { connected: false };
  } catch (error) {
    console.error("Failed to get WiFi status:", error);
    return { connected: false };
  }
}

/**
 * Register all WiFi IPC handlers
 */
export function registerWiFiHandlers(): void {
  ipcMain.handle("wifi:listAvailableNetworks", handleListAvailableNetworks);
  ipcMain.handle("wifi:connect", handleConnect);
  ipcMain.handle("wifi:disconnect", handleDisconnect);
  ipcMain.handle("wifi:getCurrentConnection", handleGetCurrentConnection);
}
