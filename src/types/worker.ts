/**
 * Messages sent to the serial worker process
 */
export type WorkerInputMessage =
  | {
      type: "connect";
      path: string;
      baudRate: number;
    }
  | {
      type: "disconnect";
    }
  | {
      type: "send";
      data: string;
    };

/**
 * Messages received from the serial worker process
 */
export type WorkerOutputMessage =
  | {
      type: "data";
      data: string;
    }
  | {
      type: "error";
      error: string;
    }
  | {
      type: "connected";
    };
