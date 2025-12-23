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

### How It Works

1. **On Startup**: The app scans the [apps/](apps/) directory
2. **Single App**: If only one app exists, it launches automatically
3. **Multiple Apps**: The app selector displays all available apps as clickable cards
4. **App Launch**: Clicking an app loads its HTML and TypeScript
5. **Return Home**: Apps can return to selector via `window.appAPI.goToAppSelector()`

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

## 📱 Current Apps

The project includes two example applications:

### WiFi Connector
Located in [apps/wifi_connector/](apps/wifi_connector/)
- Configure WiFi network credentials
- On-screen keyboard for SSID and password input
- Touch-friendly interface

### Servo Rotator
Located in [apps/servo_rotator/](apps/servo_rotator/)
- Control servo motor rotation
- Serial communication for motor commands

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

All apps have access to these APIs via the preload script:

### App API
```typescript
window.appAPI.launchApp(appName: string, withDevTools?: boolean) → Promise<void>
window.appAPI.goToAppSelector() → Promise<void>
window.appAPI.getLocalIp() → Promise<string>
```

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

### Config API
```typescript
window.configAPI.get<T>(key: string) → Promise<T>
window.configAPI.getAll() → Promise<Config>
```

## 🎯 Key Features of Multi-App Architecture

### Scalability
- ✅ **Add apps instantly**: Drop HTML + TypeScript in [apps/](apps/) directory
- ✅ **No configuration needed**: Apps auto-discovered and displayed
- ✅ **Auto-launch**: Single apps start immediately without selector
- ✅ **Isolated code**: Each app is self-contained

### Development Workflow
- ✅ **Environment switching**: Test with mock data (`start:local`) or real device (`start`)
- ✅ **Shared utilities**: Common tools in [tools/](tools/) folder
- ✅ **Type-safe APIs**: All IPC calls are strongly typed
- ✅ **Hot reload**: Vite-powered development server

### Architecture Benefits
- ✅ **Modular**: Clean separation between apps, shared tools, and configs
- ✅ **Type-safe**: Complete TypeScript coverage with strict mode
- ✅ **Testable**: Mock serial data for development without hardware
- ✅ **Maintainable**: Self-documenting code with clear structure

## 🔧 Configuration

### Environment Configurations
Located in [configs/](configs/) directory:

**[configs/local.json](configs/local.json)** - Local development settings:
```json
{
  "serialBaudRate": 115200,
  "serialPortPath": "/dev/ttyS3",
  "useMockSerial": true
}
```

**[configs/target.json](configs/target.json)** - Target device settings:
```json
{
  "serialBaudRate": 115200,
  "serialPortPath": "/dev/ttyS3",
  "useMockSerial": false
}
```

### Application Settings
Stored in `electron-store` with type-safe defaults (persistent across sessions)

### Electron Configuration
- **Forge Config**: [electron_configs/forge.config.ts](electron_configs/forge.config.ts)
- **TypeScript Config**: [electron_configs/tsconfig.json](electron_configs/tsconfig.json)
- **Vite Configs**: [electron_configs/vite.*.config.mts](electron_configs/)

Configured with:
- Strict TypeScript mode
- Hot module reload (Vite)
- Multi-entry point support for apps

## 📚 Documentation

- **[apps/README.md](apps/README.md)** - How to create new apps
- **[APP_SELECTOR_IMPLEMENTATION.md](APP_SELECTOR_IMPLEMENTATION.md)** - App selector architecture
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Complete system architecture
- **[TYPE_ARCHITECTURE.md](TYPE_ARCHITECTURE.md)** - Type system architecture

## 🛠️ Development

### Creating a New App

1. Create a directory in [apps/](apps/) with your app name
2. Add `index.html` with your UI
3. Add `renderer.ts` with your logic (import `../../tools/index.css` first!)
4. The app will automatically appear in the app selector

See [apps/README.md](apps/README.md) for detailed instructions.

### Adding New Features

1. **New IPC Handler**
   - Create handler in `tools/ipc/`
   - Register in IPC index
   - Add to [tools/preload.ts](tools/preload.ts)
   - Use in renderer

2. **New Setting**
   - Update `AppSettings` type in [types/settings.ts](types/settings.ts)
   - Add to `DEFAULT_SETTINGS`
   - Access via `settingsStore`

3. **New Type**
   - Create in [types/](types/)
   - Export and import as needed

4. **Environment-Specific Config**
   - Add values to [configs/local.json](configs/local.json) and [configs/target.json](configs/target.json)
   - Access via `window.configAPI.get(key)`

### Testing

```bash
# Type check
npx tsc --noEmit

# Run locally with mock serial
npm run start:local

# Run with real device serial
npm start

# Build test
npm run package
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
npm start              # Start with target environment (device serial)
npm run start:local    # Start with local environment (mock serial)
npm run package        # Build packaged application
npm run make           # Create distributable
npm run lint           # Run ESLint
```

## 🌍 Environments

The app supports two environments controlled by the `APP_ENV` variable:

### Local Environment (`APP_ENV=local`)
- Uses mock serial data from [mock-serial-input.txt](mock-serial-input.txt)
- Loads configuration from [configs/local.json](configs/local.json)
- Perfect for development without hardware

### Target Environment (`APP_ENV=target`)
- Connects to real serial device
- Loads configuration from [configs/target.json](configs/target.json)
- Used for production/device deployment

## 🤝 Contributing

1. Follow existing code structure
2. Add TypeScript types for everything
3. Create new apps in the [apps/](apps/) directory
4. Keep shared code in [tools/](tools/)
5. Document new features
6. Test with both `npm start:local` and `npm start`
7. Update relevant documentation

## 📄 License

MIT

## 👥 Author

Andrew Snigur

---

## 🎓 Learning Resources

This project demonstrates:
- **Multi-app Electron architecture** with app selector
- **Environment-based configuration** for local/target deployment
- **TypeScript best practices** with strict mode
- **IPC communication patterns** with type safety
- **Worker process management** for serial communication
- **Modular code organization** with shared tools
- **Mock data support** for hardware-independent development

Perfect for learning how to build:
- Multi-app Electron applications
- Type-safe Electron apps with environment configs
- Modular main process architecture
- Worker-based serial communication
- Touch-friendly interfaces with on-screen keyboard
- System monitoring apps

---

**Built with ❤️ using Electron + TypeScript + Vite**
