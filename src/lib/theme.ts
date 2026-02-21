// テーマトグル用ユーティリティ

/**
 * テーマをトグルする
 * 現在のテーマの反対を返す（undefinedの場合はdarkをデフォルト）
 */
export const getToggledTheme = (currentTheme: string | undefined): string => {
	return currentTheme === 'dark' ? 'light' : 'dark'
}
