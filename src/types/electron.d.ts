export { };

declare global {
	interface Window {
		electronAPI?: {
			loadPages: () => Promise<any>;
			savePages: (pages: any) => Promise<boolean>;
			loadConfig: () => Promise<any>;
			saveConfig: (config: any) => Promise<boolean>;
			onNewPage: (callback: () => void) => () => void;
			onToggleDark: (callback: () => void) => () => void;
			generateAbstraction: (fact: string) => Promise<string>;
			generateDiversion: (fact: string, abstraction: string) => Promise<string>;
			generateSummary: (content: string) => Promise<string>;
		};
	}
}
