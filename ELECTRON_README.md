# DMBS Desktop

A Windows desktop application built with Electron, Vite, and React.

## Installation

```bash
npm install
```

## Development

Run the app in development mode with Electron:

```bash
npm run electron:dev
```

This will start both the Vite dev server and Electron.

## Production Build

Build the app for production:

```bash
npm run electron:build
```

This will:
1. Build the Vite app
2. Package it with Electron
3. Create an installer in the `dist-electron` folder

## Running the Built App

After building, you can run the executable from the `dist-electron` folder.

## Features

- Native Windows desktop app
- Auto-updater support
- System tray integration
- File dialog support
- Custom menu bar

## Configuration

Edit `electron-builder.json` to customize:
- App name and ID
- Window dimensions
- Build targets
- Installer options

## Notes

- The app uses Vite for development and building
- Electron handles the desktop packaging
- All Electron APIs are available in `electron/main.js`