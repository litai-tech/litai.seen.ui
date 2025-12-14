# Application Architecture

## Complete Project Structure

```
litai.seen.ui/
├─ src/
│  ├─ main.ts                      # 🚀 Entry point (19 lines)
│  │
│  ├─ app/                         # 📱 Application Lifecycle
│  │  ├─ index.ts
│  │  └─ lifecycle.ts              # App event handlers
│  │
│  ├─ ipc/                         # 📡 IPC Communication
│  │  ├─ index.ts                  # Handler registration
│  │  ├─ system-handlers.ts        # System stats
│  │  ├─ settings-handlers.ts      # Settings CRUD
│  │  └─ serial-handlers.ts        # Serial communication
│  │
│  ├─ windows/                     # 🪟 Window Management
│  │  ├─ index.ts
│  │  └─ window-manager.ts         # Window creation
│  │
│  ├─ workers/                     # 🔧 Worker Processes
│  │  ├─ index.ts
│  │  └─ serial-worker-manager.ts  # Serial worker lifecycle
│  │
│  ├─ utils/                       # 🛠️ Utilities
│  │  ├─ index.ts
│  │  └─ string-utils.ts           # String helpers
│  │
│  ├─ types/                       # 📝 TypeScript Types
│  │  ├─ index.ts
│  │  ├─ api.ts
│  │  ├─ settings.ts
│  │  ├─ worker.ts
│  │  ├─ serial.ts
│  │  └─ window.d.ts
│  │
│  ├─ system/                      # 🔌 System Integration
│  │  └─ serial.ts                 # Serial helpers (renderer)
│  │
│  ├─ preload.ts                   # 🌉 Context Bridge
│  ├─ renderer.ts                  # 🎨 Renderer Process
│  └─ index.css                    # 💅 Styles
│
├─ serial-worker/                  # ⚙️ Separate Worker App
│  └─ index.js                     # (Not modified)
│
├─ public/                         # 📦 Static Assets
│  └─ servo_horn.png
│
├─ tsconfig.json                   # ⚙️ TypeScript Config
├─ package.json                    # 📦 Dependencies
└─ forge.config.ts                 # 🔨 Electron Forge Config
```

## Process Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          MAIN PROCESS                                │
│                           (Node.js)                                  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐                                                   │
│  │  main.ts     │  Entry Point                                      │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ├─────► registerAllIpcHandlers()                            │
│         │         ├─ system-handlers.ts                             │
│         │         ├─ settings-handlers.ts                           │
│         │         └─ serial-handlers.ts                             │
│         │                                                            │
│         └─────► registerLifecycleHandlers()                         │
│                   └─ lifecycle.ts                                   │
│                       ├─ createMainWindow()                         │
│                       │   └─ window-manager.ts                      │
│                       │       └─ initializeSerialWorker()           │
│                       │           └─ serial-worker-manager.ts       │
│                       │                                              │
│                       ├─ handleAllWindowsClosed()                   │
│                       └─ handleActivate()                           │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  settingsStore (electron-store)                              │  │
│  │  ├─ serialBaudRate: 115200                                   │  │
│  │  └─ serialPortPath: "/dev/ttyS3"                             │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  serialWorkerManager                                          │  │
│  │  ├─ worker: ChildProcess                                      │  │
│  │  ├─ isConnected: boolean                                      │  │
│  │  ├─ initialize()                                               │  │
│  │  ├─ sendData()                                                 │  │
│  │  └─ disconnect()                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ IPC (contextBridge)
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                      PRELOAD SCRIPT                                  │
│                     (Context Bridge)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Exposes APIs:                                                      │
│  ├─ window.systemAPI                                                │
│  ├─ window.settingsAPI                                              │
│  └─ window.serialAPI                                                │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ window object
                           │
