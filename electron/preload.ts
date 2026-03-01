import { contextBridge, type IpcRendererEvent, ipcRenderer } from 'electron'
import { type AppConfig, IPC_CHANNELS, type NotePage } from './ipc/types'

contextBridge.exposeInMainWorld('electronAPI', {
	loadPages: (): Promise<NotePage[] | null> => ipcRenderer.invoke(IPC_CHANNELS.LOAD_PAGES),
	savePages: (pages: NotePage[]): Promise<boolean> =>
		ipcRenderer.invoke(IPC_CHANNELS.SAVE_PAGES, pages),
	loadConfig: (): Promise<AppConfig> => ipcRenderer.invoke(IPC_CHANNELS.LOAD_CONFIG),
	saveConfig: (config: AppConfig): Promise<boolean> =>
		ipcRenderer.invoke(IPC_CHANNELS.SAVE_CONFIG, config),
	onNewPage: (callback: () => void): (() => void) => {
		const subscription = (_event: IpcRendererEvent) => callback()
		ipcRenderer.on(IPC_CHANNELS.NEW_PAGE, subscription)
		return () => ipcRenderer.removeListener(IPC_CHANNELS.NEW_PAGE, subscription)
	},
	onToggleDark: (callback: () => void): (() => void) => {
		const subscription = (_event: IpcRendererEvent) => callback()
		ipcRenderer.on(IPC_CHANNELS.TOGGLE_DARK, subscription)
		return () => ipcRenderer.removeListener(IPC_CHANNELS.TOGGLE_DARK, subscription)
	},
	generateAbstraction: (fact: string): Promise<string> =>
		ipcRenderer.invoke(IPC_CHANNELS.GENERATE_ABSTRACTION, fact),
	generateDiversion: (fact: string, abstraction: string): Promise<string> =>
		ipcRenderer.invoke(IPC_CHANNELS.GENERATE_DIVERSION, fact, abstraction),
	generateSummary: (content: string): Promise<string> =>
		ipcRenderer.invoke(IPC_CHANNELS.GENERATE_SUMMARY, content),
})
