function handleSerialError(error: string) {
  console.error("Renderer received serial error:", error);
}

export async function sendSerialRawData(data: string) {
  await window.serialAPI.sendData(data);
}

export async function sendSerialObj(obj: object) {
  const data = JSON.stringify(obj);
  console.log(data);
  await window.serialAPI.sendData(data);
}

export function initSerial(handleSerialData: (data: string) => void) {
  window.serialAPI.onSerialData(handleSerialData);
  window.serialAPI.onSerialError(handleSerialError);

  window.sendSerialRawData = sendSerialRawData;
  window.sendSerialObj = sendSerialObj;
}
