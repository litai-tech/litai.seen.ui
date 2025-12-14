import { SerialDataHandler, SerialErrorHandler } from "../types";

const handleSerialError: SerialErrorHandler = (error: string): void => {
  console.error("Renderer received serial error:", error);
};

export async function sendSerialRawData(data: string): Promise<void> {
  await window.serialAPI.sendData(data);
}

export async function sendSerialObj(obj: object): Promise<void> {
  const data = JSON.stringify(obj);
  console.log(data);
  await window.serialAPI.sendData(data);
}

export function initSerial(handleSerialData: SerialDataHandler): void {
  window.serialAPI.onSerialData(handleSerialData);
  window.serialAPI.onSerialError(handleSerialError);

  window.sendSerialRawData = sendSerialRawData;
  window.sendSerialObj = sendSerialObj;
}
