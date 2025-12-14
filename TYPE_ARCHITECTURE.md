# Type Architecture

## Process Communication Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Main Process                             │
│                         (main.ts)                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Store<AppSettings>                                             │
│  ├─ serialBaudRate: number                                      │
│  └─ serialPortPath: string                                      │
│                                                                  │
│  IPC Handlers:                                                  │
│  ├─ system:getStats → SystemStats | SystemStatsError           │
│  ├─ settings:get → unknown                                      │
│  ├─ settings:set → void                                         │
│  ├─ settings:reset → void                                       │
│  └─ serial:sendData → void                                      │
│                                                                  │
│  Worker Communication:                                          │
│  ├─ Send: WorkerInputMessage                                    │
│  │   ├─ { type: "connect", path, baudRate }                    │
│  │   ├─ { type: "disconnect" }                                 │
│  │   └─ { type: "send", data }                                 │
│  └─ Receive: WorkerOutputMessage                               │
│      ├─ { type: "data", data }                                 │
│      ├─ { type: "error", error }                               │
│      └─ { type: "connected" }                                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ contextBridge
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Preload Script                              │
│                       (preload.ts)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Exposes to Window:                                             │
│                                                                  │
│  systemAPI: SystemAPI                                           │
│  ├─ getSystemStats(): Promise<SystemStats | SystemStatsError>  │
│                                                                  │
│  settingsAPI: SettingsAPI                                       │
│  ├─ get<T>(key): Promise<T>                                    │
│  ├─ set<T>(key, value): Promise<void>                          │
│  └─ reset(): Promise<void>                                      │
│                                                                  │
│  serialAPI: SerialAPI                                           │
│  ├─ sendData(data): Promise<void>                              │
│  ├─ onSerialData(callback): void                                │
│  └─ onSerialError(callback): void                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ window object
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Renderer Process                             │
│                      (renderer.ts)                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Global Functions:                                              │
│  ├─ updateSystemInfo(): Promise<void>                           │
│  ├─ sendSerialRawData(data): Promise<void>                      │
│  └─ sendSerialObj(obj): Promise<void>                           │
│                                                                  │
│  Uses:                                                          │
│  ├─ window.systemAPI                                            │
│  ├─ window.settingsAPI                                          │
│  └─ window.serialAPI                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ initSerial()
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Serial Communication                          │
│                   (system/serial.ts)                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Type Definitions:                                              │
│  ├─ SerialDataHandler: (data: string) => void                  │
│  └─ SerialErrorHandler: (error: string) => void                │
│                                                                  │
│  Exported Functions:                                            │
│  ├─ sendSerialRawData(data): Promise<void>                      │
│  ├─ sendSerialObj(obj): Promise<void>                           │
│  └─ initSerial(handler): void                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Type Dependency Graph

```
types/index.ts (Central Export)
    │
    ├──► types/api.ts
    │    ├─ SystemAPI
    │    ├─ SettingsAPI
    │    ├─ SerialAPI
    │    ├─ SystemStats
    │    └─ SystemStatsError
    │
    ├──► types/settings.ts
    │    ├─ AppSettings
    │    ├─ DEFAULT_SETTINGS
    │    └─ SettingsKey
    │
    ├──► types/worker.ts
    │    ├─ WorkerInputMessage
    │    └─ WorkerOutputMessage
    │
    ├──► types/serial.ts
    │    ├─ SerialDataHandler
    │    └─ SerialErrorHandler
    │
    └──► types/window.d.ts
         └─ Window interface extension
```

## Type Usage Matrix

| Type                  | Used In                          | Purpose                                    |
|-----------------------|----------------------------------|-------------------------------------------|
| `SystemAPI`           | preload.ts, window.d.ts         | System stats API contract                 |
| `SettingsAPI`         | preload.ts, window.d.ts         | Settings API contract                     |
| `SerialAPI`           | preload.ts, window.d.ts         | Serial API contract                       |
| `SystemStats`         | main.ts, renderer.ts            | System statistics data structure          |
| `SystemStatsError`    | main.ts, renderer.ts            | Error response structure                  |
| `AppSettings`         | main.ts, settings.ts            | Application configuration structure       |
| `DEFAULT_SETTINGS`    | main.ts                          | Default configuration values              |
| `SettingsKey`         | settings.ts                      | Type-safe setting keys                    |
| `WorkerInputMessage`  | main.ts                          | Messages sent to worker process           |
| `WorkerOutputMessage` | main.ts                          | Messages received from worker             |
| `SerialDataHandler`   | serial.ts, renderer.ts          | Serial data callback type                 |
| `SerialErrorHandler`  | serial.ts                        | Serial error callback type                |

## Inter-Process Type Safety

### Main → Preload
IPC handlers in main process have explicit return types that match the expected API responses in preload.

```typescript
// main.ts
ipcMain.handle("system:getStats"): Promise<SystemStats | SystemStatsError>

// preload.ts
getSystemStats: () => ipcRenderer.invoke("system:getStats")
// Returns: Promise<SystemStats | SystemStatsError>
```

### Preload → Renderer
Context bridge exposes typed APIs that match the Window interface declarations.

```typescript
// preload.ts
const systemAPI: SystemAPI = {
  getSystemStats: () => ipcRenderer.invoke("system:getStats")
};

// window.d.ts
interface Window {
  systemAPI: SystemAPI;
}
```

### Type Safety Benefits

1. **Compile-Time Validation**: TypeScript ensures all message types match between sender and receiver
2. **Refactoring Safety**: Changing a type updates all usage sites
3. **IDE Support**: Autocomplete and type hints work across process boundaries
4. **Documentation**: Types serve as contracts between processes
5. **Error Prevention**: Catch type mismatches before runtime

## Example Type Flow

### Sending Serial Data

```typescript
// 1. Renderer calls API
renderer.ts: window.serialAPI.sendData("test")
              ↓ (type: string)

// 2. Preload forwards to main
preload.ts: ipcRenderer.invoke("serial:sendData", data)
              ↓ (type: string)

// 3. Main receives and processes
main.ts: (_event: IpcMainInvokeEvent, data: string) => {
           const message: WorkerInputMessage = { type: "send", data };
           worker.send(message);
         }
              ↓ (type: WorkerInputMessage)

// 4. Worker receives typed message
worker: receives { type: "send", data: "test" }
```

### Receiving System Stats

```typescript
// 1. Renderer requests stats
renderer.ts: const info = await window.systemAPI.getSystemStats();
              ↓

// 2. Preload forwards to main
preload.ts: ipcRenderer.invoke("system:getStats")
              ↓

// 3. Main fetches and returns
main.ts: return {
           cpuLoad: "15.32",
           totalRAM: 8192,
           usedRAM: 4096,
           cpuTemp: 45
         }
              ↓ (type: SystemStats | SystemStatsError)

// 4. Renderer receives typed response
renderer.ts: if ("error" in info) { /* error */ }
             else { /* use info.cpuLoad */ }
```

## Best Practices

1. **Always import types from `./types`**: Use the central export for consistency
2. **Use discriminated unions**: Like `WorkerInputMessage` for type-safe message handling
3. **Type guards**: Use `"error" in info` for runtime type narrowing
4. **Explicit return types**: Always specify function return types for clarity
5. **Avoid `any`**: Use `unknown` when the type is truly unknown, then narrow it
