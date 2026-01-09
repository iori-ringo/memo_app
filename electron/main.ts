import * as fs from "node:fs";
import * as path from "node:path";
import { app, BrowserWindow, ipcMain, Menu, shell } from "electron";
import { IPC_CHANNELS, type AppConfig } from "./ipc/types";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1280,
		height: 800,
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
			contextIsolation: true,
			nodeIntegration: false,
		},
	});

	const isDev = !app.isPackaged;

	if (isDev) {
		mainWindow.loadURL("http://localhost:3000");
		mainWindow.webContents.openDevTools();
	} else {
		// In production, we load the index.html from the 'out' directory
		// The 'out' directory is copied to the root of the app resource
		// We need to adjust the path based on where electron-builder puts files
		// Usually it's in the same directory as main.js or one level up
		// Since we configured files: ["out/**/*", "electron/dist/**/*"]
		// and main is "electron/dist/main.js"
		// The 'out' folder should be at "../../out/index.html" relative to main.js?
		// Or just path.join(__dirname, '../../out/index.html')
		mainWindow.loadFile(path.join(__dirname, "../../out/index.html"));
	}

	// Open external links in browser
	mainWindow.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("http")) {
			shell.openExternal(url);
			return { action: "deny" };
		}
		return { action: "allow" };
	});

	createMenu();
}

function createMenu() {
	const template: Electron.MenuItemConstructorOptions[] = [
		{
			label: app.name,
			submenu: [
				{ role: "about" },
				{ type: "separator" },
				{ role: "services" },
				{ type: "separator" },
				{ role: "hide" },
				{ role: "hideOthers" },
				{ role: "unhide" },
				{ type: "separator" },
				{ role: "quit" },
			],
		},
		{
			label: "File",
			submenu: [
				{
					label: "New Page",
					accelerator: "CmdOrCtrl+M",
					click: () => mainWindow?.webContents.send(IPC_CHANNELS.NEW_PAGE),
				},
				{ type: "separator" },
				{ role: "close" },
			],
		},
		{
			label: "Edit",
			submenu: [
				{ role: "undo" },
				{ role: "redo" },
				{ type: "separator" },
				{ role: "cut" },
				{ role: "copy" },
				{ role: "paste" },
				{ role: "selectAll" },
			],
		},
		{
			label: "View",
			submenu: [
				{ role: "reload" },
				{ role: "forceReload" },
				{ role: "toggleDevTools" },
				{ type: "separator" },
				{ role: "resetZoom" },
				{ role: "zoomIn" },
				{ role: "zoomOut" },
				{ type: "separator" },
				{ role: "togglefullscreen" },
				{
					label: "Toggle Dark Mode",
					click: () => mainWindow?.webContents.send(IPC_CHANNELS.TOGGLE_DARK),
				},
			],
		},
	];

	const menu = Menu.buildFromTemplate(template);
	Menu.setApplicationMenu(menu);
}

/* ---------- Data Persistence ---------- */
const dataPath = path.join(app.getPath("userData"), "pages.json");

function ensureDataDir() {
	const dir = path.dirname(dataPath);
	if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

ipcMain.handle(IPC_CHANNELS.LOAD_PAGES, async () => {
	ensureDataDir();
	if (!fs.existsSync(dataPath)) return null;
	try {
		const raw = fs.readFileSync(dataPath, "utf-8");
		return JSON.parse(raw);
	} catch (e) {
		console.error("Failed to read pages.json", e);
		return null;
	}
});

ipcMain.handle(IPC_CHANNELS.SAVE_PAGES, async (_event, pages) => {
	ensureDataDir();
	try {
		fs.writeFileSync(dataPath, JSON.stringify(pages, null, 2));
		return true;
	} catch (e) {
		console.error("Failed to write pages.json", e);
		return false;
	}
});

/* ---------- Config Persistence ---------- */
const configPath = path.join(app.getPath("userData"), "config.json");

ipcMain.handle(IPC_CHANNELS.LOAD_CONFIG, async (): Promise<AppConfig> => {
	ensureDataDir();
	if (!fs.existsSync(configPath)) return {};
	try {
		const raw = fs.readFileSync(configPath, "utf-8");
		return JSON.parse(raw);
	} catch (e) {
		console.error("Failed to read config.json", e);
		return {};
	}
});

ipcMain.handle(IPC_CHANNELS.SAVE_CONFIG, async (_event, config: AppConfig) => {
	ensureDataDir();
	try {
		// Merge with existing config to avoid overwriting other settings
		let existingConfig = {};
		if (fs.existsSync(configPath)) {
			try {
				existingConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
			} catch (e) {
				// Ignore error if file is corrupted
			}
		}
		const newConfig = { ...existingConfig, ...config };
		fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));
		return true;
	} catch (e) {
		console.error("Failed to write config.json", e);
		return false;
	}
});

import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";

// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env") });

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

const MOCK_RESPONSES = {
	abstraction:
		"これは抽象化のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。",
	diversion:
		"これは転用のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。",
	summary:
		"これは要約のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。",
};

async function callGemini(prompt: string, type: keyof typeof MOCK_RESPONSES): Promise<string> {
	if (!genAI) {
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return MOCK_RESPONSES[type];
	}
	try {
		const model = genAI.getGenerativeModel({ model: "gemini-pro" });
		const result = await model.generateContent(prompt);
		const response = await result.response;
		return response.text();
	} catch (error) {
		console.error("Gemini API error:", error);
		throw new Error("AI生成に失敗しました。");
	}
}

ipcMain.handle(IPC_CHANNELS.GENERATE_ABSTRACTION, async (_event, fact: string) => {
	const prompt = `以下の「事実」から、本質的な気づきや法則を抽出してください。

事実:
${fact}

抽象化（気づき・法則・本質）:`;
	return callGemini(prompt, "abstraction");
});

ipcMain.handle(IPC_CHANNELS.GENERATE_DIVERSION, async (_event, fact: string, abstraction: string) => {
	const prompt = `以下の「抽象化」から、具体的なアクションや他の分野への応用アイデアを提案してください。

事実:
${fact}

抽象化:
${abstraction}

転用（アクション・適用アイデア）:`;
	return callGemini(prompt, "diversion");
});

ipcMain.handle(IPC_CHANNELS.GENERATE_SUMMARY, async (_event, content: string) => {
	const prompt = `以下のテキストを簡潔に要約してください（1-2文で）:

${content}

要約:`;
	return callGemini(prompt, "summary");
});

app.whenReady().then(() => {
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) createWindow();
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") app.quit();
});
