import { contextBridge, type IpcRendererEvent, ipcRenderer } from 'electron'
import type { AppConfig, NotePage } from './ipc/types'

contextBridge.exposeInMainWorld('electronAPI', {
	loadPages: (): Promise<NotePage[] | null> => ipcRenderer.invoke('load-pages'),
	savePages: (pages: NotePage[]): Promise<boolean> => ipcRenderer.invoke('save-pages', pages),
	loadConfig: (): Promise<AppConfig> => ipcRenderer.invoke('load-config'),
	saveConfig: (config: AppConfig): Promise<boolean> => ipcRenderer.invoke('save-config', config),
	onNewPage: (callback: () => void): (() => void) => {
		const subscription = (_event: IpcRendererEvent) => callback()
		ipcRenderer.on('new-page', subscription)
		return () => ipcRenderer.removeListener('new-page', subscription)
	},
	onToggleDark: (callback: () => void): (() => void) => {
		const subscription = (_event: IpcRendererEvent) => callback()
		ipcRenderer.on('toggle-dark', subscription)
		return () => ipcRenderer.removeListener('toggle-dark', subscription)
	},
	generateAbstraction: (fact: string): Promise<string> =>
		ipcRenderer.invoke('generate-abstraction', fact),
	generateDiversion: (fact: string, abstraction: string): Promise<string> =>
		ipcRenderer.invoke('generate-diversion', fact, abstraction),
	generateSummary: (content: string): Promise<string> =>
		ipcRenderer.invoke('generate-summary', content),
})
