import { ipcMain, IpcMainInvokeEvent } from "electron";
import { serialWorkerManager } from "../workers/serial-worker-manager";
import { ensureNewline } from "../utils/string-utils";

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
  serialWorkerManager.sendData(formattedData);
}
