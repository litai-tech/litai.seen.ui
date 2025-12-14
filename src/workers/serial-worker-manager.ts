import { fork, ChildProcess } from "child_process";
import { BrowserWindow } from "electron";
import { WorkerInputMessage, WorkerOutputMessage } from "../types";

/**
 * Manages the serial worker process
 */
export class SerialWorkerManager {
  private worker: ChildProcess | null = null;
  private isConnected = false;

  /**
   * Initializes and starts the serial worker
   * @param window - The browser window to send events to
   * @param workerPath - Path to the worker script
   * @param portPath - Serial port path
   * @param baudRate - Serial baud rate
   */
  initialize(
    window: BrowserWindow,
    workerPath: string,
    portPath: string,
    baudRate: number
  ): void {
    // Spawn worker with system Node.js
    this.worker = fork(workerPath, [], {
      execPath: "node",
    });

    this.setupWorkerListeners(window);
    this.connect(portPath, baudRate);
  }

  /**
   * Sets up listeners for worker messages
   */
  private setupWorkerListeners(window: BrowserWindow): void {
    if (!this.worker) return;

    this.worker.on("message", (msg: WorkerOutputMessage) => {
      switch (msg.type) {
        case "data":
          window.webContents.send("serial:dataReceived", msg.data);
          break;
        case "error":
          window.webContents.send("serial:error", msg.error);
          break;
        case "connected":
          window.webContents.send("serial:connected");
          this.isConnected = true;
          break;
      }
    });

    this.worker.on("error", (error) => {
      console.error("Worker process error:", error);
      window.webContents.send("serial:error", error.message);
    });

    this.worker.on("exit", (code, signal) => {
      console.log(`Worker exited with code ${code} and signal ${signal}`);
      this.isConnected = false;
    });
  }

  /**
   * Connects to the serial port
   */
  private connect(portPath: string, baudRate: number): void {
    if (this.isConnected || !this.worker) return;

    const connectMessage: WorkerInputMessage = {
      type: "connect",
      path: portPath,
      baudRate,
    };
    this.worker.send(connectMessage);
  }

  /**
   * Sends data through the serial port
   * @param data - The data to send
   */
  sendData(data: string): void {
    if (!this.isConnected || !this.worker) {
      console.warn("Cannot send data: worker not connected");
      return;
    }

    const message: WorkerInputMessage = { type: "send", data };
    this.worker.send(message);
  }

  /**
   * Disconnects from the serial port and cleans up
   */
  disconnect(): void {
    if (!this.worker) return;

    const disconnectMessage: WorkerInputMessage = { type: "disconnect" };
    this.worker.send(disconnectMessage);
    this.isConnected = false;
  }

  /**
   * Checks if the worker is connected
   */
  get connected(): boolean {
    return this.isConnected;
  }
}

// Singleton instance
export const serialWorkerManager = new SerialWorkerManager();
