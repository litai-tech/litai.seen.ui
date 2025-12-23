# Litai.Seen - Electron Application

A modern, type-safe Electron application with modular multi-app architecture for serial communication and system monitoring.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development (target environment - points to device serial port)
npm start

# Start local development (local environment - uses mock serial data)
npm run start:local

# Build application
npm run package

# Create distributable
npm run make
```

### Starting the Local Electron App

To run the app locally with mock serial data:

```bash
npm run start:local
```

This will:
- Launch the app with `APP_ENV=local` environment variable
- Use mock serial data from [mock-serial-input.txt](mock-serial-input.txt)
- Display the app selector if multiple apps exist, or auto-launch a single app
- Enable development tools for debugging

## 📁 Project Structure

```
litai.seen.ui/
├── apps/                          # Individual applications
│   ├── README.md                  # Apps documentation
│   ├── wifi_connector/            # WiFi configuration app
│   │   ├── index.html
│   │   └── renderer.ts
│   └── servo_rotator/             # Servo control app
│       ├── index.html
│       └── renderer.ts
│
├── app_selector/                  # App selection screen
│   ├── index.ts                   # App selector logic
│   └── lifecycle.ts               # App launcher
│
├── tools/                         # Shared tools & utilities
│   ├── index.css                  # Global styles (Tailwind)
│   ├── main.ts                    # Main process entry
│   ├── preload.ts                 # Preload script (context bridge)
│   ├── renderer.ts                # App selector renderer
│   ├── ipc/                       # IPC handlers
│   │   ├── app-handlers.ts
│   │   ├── config-handlers.ts
│   │   ├── serial-handlers.ts
│   │   ├── settings-handlers.ts
│   │   └── system-handlers.ts
│   ├── serial-worker/             # Serial port worker
│   ├── system/                    # System integration
│   ├── utils/                     # Shared utilities
│   │   ├── keyboard.ts            # On-screen keyboard
│   │   └── string-utils.ts
│   ├── windows/                   # Window management
│   └── workers/                   # Worker managers
│
├── types/                         # TypeScript type definitions
│   ├── api.ts                     # API types
│   ├── config.ts                  # Config types
│   ├── serial.ts                  # Serial types
│   ├── settings.ts                # Settings types
│   └── window.d.ts                # Window types
│
├── electron_configs/              # Electron configuration files
│   ├── forge.config.ts            # Electron Forge config
│   ├── tsconfig.json              # TypeScript config
│   └── vite.*.config.mts          # Vite configs
│
├── configs/                       # App-specific configurations
│   ├── local.json                 # Local environment config
│   └── target.json                # Target environment config
│
├── index.html                     # App selector HTML
├── forge.config.ts                # Forge config export
├── tsconfig.json                  # Root TypeScript config
├── package.json                   # Dependencies & scripts
└── mock-serial-input.txt          # Mock data for local dev
```

## ✨ Features

- **Multi-App Architecture**: Launch multiple applications from a single selector
- **Auto-Launch**: Single apps automatically start without selector
- **Type-Safe**: Complete TypeScript coverage with strict mode
- **Environment Configs**: Switch between local (mock) and target (device) environments
- **IPC Communication**: Type-safe inter-process communication
- **Serial Port**: Worker-based serial communication with mock support
- **System Monitoring**: CPU, RAM, temperature monitoring
- **On-Screen Keyboard**: Virtual keyboard for touch interfaces
- **Settings Management**: Persistent electron-store configuration
- **Modern UI**: TailwindCSS + DaisyUI

## 🏗️ Architecture

### Multi-App System
The application uses a **modular multi-app architecture**:

1. **App Selector**: Displays available apps on startup (if multiple apps exist)
2. **Individual Apps**: Each app is self-contained in the [apps/](apps/) directory
3. **Shared Tools**: Common utilities and services in [tools/](tools/) directory
4. **Environment Configs**: JSON configs for local/target environments in [configs/](configs/)

### Main Process (Node.js)
- **Entry Point**: [tools/main.ts](tools/main.ts) orchestrates initialization
- **App Lifecycle**: [app_selector/lifecycle.ts](app_selector/lifecycle.ts) manages app launching
- **IPC Handlers**: Handle renderer requests (in [tools/ipc/](tools/ipc/))
- **Window Manager**: Creates and configures windows
- **Worker Manager**: Manages serial worker process
- **Config Loader**: Loads environment-specific configurations

### Renderer Process (Chromium)
- **App Selector UI**: Main selection interface
- **Individual App UIs**: Each app has its own HTML/TypeScript
- **API Calls**: Type-safe IPC invocations
- **Serial Communication**: Real-time data handling
- **Shared Keyboard**: On-screen keyboard utility

### Worker Process (Node.js)
- **Serial Port**: Direct hardware communication (or mock data)
- **Isolated**: Runs in separate process for stability
- **Environment-Aware**: Uses real or mock serial based on `APP_ENV`

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
