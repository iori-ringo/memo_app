/**
 * notebook 機能固有の型定義
 *
 * キャンバス上のオブジェクト、手書きストローク、接続線に関する型を定義。
 * グローバル型（NotePage等）との後方互換性のため、note.d.ts から再エクスポートされる。
 */

/** セクション種別 */
export type SectionType = 'title' | 'fact' | 'abstraction' | 'diversion'

/**
 * キャンバス上のテキストブロック
 * 位置、サイズ、スタイル情報を持つ
 */
export type CanvasObject = {
	id: string
	type: 'text'
	section: SectionType
	content: string
	/** X座標（ピクセル単位、コンテナからの相対位置） */
	x: number
	/** Y座標（ピクセル単位、コンテナからの相対位置） */
	y: number
	width: number
	height: number
	style?: {
		color?: string
		fontSize?: number
		bold?: boolean
		italic?: boolean
	}
}

/**
 * 手書きストローク
 * ポイントの配列とスタイル情報を持つ
 */
export type Stroke = {
	id: string
	points: { x: number; y: number; pressure?: number }[]
	color: string
	width: number
	isHighlighter: boolean
}

/**
 * オブジェクト間の接続線
 */
export type Connection = {
	id: string
	fromObjectId: string
	toObjectId: string
	type: 'arrow' | 'line'
	style: 'solid' | 'dashed' | 'hand-drawn'
}
