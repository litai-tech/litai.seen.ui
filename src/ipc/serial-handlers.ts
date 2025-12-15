import { ipcMain, IpcMainInvokeEvent } from "electron";
import { serialWorkerManager } from "../workers/serial-worker-manager";
import { mockSerialWorkerManager } from "../workers/mock-serial-worker-manager";
import { ensureNewline } from "../utils/string-utils";
import { loadConfig } from "../utils/config-loader";

/**
 * Registers IPC handlers for serial communication
 */
export function registerSerialHandlers(): void {
  ipcMain.handle("serial:sendData", handleSendSerialData);
}

/**
 * Handler for sending data through the serial port
 */
function handleSendSerialData(
  _event: IpcMainInvokeEvent,
  data: string
): void {
  const formattedData = ensureNewline(data, true);
  console.log("Sending serial data:", formattedData);

  const config = loadConfig();
  if (config.serial.useMock) {
    mockSerialWorkerManager.sendData(formattedData);
  } else {
    serialWorkerManager.sendData(formattedData);
  }
}
