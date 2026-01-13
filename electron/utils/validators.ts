/**
 * Validation Helpers for IPC Data
 * Type guards for validating data received from renderer process
 */
import type { AppConfig, NotePage } from '@electron/ipc/types'

/**
 * Validates if the given object is a valid NotePage
 * @param page - Unknown object to validate
 * @returns True if the object is a valid NotePage
 */
export function isValidNotePage(page: unknown): page is NotePage {
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

/**
 * Validates if the given array contains valid NotePages
 * @param pages - Unknown array to validate
 * @returns True if all elements are valid NotePages
 */
export function isValidPages(pages: unknown): pages is NotePage[] {
	return Array.isArray(pages) && pages.every(isValidNotePage)
}

/**
 * Validates if the given object is a valid AppConfig
 * @param config - Unknown object to validate
 * @returns True if the object is a valid AppConfig
 */
export function isValidAppConfig(config: unknown): config is AppConfig {
	if (typeof config !== 'object' || config === null) return false
	const c = config as AppConfig
	if (c.theme !== undefined && !['light', 'dark', 'system'].includes(c.theme)) return false
	if (c.lastActivePageId !== undefined && typeof c.lastActivePageId !== 'string') return false
	if (c.sidebarWidth !== undefined && typeof c.sidebarWidth !== 'number') return false
	return true
}
