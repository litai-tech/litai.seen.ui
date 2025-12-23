# TypeScript Type Definitions

This directory contains all TypeScript type definitions for the application.

## Structure

```
src/types/
├── index.ts          # Central export file for all types
├── api.ts            # API interfaces exposed to renderer via contextBridge
├── settings.ts       # Application settings types
├── worker.ts         # Worker process message types
├── serial.ts         # Serial communication handler types
└── window.d.ts       # Global window interface extensions
```

## Type Files

### `api.ts`
Contains interfaces for the three main APIs exposed to the renderer process:
- `SystemAPI`: System information queries
- `SettingsAPI`: Application settings management
- `SerialAPI`: Serial port communication

### `settings.ts`
Defines the structure of application settings stored in electron-store:
- `AppSettings`: The settings interface
- `DEFAULT_SETTINGS`: Default values for settings
- `SettingsKey`: Type-safe keys for settings access

### `worker.ts`
Type definitions for inter-process communication with the serial worker:
- `WorkerInputMessage`: Messages sent to the worker (connect, disconnect, send)
- `WorkerOutputMessage`: Messages received from the worker (data, error, connected)

### `serial.ts`
Handler function types for serial communication:
- `SerialDataHandler`: Callback for received serial data
- `SerialErrorHandler`: Callback for serial errors

### `window.d.ts`
Global type declarations extending the Window interface with:
- `systemAPI`, `settingsAPI`, `serialAPI`
- Utility functions exposed globally

## Usage

Import types from the central index file:

```typescript
import { SystemAPI, AppSettings, WorkerInputMessage } from "./types";
```

Or import directly from specific files:

```typescript
import { SystemAPI } from "./types/api";
```

## Benefits

1. **Type Safety**: All APIs and data structures are strongly typed
2. **IDE Support**: Better autocomplete and intellisense
3. **Refactoring**: Easier to refactor with compile-time checks
4. **Documentation**: Types serve as inline documentation
5. **Error Prevention**: Catch errors at compile time instead of runtime
