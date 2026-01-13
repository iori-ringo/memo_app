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
	mainWindow = new BrowserWindow({
		width: DEFAULT_WIDTH,
		height: DEFAULT_HEIGHT,
		webPreferences: {
			preload: path.join(__dirname, 'preload.js'),
			contextIsolation: true,
			nodeIntegration: false,
			sandbox: true,
		},
	})

	const isDev = !app.isPackaged

	if (isDev) {
		mainWindow.loadURL('http://localhost:3000')
		mainWindow.webContents.openDevTools()
	} else {
		mainWindow.loadFile(path.join(__dirname, '../../out/index.html'))
	}

	// Open external links in browser
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith('http')) {
			shell.openExternal(url)
			return { action: 'deny' }
		}
		return { action: 'allow' }
	})

	createMenu()
}