┌──────────────────────────▼──────────────────────────────────────────┐
│                     RENDERER PROCESS                                 │
│                        (Chromium)                                    │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐                                                   │
│  │ renderer.ts  │                                                   │
│  └──────┬───────┘                                                   │
│         │                                                            │
│         ├─────► initSerial()                                        │
│         │         └─ system/serial.ts                               │
│         │                                                            │
│         └─────► updateSystemInfo()                                  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  UI (HTML/CSS)                                                │  │
│  │  └─ index.css (TailwindCSS + DaisyUI)                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                      WORKER PROCESS                                  │
│                   (Separate Node.js)                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  serial-worker/index.js                                       │  │
│  │  ├─ Manages SerialPort connection                             │  │
│  │  ├─ Receives: WorkerInputMessage                              │  │
│  │  └─ Sends: WorkerOutputMessage                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           │ IPC (child_process)
                           │
                           ▼
                    Serial Port Hardware
```

## Data Flow Examples

### Example 1: Getting System Stats

```
1. User Action (Renderer)
   renderer.ts: window.systemAPI.getSystemStats()
                    │
                    │ IPC invoke
                    ▼
2. Preload Bridge
   preload.ts: ipcRenderer.invoke("system:getStats")
                    │
                    │ IPC channel
                    ▼
3. Main Process Handler
   ipc/system-handlers.ts: handleGetSystemStats()
                    │
                    │ Query system
                    ▼
4. System Information
   systeminformation: si.currentLoad(), si.mem(), si.cpuTemperature()
                    │
                    │ Return data
                    ▼
5. Type-Safe Response
   Return: SystemStats | SystemStatsError
                    │
                    │ IPC response
                    ▼
6. Renderer Updates
   renderer.ts: Display stats in UI
```

### Example 2: Sending Serial Data

```
1. User Action (Renderer)
   renderer.ts: window.serialAPI.sendData("test")
                    │
                    │ IPC invoke
                    ▼
2. Preload Bridge
   preload.ts: ipcRenderer.invoke("serial:sendData", data)
                    │
                    │ IPC channel
                    ▼
3. Main Process Handler
   ipc/serial-handlers.ts: handleSendSerialData()
                    │
                    │ Format data
                    ▼
4. String Utility
   utils/string-utils.ts: ensureNewline(data, true)
                    │
                    │ Send to worker
                    ▼
5. Worker Manager
   workers/serial-worker-manager.ts: sendData()
                    │
                    │ IPC message
                    ▼
6. Worker Process
   serial-worker/index.js: SerialPort.write()
                    │
                    │ Hardware
                    ▼
7. Serial Port
   Physical serial communication
```

### Example 3: Receiving Serial Data

```
1. Serial Port Hardware
   Data received on serial port
                    │
                    │ Event
                    ▼
2. Worker Process
   serial-worker/index.js: port.on("data", ...)
                    │
                    │ IPC message
                    ▼
3. Worker Manager
   workers/serial-worker-manager.ts: worker.on("message", ...)
                    │
                    │ Forward to renderer
                    ▼
4. Window Event
   window.webContents.send("serial:dataReceived", data)
                    │
                    │ IPC event
                    ▼
5. Preload Listener
   preload.ts: ipcRenderer.on("serial:dataReceived", ...)
                    │
                    │ Callback
                    ▼
6. Renderer Handler
   system/serial.ts: handleSerialData(data)
                    │
                    │ Process
                    ▼
7. Application Logic
   renderer.ts: dataReceived(data) → JSON.parse()
```

## Module Dependency Graph

```
main.ts
  │
  ├─► app/lifecycle ─────────┐
  │                          │
  │                          ├─► windows/window-manager ─────┐
  │                          │                               │
  │                          │                               ├─► ipc/settings-handlers
  │                          │                               │     (settingsStore)
  │                          │                               │
  │                          │                               └─► workers/serial-worker-manager
  │                          │
  │                          └─► workers/serial-worker-manager
  │
  └─► ipc/
        ├─► system-handlers
        │
        ├─► settings-handlers
        │     (exports settingsStore)
        │
        └─► serial-handlers ───┐
                               │
                               ├─► workers/serial-worker-manager
                               │
                               └─► utils/string-utils

