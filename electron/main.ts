/**
 * Electron Main Process Entry Point
 * Orchestrates app initialization and lifecycle management
 */

import { registerAiHandlers } from '@electron/handlers/ai-handlers'
import { registerDataHandlers } from '@electron/handlers/data-handlers'
import { initLogger, log } from '@electron/utils/logger'
import { createWindow } from '@electron/window/main-window'
import { app, BrowserWindow } from 'electron'

// Initialize logger first
initLogger()

// App lifecycle handlers
app.whenReady().then(() => {
	log.info('App starting...')

	// Register IPC handlers before creating window
	registerDataHandlers()
	registerAiHandlers()

	// Create the main window
	createWindow()

	// macOS: Re-create window when dock icon is clicked
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow()
		}
	})
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit()
	}
})
