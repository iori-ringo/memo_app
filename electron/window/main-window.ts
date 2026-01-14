/**
 * Main Window Manager
 * Creates and manages the main application window
 */
import * as path from 'node:path'
import { createMenu } from '@electron/window/menu'
import { app, BrowserWindow, shell } from 'electron'

/** Default window dimensions */
const DEFAULT_WIDTH = 1280
const DEFAULT_HEIGHT = 800

/** Allowed URL schemes for external links */
const ALLOWED_EXTERNAL_SCHEMES = ['https:', 'mailto:']

/** Main window instance */
let mainWindow: BrowserWindow | null = null

/**
 * Returns the main window instance
 * @returns The main BrowserWindow or null if not created
 */
export function getMainWindow(): BrowserWindow | null {
	return mainWindow
}

/**
 * Creates the main application window
 */
export function createWindow(): void {
	const isDev = !app.isPackaged

	mainWindow = new BrowserWindow({
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT,
		webPreferences: {
			// Use app.getAppPath() for reliable path resolution in both dev and production
			preload: path.join(app.getAppPath(), 'electron/dist/preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	})

	if (isDev) {
		mainWindow.loadURL('http://localhost:3000')
		mainWindow.webContents.openDevTools()
	} else {
		mainWindow.loadFile(path.join(app.getAppPath(), 'out/index.html'))
	}

	// Block navigation to external URLs (security)
	// Development: allow localhost, Production: allow file:// protocol
	mainWindow.webContents.on('will-navigate', (event, url) => {
		const isAllowed = isDev ? url.startsWith('http://localhost:3000') : url.startsWith('file://')
		if (!isAllowed) {
			event.preventDefault()
		}
	})

	// Open external links in browser with restricted schemes
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		try {
			const { protocol } = new URL(url)
			if (ALLOWED_EXTERNAL_SCHEMES.includes(protocol)) {
				shell.openExternal(url)
			}
		} catch {
			// Invalid URL - ignore
		}
		return { action: 'deny' }
	})

	// Clean up window reference when closed
	mainWindow.on('closed', () => {
		mainWindow = null
	})

	createMenu()
}
