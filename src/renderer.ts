import "./index.css";
import { initSerial, sendSerialObj } from "./system/serial";

async function updateSystemInfo() {
  const info = await window.systemAPI.getSystemStats();
  if (info.error) {
    console.error(info.error);
    return;
  }
  console.log(`CPU Load: ${info.cpuLoad}%`);
  console.log(
    `RAM Used: ${((info.usedRAM / info.totalRAM) * 100).toFixed(2)}%`
  );
  console.log(`CPU Temp: ${info.cpuTemp}°C`);
}

initSerial();

window.updateSystemInfo = updateSystemInfo;