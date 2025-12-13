import "./index.css";
import { initSerial } from "./system/serial";

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

function dataReceived(data: string) {
  const jsonObj = JSON.parse(data);
  console.log(data);
}

initSerial(dataReceived);

window.updateSystemInfo = updateSystemInfo;