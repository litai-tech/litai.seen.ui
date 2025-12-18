# Apps Directory

This directory contains all the individual applications that can be launched from the app selector.

## Structure

Each app should be in its own subdirectory with the following structure:

```
apps/
  ├── app_name/
  │   ├── index.html
  │   └── renderer.ts
  └── another app/
      ├── index.html
      └── renderer.ts
```

## Adding a New App

1. Create a new directory in the `apps` folder with your app name
   - You can use spaces in the folder name (e.g., "WiFi Connector")
   - Underscores will be converted to spaces in the UI (e.g., "wifi_connector" → "WiFi Connector")

2. Create an `index.html` file with your app's UI:

```html
<!doctype html>
<html data-theme="dark">
  <head>
    <meta charset="UTF-8" />
    <title>Your App Name</title>
  </head>
  <body class="min-h-screen bg-base-200 p-8">
    <!-- Your app UI here -->
    <script type="module" src="./renderer.ts"></script>
  </body>
</html>
```

3. Create a `renderer.ts` file with your app's logic:

```typescript
// Import Tailwind CSS - this MUST be the first import!
import "../../src/index.css";

console.log("Your app loaded");

// Add your app-specific logic here
// You have access to all the APIs exposed via preload:
// - window.systemAPI
// - window.settingsAPI
// - window.serialAPI
// - window.appAPI
```

**Important:** Always import `../../src/index.css` at the top of your renderer.ts file to enable Tailwind CSS styling!

## Features

- **Tailwind CSS**: All apps have access to Tailwind CSS and DaisyUI components
- **Auto-start**: If only one app exists in the directory, it will automatically launch on startup
- **DevTools**: Each app can be launched with or without DevTools enabled
- **Electron APIs**: Apps have access to all the exposed APIs via the preload script

## Examples

See the `wifi_connector` and `servo_rotator` directories for example implementations.
