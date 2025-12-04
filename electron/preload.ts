import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
	loadPages: () => ipcRenderer.invoke("load-pages"),
	savePages: (pages: any) => ipcRenderer.invoke("save-pages", pages),
	loadConfig: () => ipcRenderer.invoke("load-config"),
	saveConfig: (config: any) => ipcRenderer.invoke("save-config", config),
	onNewPage: (callback: () => void) => {
		const subscription = (_event: any, ..._args: any[]) => callback();
		ipcRenderer.on("new-page", subscription);
		return () => ipcRenderer.removeListener("new-page", subscription);
	},
	onToggleDark: (callback: () => void) => {
		const subscription = (_event: any, ..._args: any[]) => callback();
		ipcRenderer.on("toggle-dark", subscription);
		return () => ipcRenderer.removeListener("toggle-dark", subscription);
	},
	generateAbstraction: (fact: string) => ipcRenderer.invoke("generate-abstraction", fact),
	generateDiversion: (fact: string, abstraction: string) =>
		ipcRenderer.invoke("generate-diversion", fact, abstraction),
	generateSummary: (content: string) => ipcRenderer.invoke("generate-summary", content),
});
