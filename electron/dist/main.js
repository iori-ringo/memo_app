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
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let mainWindow = null;
function createWindow() {
    mainWindow = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    const isDev = !electron_1.app.isPackaged;
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    }
    else {
        // In production, we load the index.html from the 'out' directory
        // The 'out' directory is copied to the root of the app resource
        // We need to adjust the path based on where electron-builder puts files
        // Usually it's in the same directory as main.js or one level up
        // Since we configured files: ["out/**/*", "electron/dist/**/*"]
        // and main is "electron/dist/main.js"
        // The 'out' folder should be at "../../out/index.html" relative to main.js?
        // Or just path.join(__dirname, '../../out/index.html')
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
                    accelerator: 'CmdOrCtrl+N',
                    click: () => mainWindow?.webContents.send('new-page'),
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
                    accelerator: 'CmdOrCtrl+D',
                    click: () => mainWindow?.webContents.send('toggle-dark'),
                },
            ],
        },
    ];
    const menu = electron_1.Menu.buildFromTemplate(template);
    electron_1.Menu.setApplicationMenu(menu);
}
/* ---------- Data Persistence ---------- */
const dataPath = path.join(electron_1.app.getPath('userData'), 'pages.json');
function ensureDataDir() {
    const dir = path.dirname(dataPath);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
}
electron_1.ipcMain.handle('load-pages', async () => {
    ensureDataDir();
    if (!fs.existsSync(dataPath))
        return null;
    try {
        const raw = fs.readFileSync(dataPath, 'utf-8');
        return JSON.parse(raw);
    }
    catch (e) {
        console.error('Failed to read pages.json', e);
        return null;
    }
});
electron_1.ipcMain.handle('save-pages', async (_event, pages) => {
    ensureDataDir();
    try {
        fs.writeFileSync(dataPath, JSON.stringify(pages, null, 2));
        return true;
    }
    catch (e) {
        console.error('Failed to write pages.json', e);
        return false;
    }
});
const generative_ai_1 = require("@google/generative-ai");
const dotenv = __importStar(require("dotenv"));
// Load env vars
dotenv.config({ path: path.join(__dirname, "../../.env.local") });
dotenv.config({ path: path.join(__dirname, "../../.env") });
const API_KEY = process.env.GEMINI_API_KEY;
const genAI = API_KEY ? new generative_ai_1.GoogleGenerativeAI(API_KEY) : null;
const MOCK_RESPONSES = {
    abstraction: "これは抽象化のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。",
    diversion: "これは転用のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。",
    summary: "これは要約のサンプルテキストです。実際のAI機能を使用するには、.env.localファイルにGEMINI_API_KEYを設定してください。",
};
async function callGemini(prompt, type) {
    if (!genAI) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return MOCK_RESPONSES[type];
    }
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }
    catch (error) {
        console.error("Gemini API error:", error);
        throw new Error("AI生成に失敗しました。");
    }
}
electron_1.ipcMain.handle('generate-abstraction', async (_event, fact) => {
    const prompt = `以下の「事実」から、本質的な気づきや法則を抽出してください。

事実:
${fact}

抽象化（気づき・法則・本質）:`;
    return callGemini(prompt, 'abstraction');
});
electron_1.ipcMain.handle('generate-diversion', async (_event, fact, abstraction) => {
    const prompt = `以下の「抽象化」から、具体的なアクションや他の分野への応用アイデアを提案してください。

事実:
${fact}

抽象化:
${abstraction}

転用（アクション・適用アイデア）:`;
    return callGemini(prompt, 'diversion');
});
electron_1.ipcMain.handle('generate-summary', async (_event, content) => {
    const prompt = `以下のテキストを簡潔に要約してください（1-2文で）:

${content}

要約:`;
    return callGemini(prompt, 'summary');
});
electron_1.app.whenReady().then(() => {
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
