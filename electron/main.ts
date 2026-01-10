import * as path from 'node:path'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as dotenv from 'dotenv'
import { app, BrowserWindow, ipcMain, Menu, shell } from 'electron'
import log from 'electron-log'
import Store from 'electron-store'
import { type AppConfig, IPC_CHANNELS, type NotePage } from './ipc/types'

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env.local') })
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Configure electron-log
log.transports.file.level = 'info'
log.transports.console.level = 'debug'

// Type-safe stores
interface PagesStoreSchema {
	pages: NotePage[]
}

interface ConfigStoreSchema {
	config: AppConfig
}

const pagesStore = new Store<PagesStoreSchema>({
	name: 'pages',
	defaults: {
		pages: [],
	},
})

const configStore = new Store<ConfigStoreSchema>({
	name: 'config',
	defaults: {
		config: {},
	},
})

let mainWindow: BrowserWindow | null = null

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
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

function createMenu() {
	const template: Electron.MenuItemConstructorOptions[] = [
		{
			label: app.name,
			submenu: [
				{ role: 'about' },
				{ type: 'separator' },
				{ role: 'services' },
				{ type: 'separator' },
				{ role: 'hide' },
				{ role: 'hideOthers' },
				{ role: 'unhide' },
				{ type: 'separator' },
				{ role: 'quit' },
			],
		},
		{
			label: 'File',
			submenu: [
				{
					label: 'New Page',
					accelerator: 'CmdOrCtrl+M',
					click: () => mainWindow?.webContents.send(IPC_CHANNELS.NEW_PAGE),
				},
				{ type: 'separator' },
				{ role: 'close' },
			],
		},
		{
			label: 'Edit',
			submenu: [
				{ role: 'undo' },
				{ role: 'redo' },
				{ type: 'separator' },
				{ role: 'cut' },
				{ role: 'copy' },
				{ role: 'paste' },
				{ role: 'selectAll' },
			],
		},
		{
			label: 'View',
			submenu: [
				{ role: 'reload' },
				{ role: 'forceReload' },
				{ role: 'toggleDevTools' },
				{ type: 'separator' },
				{ role: 'resetZoom' },
				{ role: 'zoomIn' },
				{ role: 'zoomOut' },
				{ type: 'separator' },
				{ role: 'togglefullscreen' },
				{
					label: 'Toggle Dark Mode',
					click: () => mainWindow?.webContents.send(IPC_CHANNELS.TOGGLE_DARK),
				},
			],
		},
	]

	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
}

/* ---------- Validation Helpers ---------- */

function isValidNotePage(page: unknown): page is NotePage {
	if (typeof page !== 'object' || page === null) return false
	const p = page as NotePage
	return (
		typeof p.id === 'string' &&
		typeof p.title === 'string' &&
		typeof p.notebookId === 'string' &&
		Array.isArray(p.tags) &&
		typeof p.createdAt === 'number' &&
		typeof p.updatedAt === 'number'
	)
}

function isValidPages(pages: unknown): pages is NotePage[] {
	return Array.isArray(pages) && pages.every(isValidNotePage)
}

function isValidAppConfig(config: unknown): config is AppConfig {
	if (typeof config !== 'object' || config === null) return false
	const c = config as AppConfig
	if (c.theme !== undefined && !['light', 'dark', 'system'].includes(c.theme)) return false
	if (c.lastActivePageId !== undefined && typeof c.lastActivePageId !== 'string') return false
	if (c.sidebarWidth !== undefined && typeof c.sidebarWidth !== 'number') return false
	return true
}

/* ---------- Data Persistence ---------- */

ipcMain.handle(IPC_CHANNELS.LOAD_PAGES, async (): Promise<NotePage[] | null> => {
	try {
		const pages = pagesStore.get('pages')
		log.info('Loaded pages data', { count: pages?.length ?? 0 })
		return pages
	} catch (e) {
		log.error('Failed to load pages', e)
		return null
	}
})

ipcMain.handle(IPC_CHANNELS.SAVE_PAGES, async (_event, pages: unknown): Promise<boolean> => {
	if (!isValidPages(pages)) {
		log.warn('Invalid pages format received', { type: typeof pages })
		return false
	}
	try {
		pagesStore.set('pages', pages)
		log.info('Saved pages data', { count: pages.length })
		return true
	} catch (e) {
		log.error('Failed to save pages', e)
		return false
	}
})

/* ---------- Config Persistence ---------- */

ipcMain.handle(IPC_CHANNELS.LOAD_CONFIG, async (): Promise<AppConfig> => {
	try {
		const config = configStore.get('config')
		log.info('Loaded config')
		return config
	} catch (e) {
		log.error('Failed to load config', e)
		return {}
	}
})

ipcMain.handle(IPC_CHANNELS.SAVE_CONFIG, async (_event, config: unknown): Promise<boolean> => {
	if (!isValidAppConfig(config)) {
		log.warn('Invalid config format received', { type: typeof config })
		return false
	}
	try {
		// Merge with existing config
		const existingConfig = configStore.get('config')
		const newConfig = { ...existingConfig, ...config }
		configStore.set('config', newConfig)
		log.info('Saved config')
		return true
	} catch (e) {
		log.error('Failed to save config', e)
		return false
	}
})

/* ---------- AI Features ---------- */

const API_KEY = process.env.GEMINI_API_KEY
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null

const MOCK_RESPONSES = {
	abstraction:
		'これは抽象化のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
	diversion:
		'これは転用のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
	summary:
		'これは要約のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
}

async function callGemini(prompt: string, type: keyof typeof MOCK_RESPONSES): Promise<string> {
	if (!genAI) {
		await new Promise((resolve) => setTimeout(resolve, 1000))
		return MOCK_RESPONSES[type]
	}
	try {
		const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
		const result = await model.generateContent(prompt)
		const response = await result.response
		return response.text()
	} catch (error) {
		log.error('Gemini API error:', error)
		throw new Error('AI生成に失敗しました。')
	}
}

ipcMain.handle(
	IPC_CHANNELS.GENERATE_ABSTRACTION,
	async (_event, fact: unknown): Promise<string> => {
		if (typeof fact !== 'string') {
			log.warn('Invalid fact format for abstraction')
			throw new Error('Invalid input')
		}
		const prompt = `以下の「事実」から、本質的な気づきや法則を抽出してください。

事実:
${fact}

抽象化（気づき・法則・本質）:`
		return callGemini(prompt, 'abstraction')
	}
)

ipcMain.handle(
	IPC_CHANNELS.GENERATE_DIVERSION,
	async (_event, fact: unknown, abstraction: unknown): Promise<string> => {
		if (typeof fact !== 'string' || typeof abstraction !== 'string') {
			log.warn('Invalid input format for diversion')
			throw new Error('Invalid input')
		}
		const prompt = `以下の「抽象化」から、具体的なアクションや他の分野への応用アイデアを提案してください。

事実:
${fact}

抽象化:
${abstraction}

転用（アクション・適用アイデア）:`
		return callGemini(prompt, 'diversion')
	}
)

ipcMain.handle(IPC_CHANNELS.GENERATE_SUMMARY, async (_event, content: unknown): Promise<string> => {
	if (typeof content !== 'string') {
		log.warn('Invalid content format for summary')
		throw new Error('Invalid input')
	}
	const prompt = `以下のテキストを簡潔に要約してください（1-2文で）:

${content}

要約:`
	return callGemini(prompt, 'summary')
})

/* ---------- App Lifecycle ---------- */

app.whenReady().then(() => {
	log.info('App starting...')
	createWindow()

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow()
	})
})

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit()
})
