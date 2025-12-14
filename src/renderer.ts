import "./index.css";
import { initSerial } from "./system/serial";
import { SystemStats, SystemStatsError } from "./types";

async function updateSystemInfo(): Promise<void> {
  const info = await window.systemAPI.getSystemStats();

  if ("error" in info) {
    const errorInfo = info as SystemStatsError;
    console.error(errorInfo.error);
    return;
  }

  const statsInfo = info as SystemStats;
  console.log(`CPU Load: ${statsInfo.cpuLoad}%`);
  console.log(
    `RAM Used: ${((statsInfo.usedRAM / statsInfo.totalRAM) * 100).toFixed(2)}%`
  );
  console.log(`CPU Temp: ${statsInfo.cpuTemp}°C`);
}

function dataReceived(data: string): void {
  const jsonObj: unknown = JSON.parse(data);
  console.log(data);
}

initSerial(dataReceived);

window.updateSystemInfo = updateSystemInfo;