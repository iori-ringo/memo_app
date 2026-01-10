"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("node:fs"));
const path = __importStar(require("node:path"));
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
const electron_1 = require("electron");
const electron_log_1 = __importDefault(require("electron-log"));
const electron_store_1 = __importDefault(require("electron-store"));
const types_1 = require("./ipc/types");
// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env.local') });
dotenv.config({ path: path.join(__dirname, '../../.env') });
// Configure electron-log
electron_log_1.default.transports.file.level = 'info';
electron_log_1.default.transports.console.level = 'debug';
const pagesStore = new electron_store_1.default({
    name: 'pages-store', // Changed to avoid collision with old pages.json
    defaults: {
        pages: [],
    },
});
const configStore = new electron_store_1.default({
    name: 'config',
    defaults: {
        config: {},
    },
});
/**
 * Migrate data from old format (pages.json with object format) to new electron-store format
 */
function migrateOldData() {
    const oldPagesPath = path.join(electron_1.app.getPath('userData'), 'pages.json');
    // Check if already migrated
    const alreadyMigrated = configStore.get('config')?.__migrated_v2;
    if (alreadyMigrated) {
        electron_log_1.default.info('Migration already completed, skipping');
        return;
    }
    // Check if we already have data in the new store
    const existingPages = pagesStore.get('pages');
    if (existingPages && existingPages.length > 0) {
        electron_log_1.default.info('New store already has data, marking as migrated');
        configStore.set('config', { ...configStore.get('config'), __migrated_v2: true });
        return;
    }
    // Check if old file exists and has data
    if (!fs.existsSync(oldPagesPath)) {
        electron_log_1.default.info('No old pages.json found, skipping migration');
        configStore.set('config', { ...configStore.get('config'), __migrated_v2: true });
        return;
    }
    try {
        const rawData = fs.readFileSync(oldPagesPath, 'utf-8');
        const oldData = JSON.parse(rawData);
        // Check if it's old format (object with numeric keys starting from "0")
        const keys = Object.keys(oldData);
        const hasNumericKeys = keys.some((key) => !Number.isNaN(Number(key)));
        const hasPages = Array.isArray(oldData.pages);
        if (hasPages) {
            // Already converted to new format (pages array)
            electron_log_1.default.info('Data is already in new array format');
            pagesStore.set('pages', oldData.pages);
            configStore.set('config', { ...configStore.get('config'), __migrated_v2: true });
            return;
        }
        if (!hasNumericKeys) {
            electron_log_1.default.info('No valid data to migrate');
            configStore.set('config', { ...configStore.get('config'), __migrated_v2: true });
            return;
        }
        // Convert old format to array
        const pages = [];
        for (const key of keys) {
            if (!Number.isNaN(Number(key)) && oldData[key]?.id) {
                pages.push(oldData[key]);
            }
        }
        if (pages.length > 0) {
            // Sort by updatedAt desc (most recent first)
            pages.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
            // Save to electron-store
            pagesStore.set('pages', pages);
            electron_log_1.default.info(`Migrated ${pages.length} pages from old format`);
            // Backup old file
            const backupPath = oldPagesPath.replace('.json', '.backup.json');
            if (!fs.existsSync(backupPath)) {
                fs.copyFileSync(oldPagesPath, backupPath);
                electron_log_1.default.info(`Created backup at ${backupPath}`);
            }
        }
        // Mark migration as complete
        configStore.set('config', { ...configStore.get('config'), __migrated_v2: true });
    }
    catch (e) {
        electron_log_1.default.error('Failed to migrate old data', e);
    }
}
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: true,
        },
    });
    const isDev = !electron_1.app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        mainWindow.loadFile(path.join(__dirname, '../../out/index.html'));
    }
    // Open external links in browser
    mainWindow.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith('http')) {
            electron_1.shell.openExternal(url);
            return { action: 'deny' };
        }
        return { action: 'allow' };
    });
    createMenu();
}
function createMenu() {
    const template = [
        {
            label: electron_1.app.name,
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
                    click: () => mainWindow?.webContents.send(types_1.IPC_CHANNELS.NEW_PAGE),
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
                    click: () => mainWindow?.webContents.send(types_1.IPC_CHANNELS.TOGGLE_DARK),
                },
            ],
        },
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
/* ---------- Validation Helpers ---------- */
function isValidNotePage(page) {
    if (typeof page !== 'object' || page === null)
        return false;
    const p = page;
    return (typeof p.id === 'string' &&
        typeof p.title === 'string' &&
        typeof p.notebookId === 'string' &&
        Array.isArray(p.tags) &&
        typeof p.createdAt === 'number' &&
        typeof p.updatedAt === 'number');
}
function isValidPages(pages) {
    return Array.isArray(pages) && pages.every(isValidNotePage);
}
function isValidAppConfig(config) {
    if (typeof config !== 'object' || config === null)
        return false;
    const c = config;
    if (c.theme !== undefined && !['light', 'dark', 'system'].includes(c.theme))
        return false;
    if (c.lastActivePageId !== undefined && typeof c.lastActivePageId !== 'string')
        return false;
    if (c.sidebarWidth !== undefined && typeof c.sidebarWidth !== 'number')
        return false;
    return true;
}
/* ---------- Data Persistence ---------- */
electron_1.ipcMain.handle(types_1.IPC_CHANNELS.LOAD_PAGES, async () => {
    try {
        const pages = pagesStore.get('pages');
        electron_log_1.default.info('Loaded pages data', { count: pages?.length ?? 0 });
        return pages;
    }
    catch (e) {
        electron_log_1.default.error('Failed to load pages', e);
        return null;
    }
});
electron_1.ipcMain.handle(types_1.IPC_CHANNELS.SAVE_PAGES, async (_event, pages) => {
    if (!isValidPages(pages)) {
        electron_log_1.default.warn('Invalid pages format received', { type: typeof pages });
        return false;
    }
    try {
        pagesStore.set('pages', pages);
        electron_log_1.default.info('Saved pages data', { count: pages.length });
        return true;
    }
    catch (e) {
        electron_log_1.default.error('Failed to save pages', e);
        return false;
    }
});
/* ---------- Config Persistence ---------- */
electron_1.ipcMain.handle(types_1.IPC_CHANNELS.LOAD_CONFIG, async () => {
    try {
        const config = configStore.get('config');
        electron_log_1.default.info('Loaded config');
        return config;
    }
    catch (e) {
        electron_log_1.default.error('Failed to load config', e);
        return {};
    }
});
electron_1.ipcMain.handle(types_1.IPC_CHANNELS.SAVE_CONFIG, async (_event, config) => {
    if (!isValidAppConfig(config)) {
        electron_log_1.default.warn('Invalid config format received', { type: typeof config });
        return false;
    }
    try {
        // Merge with existing config
        const existingConfig = configStore.get('config');
        const newConfig = { ...existingConfig, ...config };
        configStore.set('config', newConfig);
        electron_log_1.default.info('Saved config');
        return true;
    }
    catch (e) {
        electron_log_1.default.error('Failed to save config', e);
        return false;
    }
});
/* ---------- AI Features ---------- */
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new generative_ai_1.GoogleGenerativeAI(API_KEY) : null;
const MOCK_RESPONSES = {
    abstraction: 'これは抽象化のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
    diversion: 'これは転用のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
    summary: 'これは要約のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。',
};
async function callGemini(prompt, type) {
    if (!genAI) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return MOCK_RESPONSES[type];
    }
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
    catch (error) {
        electron_log_1.default.error('Gemini API error:', error);
        throw new Error('AI生成に失敗しました。');
    }
}
electron_1.ipcMain.handle(types_1.IPC_CHANNELS.GENERATE_ABSTRACTION, async (_event, fact) => {
    if (typeof fact !== 'string') {
        electron_log_1.default.warn('Invalid fact format for abstraction');
        throw new Error('Invalid input');
    }
    const prompt = `以下の「事実」から、本質的な気づきや法則を抽出してください。

事実:
${fact}

抽象化（気づき・法則・本質）:`;
    return callGemini(prompt, 'abstraction');
});
electron_1.ipcMain.handle(types_1.IPC_CHANNELS.GENERATE_DIVERSION, async (_event, fact, abstraction) => {
    if (typeof fact !== 'string' || typeof abstraction !== 'string') {
        electron_log_1.default.warn('Invalid input format for diversion');
        throw new Error('Invalid input');
    }
    const prompt = `以下の「抽象化」から、具体的なアクションや他の分野への応用アイデアを提案してください。

事実:
${fact}

抽象化:
${abstraction}

転用（アクション・適用アイデア）:`;
    return callGemini(prompt, 'diversion');
});
electron_1.ipcMain.handle(types_1.IPC_CHANNELS.GENERATE_SUMMARY, async (_event, content) => {
    if (typeof content !== 'string') {
        electron_log_1.default.warn('Invalid content format for summary');
        throw new Error('Invalid input');
    }
    const prompt = `以下のテキストを簡潔に要約してください（1-2文で）:

${content}

要約:`;
    return callGemini(prompt, 'summary');
});
/* ---------- App Lifecycle ---------- */
electron_1.app.whenReady().then(() => {
    electron_log_1.default.info('App starting...');
    // Migrate old data format if needed
    migrateOldData();
    createWindow();
    electron_1.app.on('activate', () => {
        if (electron_1.BrowserWindow.getAllWindows().length === 0)
            createWindow();
    });
});
electron_1.app.on('window-all-closed', () => {
    if (process.platform !== 'darwin')
        electron_1.app.quit();
});
