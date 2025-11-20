"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
electron_1.contextBridge.exposeInMainWorld('electronAPI', {
    loadPages: () => electron_1.ipcRenderer.invoke('load-pages'),
    savePages: (pages) => electron_1.ipcRenderer.invoke('save-pages', pages),
    onNewPage: (callback) => {
        const subscription = (_event, ...args) => callback();
        electron_1.ipcRenderer.on('new-page', subscription);
        return () => electron_1.ipcRenderer.removeListener('new-page', subscription);
    },
    onToggleDark: (callback) => {
        const subscription = (_event, ...args) => callback();
        electron_1.ipcRenderer.on('toggle-dark', subscription);
        return () => electron_1.ipcRenderer.removeListener('toggle-dark', subscription);
    },
    generateAbstraction: (fact) => electron_1.ipcRenderer.invoke('generate-abstraction', fact),
    generateDiversion: (fact, abstraction) => electron_1.ipcRenderer.invoke('generate-diversion', fact, abstraction),
    generateSummary: (content) => electron_1.ipcRenderer.invoke('generate-summary', content),
});
