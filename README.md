# Litai.Seen - Electron Application

A modern, type-safe Electron application with modular architecture for serial communication and system monitoring.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development
npm start

# Build application
npm run package

# Create distributable
npm run make
```

## 📁 Project Structure

```
src/
├── main.ts                    # Entry point (19 lines)
├── preload.ts                 # Context bridge
├── renderer.ts                # Renderer entry
│
├── app/                       # Application lifecycle
│   ├── index.ts
│   └── lifecycle.ts
│
├── ipc/                       # IPC handlers
│   ├── index.ts
│   ├── system-handlers.ts
│   ├── settings-handlers.ts
│   └── serial-handlers.ts
│
├── windows/                   # Window management
│   ├── index.ts
│   └── window-manager.ts
│
├── workers/                   # Worker processes
│   ├── index.ts
│   └── serial-worker-manager.ts
│
├── utils/                     # Utilities
│   ├── index.ts
│   └── string-utils.ts
│
├── types/                     # TypeScript types
│   ├── index.ts
│   ├── api.ts
│   ├── settings.ts
│   ├── worker.ts
│   ├── serial.ts
│   └── window.d.ts
│
└── system/                    # System integration
    └── serial.ts
```

## ✨ Features

- **Type-Safe**: Complete TypeScript coverage with strict mode
- **Modular**: Clean separation of concerns
- **IPC Communication**: Type-safe inter-process communication
- **Serial Port**: Worker-based serial communication
- **System Monitoring**: CPU, RAM, temperature monitoring
- **Settings Management**: Persistent electron-store configuration
- **Modern UI**: TailwindCSS + DaisyUI

## 🏗️ Architecture

### Main Process (Node.js)
- **Entry Point**: `main.ts` orchestrates initialization
- **IPC Handlers**: Handle renderer requests
- **Window Manager**: Creates and configures windows
- **Worker Manager**: Manages serial worker process
- **Settings Store**: Persists application settings

### Renderer Process (Chromium)
- **UI Logic**: React-like component structure
- **API Calls**: Type-safe IPC invocations
- **Serial Communication**: Real-time data handling

### Worker Process (Node.js)
- **Serial Port**: Direct hardware communication
- **Isolated**: Runs in separate process for stability

## 📡 API Reference

### System API
```typescript
window.systemAPI.getSystemStats() → SystemStats | SystemStatsError
```

### Settings API
```typescript
window.settingsAPI.get<T>(key: string) → Promise<T>
window.settingsAPI.set<T>(key: string, value: T) → Promise<void>
window.settingsAPI.reset() → Promise<void>
```

### Serial API
```typescript
window.serialAPI.sendData(data: string) → Promise<void>
window.serialAPI.onSerialData(callback: (data: string) => void)
window.serialAPI.onSerialError(callback: (error: string) => void)
```

## 🎯 Key Improvements

### Before Refactoring
- ❌ Monolithic `main.ts` (153 lines)
- ❌ No type definitions
- ❌ Implicit `any` types
- ❌ Mixed concerns
- ❌ Hard to test
- ❌ Poor discoverability

### After Refactoring
- ✅ Modular architecture (19-line entry point)
- ✅ Complete type coverage
- ✅ Strict TypeScript
- ✅ Clear separation of concerns
- ✅ Testable modules
- ✅ Self-documenting code

## 📊 Code Metrics

| Metric | Before | After |
|--------|--------|-------|
| main.ts | 153 lines | 19 lines |
| Type coverage | 0% | 100% |
| Modules | 1 | 8+ |
| Type definitions | 0 | 6 files |
| Documentation | Minimal | Comprehensive |

## 🔧 Configuration

### Application Settings
Stored in `electron-store` with type-safe defaults:

```typescript
{
  serialBaudRate: 115200,
  serialPortPath: "/dev/ttyS3"
}
```

### Window Configuration
Located in `src/windows/window-manager.ts`:

```typescript
const WINDOW_CONFIG = {
  width: 1920,
  height: 1080,
  autoHideMenuBar: true,
}
```

### TypeScript Configuration
`tsconfig.json` configured with:
- Strict mode enabled
- Bundler module resolution
- ESNext target
- Path aliases (`@/*`)

## 📚 Documentation

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture
- **[MAIN_REFACTORING.md](MAIN_REFACTORING.md)** - Main process refactoring details
- **[REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md)** - TypeScript refactoring overview
- **[TYPE_ARCHITECTURE.md](TYPE_ARCHITECTURE.md)** - Type system architecture
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference guide
- **[src/types/README.md](src/types/README.md)** - Type definitions guide

## 🛠️ Development

### Adding New Features

1. **New IPC Handler**
   - Create handler in `src/ipc/`
   - Register in `src/ipc/index.ts`
   - Add to preload script
   - Use in renderer

2. **New Setting**
   - Update `AppSettings` type
   - Add to `DEFAULT_SETTINGS`
   - Access via `settingsStore`

3. **New Type**
   - Create in `src/types/`
   - Export from `src/types/index.ts`
   - Import and use

### Testing

```bash
# Type check
npx tsc --noEmit

# Build test
npm run package

# Run application
npm start
```

## 🔒 Security

- ✅ Context isolation enabled
- ✅ Node integration disabled
- ✅ Controlled API exposure via preload
- ✅ Type-safe IPC communication
- ✅ No remote code execution

## 🎨 Tech Stack

- **Electron**: ^39.2.2
- **TypeScript**: Latest
- **Vite**: ^5.4.21
- **TailwindCSS**: ^4.1.17
- **DaisyUI**: ^5.5.5
- **Electron Store**: ^11.0.2
- **SerialPort**: ^13.0.0
- **SystemInformation**: ^5.27.11

## 📝 Scripts

```bash
npm start              # Development mode with hot reload
npm run package        # Build packaged application
npm run make          # Create distributable
npm run lint          # Run ESLint
```

## 🤝 Contributing

1. Follow existing code structure
2. Add TypeScript types for everything
3. Document new features
4. Test before committing
5. Update relevant documentation

## 📄 License

MIT

## 👥 Author

Andrew Snigur

---

## 🎓 Learning Resources

This project demonstrates:
- Modern Electron architecture
- TypeScript best practices
- IPC communication patterns
- Worker process management
- Modular code organization
- Type-safe development

Perfect for learning how to build:
- Type-safe Electron apps
- Modular main process
- Worker-based architecture
- Serial port communication
- System monitoring apps

---

**Built with ❤️ using Electron + TypeScript + Vite**
