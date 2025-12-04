---
description: How to build and install the application
---

To build the application for your local machine (macOS), follow these steps:

1. Stop the running development server (Ctrl+C in the terminal).
2. Run the build command:
   ```bash
   npm run electron:build
   ```
3. Once the build completes, you will find the installer (DMG file) and the application in the `dist` folder:
   - Installer: `dist/Magic Memo-0.1.0.dmg` (or similar version)
   - App: `dist/mac/Magic Memo.app`

You can double-click the DMG file to install it, or drag the `.app` file to your Applications folder.
