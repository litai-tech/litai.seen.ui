# App Selector Feature - Implementation Summary

## Overview

The app selector feature allows your Electron application to launch different apps from a unified selector interface. When the application starts, it displays a UI with buttons for each available app, and users can choose which app to launch with an option to open DevTools.

## Features Implemented

1. **App Discovery**: Automatically scans the `apps/` directory for available applications
2. **App Selector UI**: Beautiful Tailwind-styled interface with cards for each app
3. **Auto-Start**: If only one app exists, it automatically launches without showing the selector
4. **DevTools Control**: Each app has a checkbox to optionally open DevTools
5. **Space Handling**: App names with spaces or underscores are properly handled and formatted

## File Structure

```
litai.seen.ui/
├── apps/                           # Apps directory
│   ├── README.md                  # Documentation for creating apps
│   ├── wifi_connector/            # Example app
│   │   ├── index.html
│   │   └── renderer.ts
│   └── servo_rotator/             # Example app
│       ├── index.html
│       └── renderer.ts
├── src/
│   ├── ipc/
│   │   ├── app-handlers.ts        # NEW: IPC handlers for app operations
│   │   └── index.ts               # UPDATED: Registers app handlers
│   ├── types/
│   │   ├── api.ts                 # UPDATED: Added AppAPI and AppInfo types
│   │   ├── index.ts               # UPDATED: Exports new types
│   │   └── window.d.ts            # UPDATED: Added appAPI to window
│   ├── windows/
│   │   └── window-manager.ts      # UPDATED: Auto-start logic
│   ├── preload.ts                 # UPDATED: Exposes appAPI
│   └── renderer.ts                # UPDATED: App selector UI logic
├── index.html                      # UPDATED: App selector UI
└── forge.config.ts                 # UPDATED: Includes apps in build
```

## Key Components

### 1. App Discovery ([src/ipc/app-handlers.ts](src/ipc/app-handlers.ts))

The `getAvailableApps()` function scans the `apps/` directory and returns all valid apps:
- Checks for subdirectories in `apps/`
- Validates each app has an `index.html` file
- Returns app name and path
- Works in both development and production environments

### 2. App Selector UI ([index.html](index.html) + [src/renderer.ts](src/renderer.ts))

- Displays a grid of app cards using Tailwind CSS and DaisyUI
- Each card shows:
  - Formatted app name (converts underscores to spaces, capitalizes words)
  - Checkbox to open DevTools
  - Launch button
- Handles loading states and error states

### 3. Auto-Start Logic ([src/windows/window-manager.ts](src/windows/window-manager.ts:22-48))

When the main window is created:
- Checks if there's only one app in the `apps/` directory
- If yes: Automatically launches that app
- If no: Shows the app selector

### 4. IPC Communication

Two IPC channels:
- `app:getAvailableApps`: Returns list of available apps
- `app:loadApp`: Loads the selected app with DevTools option

## How to Add a New App

1. Create a new folder in `apps/` (e.g., `apps/my_new_app` or `apps/My New App`)

2. Create `index.html`:
```html
<!doctype html>
<html data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <title>My New App</title>
  </head>
  <body class="min-h-screen bg-base-200 p-8">
    <!-- Your UI here -->
    <script type="module" src="./renderer.ts"></script>
  </body>
</html>
```

3. Create `renderer.ts`:
```typescript
// Import Tailwind CSS - this MUST be the first import!
import "../../src/index.css";

console.log("My new app loaded");

// Your app logic here
// Access to: window.systemAPI, window.settingsAPI, window.serialAPI, window.appAPI
```

**Important:** Always import `../../src/index.css` at the top of your renderer.ts file!

4. Restart the Electron app - your new app will appear in the selector!

## API Access in Apps

All apps have access to the following APIs via the preload script:

- `window.systemAPI`: System statistics
- `window.settingsAPI`: Application settings
- `window.serialAPI`: Serial port communication
- `window.appAPI`: App management (get available apps, load app)

## Production Build

The `apps/` directory is included in the packaged app via the `extraResource` configuration in [forge.config.ts](forge.config.ts:13-15).

## Testing

To test the app selector:
1. Run `npm run start:local` or `npm run start`
2. The app selector should appear with two example apps
3. Click any app to launch it
4. Check the DevTools checkbox to open DevTools when launching

To test auto-start:
1. Remove all but one app from the `apps/` directory
2. Run the app
3. It should automatically launch the single app without showing the selector

## Notes

- App names with underscores (e.g., `wifi_connector`) are displayed with spaces and capitalization (e.g., "Wifi Connector")
- App names can contain spaces in the folder name
- Each app runs in the same window - loading a new app replaces the current one
- DevTools preference is not persisted between launches
