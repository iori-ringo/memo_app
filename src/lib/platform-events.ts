/**
 * Platform Event Adapter
 * Abstracts Electron-specific event listeners for Web compatibility
 *
 * This adapter allows the application to run in both:
 * - Electron: Uses native IPC events
 * - Web Browser: Falls back to no-op (or keyboard shortcuts in future)
 */

type CleanupFn = () => void

/**
 * Platform-agnostic event handlers
 * Automatically detects Electron environment and provides appropriate implementation
 */
export const platformEvents = {
	/**
	 * Subscribe to "New Page" event
	 * Electron: Triggered from menu (Cmd+M)
	 * Web: No-op (could add keyboard shortcut listener in future)
	 */
	onNewPage: (callback: () => void): CleanupFn => {
		if (typeof window !== 'undefined' && window.electronAPI) {
			return window.electronAPI.onNewPage(callback)
		}
		// Web: no-op for now
		return () => {
			/* no-op cleanup */
		}
	},

	/**
	 * Subscribe to "Toggle Dark Mode" event
	 * Electron: Triggered from menu
	 * Web: No-op (theme toggle handled by UI button)
	 */
	onToggleDark: (callback: () => void): CleanupFn => {
		if (typeof window !== 'undefined' && window.electronAPI) {
			return window.electronAPI.onToggleDark(callback)
		}
		// Web: no-op for now
		return () => {
			/* no-op cleanup */
		}
	},
}