types/ (imported by all modules)
  ├─ api.ts
  ├─ settings.ts
  ├─ worker.ts
  ├─ serial.ts
  └─ window.d.ts
```

## Type Flow

```
                    ┌─────────────────┐
                    │   types/        │
                    │   - api.ts      │
                    │   - settings.ts │
                    │   - worker.ts   │
                    │   - serial.ts   │
                    │   - window.d.ts │
                    └────────┬────────┘
                             │
                 ┌───────────┼───────────┐
                 │           │           │
                 ▼           ▼           ▼
         ┌──────────┐  ┌──────────┐  ┌──────────┐
         │  Main    │  │ Preload  │  │ Renderer │
         │ Process  │  │  Script  │  │ Process  │
         └──────────┘  └──────────┘  └──────────┘
```

## Communication Patterns

### IPC Handler Pattern
```typescript
// 1. Define handler in ipc/
export function registerXxxHandlers(): void {
  ipcMain.handle("xxx:action", handleAction);
}

function handleAction(event: IpcMainInvokeEvent, data: Type): ReturnType {
  // Implementation
}

// 2. Register in ipc/index.ts
export function registerAllIpcHandlers(): void {
  registerXxxHandlers();
}

// 3. Call from main.ts
registerAllIpcHandlers();
```

### Worker Communication Pattern
```typescript
// 1. Send message to worker
const message: WorkerInputMessage = { type: "action", data };
worker.send(message);

// 2. Listen for worker response
worker.on("message", (msg: WorkerOutputMessage) => {
  switch (msg.type) {
    case "data":
      // Handle data
      break;
  }
});
```

### Singleton Pattern
```typescript
// 1. Create class
export class Manager {
  // Implementation
}

// 2. Export singleton instance
export const manager = new Manager();

// 3. Import and use
import { manager } from "./manager";
manager.doSomething();
```

## Error Handling Strategy

```
┌─────────────────────────────────────────┐
│          Error Occurs                    │
└───────────────┬─────────────────────────┘
                │
                ├─► Log to console
                │   console.error("Error:", e)
                │
                ├─► Return error response
                │   return { error: "message" }
                │
                └─► Forward to renderer
                    window.webContents.send("xxx:error", error)
                             │
                             ▼
                    ┌─────────────────────┐
                    │  Renderer displays  │
                    │  error to user      │
                    └─────────────────────┘
```

## Build Process

```
npm run package
      │
      ├─► TypeScript compilation
      │   ├─ src/ → .vite/build/
      │   ├─ Type checking
      │   └─ Source maps
      │
      ├─► Vite bundling
      │   ├─ Main process
      │   ├─ Preload script
      │   └─ Renderer process
      │
      └─► Electron Forge packaging
          ├─ Create executable
          ├─ Include dependencies
          └─ Platform-specific builds
```

## Key Design Principles

1. **Single Responsibility**: Each module has one clear purpose
2. **Dependency Injection**: Dependencies passed as parameters
3. **Type Safety**: TypeScript types throughout
4. **Separation of Concerns**: Clear boundaries between modules
5. **Singleton Pattern**: Shared managers (worker, store)
6. **Factory Pattern**: Window creation
7. **Observer Pattern**: Event listeners
8. **Module Pattern**: Organized file structure

## Performance Considerations

- **Lazy Loading**: Modules loaded on demand
- **Singleton Workers**: Reuse worker processes
- **Event-Driven**: Non-blocking IPC communication
- **Type Checking**: Compile-time, not runtime
- **Store Caching**: electron-store handles persistence

## Security Features

- **Context Isolation**: Renderer isolated from Node.js
- **No Node Integration**: Renderer can't access Node APIs
- **Preload Script**: Controlled API exposure
- **Type Validation**: TypeScript ensures correct data types
- **IPC Validation**: Handler parameter validation
