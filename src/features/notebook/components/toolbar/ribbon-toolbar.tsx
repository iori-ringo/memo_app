/**
 * RibbonToolbar - キャンバスツールバーコンポーネント
 *
 * 各ツール群をオーケストレーションするコンテナコンポーネント。
 * 子コンポーネント:
 * - TextFormattingTools: 太字、斜体、取消線、フォントサイズ
 * - TextAlignTools: 左揃え、中央揃え、右揃え
 * - ColorTools: テキスト色選択
 * - ListTools: 箇条書き、番号付き、チェックボックス
 * - CanvasModeTools: 接続/ペン/消しゴムモード
 * - DeleteButton: 削除機能
 */
'use client'

import type { Editor } from '@tiptap/react'
import { CanvasModeTools } from '@/features/notebook/components/toolbar/parts/canvas-mode-tools'
import { ColorTools } from '@/features/notebook/components/toolbar/parts/color-tools'
import { DeleteButton } from '@/features/notebook/components/toolbar/parts/delete-button'
import { ListTools } from '@/features/notebook/components/toolbar/parts/list-tools'
import { TextAlignTools } from '@/features/notebook/components/toolbar/parts/text-align-tools'
import { TextFormattingTools } from '@/features/notebook/components/toolbar/parts/text-formatting-tools'
import { Separator } from '@/shared/shadcn/separator'

type RibbonToolbarProps = {
	editor: Editor | null
	isConnectMode: boolean
	isPenMode: boolean
	isObjectEraserMode: boolean
	hasSelection: boolean
	onToggleConnectMode: () => void
	onTogglePenMode: () => void
	onToggleObjectEraserMode: () => void
	onDelete: () => void
}

export const RibbonToolbar = ({
	editor,
	isConnectMode,
	isPenMode,
	isObjectEraserMode,
	hasSelection,
	onToggleConnectMode,
	onTogglePenMode,
	onToggleObjectEraserMode,
	onDelete,
}: RibbonToolbarProps) => {
	return (
		<div className="w-full bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-2 flex items-center gap-2 shadow-sm">
			{/* テキストフォーマット */}
			<TextFormattingTools editor={editor} />

			<Separator orientation="vertical" className="h-6" />

			{/* 配置 */}
			<TextAlignTools editor={editor} />

			<Separator orientation="vertical" className="h-6" />

			{/* カラー */}
			<ColorTools editor={editor} />

			<Separator orientation="vertical" className="h-6" />

			{/* リスト */}
			<ListTools editor={editor} />

			<Separator orientation="vertical" className="h-6" />

			{/* キャンバスモード */}
			<CanvasModeTools
				isConnectMode={isConnectMode}
				isPenMode={isPenMode}
				isObjectEraserMode={isObjectEraserMode}
				onToggleConnectMode={onToggleConnectMode}
				onTogglePenMode={onTogglePenMode}
				onToggleObjectEraserMode={onToggleObjectEraserMode}
			/>

			<Separator orientation="vertical" className="h-6" />

			{/* 削除 */}
			<DeleteButton hasSelection={hasSelection} onDelete={onDelete} />
		</div>
	)
}
