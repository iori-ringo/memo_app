/**
 * IPCデータのバリデーションヘルパー
 * レンダラープロセスから受け取ったデータを検証する型ガード関数群
 */
import type { AppConfig, NotePage } from '@electron/ipc/types'

/**
 * 与えられたオブジェクトが有効なNotePageかを検証する
 * @param page - 検証対象の不明な値
 * @returns 有効なNotePageの場合true
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
		typeof p.updatedAt === 'number' &&
		Array.isArray(p.objects) &&
		Array.isArray(p.strokes) &&
		Array.isArray(p.connections)
	)
}

/**
 * 与えられた配列の全要素が有効なNotePageかを検証する
 * @param pages - 検証対象の不明な値
 * @returns 全要素が有効なNotePageの場合true
 */
export function isValidPages(pages: unknown): pages is NotePage[] {
	return Array.isArray(pages) && pages.every(isValidNotePage)
}

/**
 * 与えられたオブジェクトが有効なAppConfigかを検証する
 * @param config - 検証対象の不明な値
 * @returns 有効なAppConfigの場合true
 */
export function isValidAppConfig(config: unknown): config is AppConfig {
	if (typeof config !== 'object' || config === null) return false
	const c = config as AppConfig
	if (c.theme !== undefined && !['light', 'dark', 'system'].includes(c.theme)) return false
	if (c.lastActivePageId !== undefined && typeof c.lastActivePageId !== 'string') return false
	if (c.sidebarWidth !== undefined && typeof c.sidebarWidth !== 'number') return false
	return true
}
