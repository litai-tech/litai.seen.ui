import { BrowserWindow } from "electron";
import fs from "node:fs";
import path from "node:path";

/**
 * Mock serial worker manager for local development
 * Reads lines from a mock input file and emulates serial data reception
 */
export class MockSerialWorkerManager {
  private interval: NodeJS.Timeout | null = null;
  private isConnected = false;
  private lines: string[] = [];
  private currentLineIndex = 0;
  private window: BrowserWindow | null = null;

  /**
   * Initializes and starts the mock serial worker
   * @param window - The browser window to send events to
   * @param mockInputFile - Path to the mock input file
   * @param intervalMs - Interval between sending lines in milliseconds
   */
  initialize(
    window: BrowserWindow,
    mockInputFile: string,
    intervalMs: number
  ): void {
    this.window = window;

    // Load mock input file
    const filePath = path.join(process.cwd(), mockInputFile);

    if (!fs.existsSync(filePath)) {
      console.warn(`Mock input file not found: ${filePath}`);
      this.window.webContents.send(
        "serial:error",
        `Mock input file not found: ${filePath}`
      );
      return;
    }

    try {
      const fileContent = fs.readFileSync(filePath, "utf-8");
      this.lines = fileContent.split("\n").filter((line) => line.trim() !== "");

      if (this.lines.length === 0) {
        console.warn("Mock input file is empty");
        this.window.webContents.send("serial:error", "Mock input file is empty");
        return;
      }

      console.log(`Loaded ${this.lines.length} lines from ${mockInputFile}`);
      this.startSendingData(intervalMs);

      // Simulate successful connection
      this.isConnected = true;
      this.window.webContents.send("serial:connected");
    } catch (error) {
      console.error("Error loading mock input file:", error);
      this.window.webContents.send(
        "serial:error",
        `Error loading mock input file: ${error.message}`
      );
    }
  }

  /**
   * Starts sending mock data at the specified interval
   */
  private startSendingData(intervalMs: number): void {
    if (this.interval) {
      clearInterval(this.interval);
    }

    this.interval = setInterval(() => {
      if (!this.window || !this.isConnected) {
        return;
      }

      const line = this.lines[this.currentLineIndex];
      this.window.webContents.send("serial:dataReceived", line);
      console.log(`Mock serial data sent (line ${this.currentLineIndex + 1}/${this.lines.length}): ${line}`);

      // Move to next line, loop back to start when reaching the end
      this.currentLineIndex = (this.currentLineIndex + 1) % this.lines.length;
    }, intervalMs);
  }

  /**
   * Sends data (mock implementation, just logs)
   * @param data - The data to send
   */
  sendData(data: string): void {
    if (!this.isConnected) {
      console.warn("Cannot send data: mock worker not connected");
      return;
    }

    console.log("Mock serial data send request:", data);
    // In mock mode, we just log the data that would be sent
  }

  /**
   * Disconnects from the mock serial worker and cleans up
   */
  disconnect(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
    this.isConnected = false;
    this.currentLineIndex = 0;
    console.log("Mock serial worker disconnected");
  }

  /**
   * Checks if the worker is connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const mockSerialWorkerManager = new MockSerialWorkerManager();
