/**
 * TextBlock - ドラッグ/リサイズ可能なテキストブロックコンポーネント
 *
 * キャンバス上に配置されるテキストブロック。
 * react-draggable と react-resizable を組み合わせて実装。
 *
 * @features
 * - ドラッグ移動（上下のハンドルで操作）
 * - 四隅からのリサイズ（nw, ne, sw, se）
 * - RichTextEditor 内蔵（TipTap 使用）
 * - 選択状態の視覚的フィードバック
 *
 * @interaction
 * - クリック: 選択
 * - ドラッグ: 移動（drag-handle クラスを持つ要素から）
 * - リサイズ: 四隅のハンドルをドラッグ
 * - ペンモード時: 操作無効（pointer-events: none）
 *
 * @config
 * - HANDLE_SIZE_PX: リサイズハンドルのサイズ
 * - HANDLE_OFFSET_PX: ハンドルの位置オフセット
 */
'use client'

import type { Editor } from '@tiptap/react'
import { GripVertical } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import type { DraggableData, DraggableEvent } from 'react-draggable'
import Draggable from 'react-draggable'
import type { ResizeCallbackData } from 'react-resizable'
import { Resizable } from 'react-resizable'
import { RichTextEditor } from '@/features/editor/components/rich-text-editor'
import { cn } from '@/lib/utils'
import type { CanvasObject } from '@/types/note'

import 'react-resizable/css/styles.css'

interface TextBlockProps {
	object: CanvasObject
	onUpdate: (id: string, updates: Partial<CanvasObject>) => void
	onDelete?: (id: string) => void
	isSelected?: boolean
	onSelect?: (id: string) => void
	onEditorReady?: (objectId: string, editor: Editor) => void
	isPenMode?: boolean
}

// -----------------------------------------------------------------------------
// リサイズハンドルの設定
// -----------------------------------------------------------------------------
// ハンドルのサイズ (px)
const HANDLE_SIZE_PX = 13
// ハンドルの位置オフセット (px) - マイナス値で外側に配置
const HANDLE_OFFSET_PX = -13

// リサイズハンドルコンポーネント - 設定に基づいて配置
// JSの状態管理を行わず、CSSのgroup-hoverで表示切り替えを行う
// 重要: react-resizableのドラッグイベントを機能させるため、すべてのpropsをDOM要素に渡す必要があります
const ResizeHandle = ({
	position,
	innerRef,
	isSelected,
	...restProps
}: {
	position: string
	innerRef: React.Ref<HTMLDivElement>
	isSelected: boolean
	[key: string]: unknown
}) => (
	<div
		ref={innerRef}
		className={cn(
			// 厳密な制御のためにインラインスタイルを使用するため、Tailwindのサイズクラス(w-5 h-5)は削除
			'absolute bg-primary border-2 border-white rounded-full shadow-md z-50 transition-opacity',
			// JSによる検知の代わりにgroup-hoverを使用、または選択時は常に表示
			isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
			position === 'nw' && 'cursor-nw-resize',
			position === 'ne' && 'cursor-ne-resize',
			position === 'sw' && 'cursor-sw-resize',
			position === 'se' && 'cursor-se-resize'
		)}
		style={{
			width: `${HANDLE_SIZE_PX}px`,
			height: `${HANDLE_SIZE_PX}px`,
			// オフセットに基づく位置計算
			top: position.includes('n') ? `${HANDLE_OFFSET_PX}px` : undefined,
			bottom: position.includes('s') ? `${HANDLE_OFFSET_PX}px` : undefined,
			left: position.includes('w') ? `${HANDLE_OFFSET_PX}px` : undefined,
			right: position.includes('e') ? `${HANDLE_OFFSET_PX}px` : undefined,
		}}
		{...restProps}
	/>
)

export const TextBlock = ({
	object,
	onUpdate,
	onDelete: _onDelete,
	isSelected,
	onSelect,
	onEditorReady,
	isPenMode,
}: TextBlockProps) => {
	const [currentSize, setCurrentSize] = useState({
		width: object.width,
		height: object.height,
	})
	const [currentPos, setCurrentPos] = useState({ x: object.x, y: object.y })
	const nodeRef = useRef<HTMLDivElement>(null)

	// オブジェクト変更時にローカル状態を更新
	useEffect(() => {
		setCurrentSize({ width: object.width, height: object.height })
		setCurrentPos({ x: object.x, y: object.y })
	}, [object.width, object.height, object.x, object.y])

	const handleDrag = useCallback((_e: DraggableEvent, data: DraggableData) => {
		setCurrentPos({ x: data.x, y: data.y })
	}, [])

	const handleDragStop = useCallback(
		(_e: DraggableEvent, data: DraggableData) => {
			setCurrentPos({ x: data.x, y: data.y })
			onUpdate(object.id, { x: data.x, y: data.y })
		},
		[object.id, onUpdate]
	)

	const handleResize = useCallback(
		(_e: React.SyntheticEvent, data: ResizeCallbackData) => {
			const { size, handle } = data

			// ハンドルに基づいて位置の変更を計算
			// 左(w)または上(n)からリサイズする場合、位置の調整が必要
			let newX = currentPos.x
			let newY = currentPos.y

			if (handle.includes('w')) {
				newX = currentPos.x + (currentSize.width - size.width)
			}
			if (handle.includes('n')) {
				newY = currentPos.y + (currentSize.height - size.height)
			}

			setCurrentSize({ width: size.width, height: size.height })
			setCurrentPos({ x: newX, y: newY })
		},
		[currentPos.x, currentPos.y, currentSize.width, currentSize.height]
	)

	const handleResizeStop = useCallback(
		(_e: React.SyntheticEvent, data: ResizeCallbackData) => {
			const { size } = data

			// 現在のローカル状態を親にコミット
			onUpdate(object.id, {
				width: size.width,
				height: size.height,
				x: currentPos.x,
				y: currentPos.y,
			})
		},
		[object.id, onUpdate, currentPos.x, currentPos.y]
	)

	const handleClick = useCallback(
		(e: React.MouseEvent) => {
			if (!isPenMode) {
				e.stopPropagation()
				onSelect?.(object.id)
			}
		},
		[isPenMode, object.id, onSelect]
	)

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!isPenMode && (e.key === 'Enter' || e.key === ' ')) {
				e.preventDefault()
				e.stopPropagation()
				onSelect?.(object.id)
			}
		},
		[isPenMode, object.id, onSelect]
	)

	return (
		<Draggable
			nodeRef={nodeRef}
			position={{ x: currentPos.x, y: currentPos.y }}
			onDrag={handleDrag}
			onStop={handleDragStop}
			handle=".drag-handle"
			bounds="parent"
			disabled={isPenMode}
			cancel=".react-resizable-handle"
		>
			{/* 
				JavaScriptのonMouseEnter/onMouseLeaveの代わりにCSSのgroup-hoverを使用
				'group'クラスは子要素に対してgroup-hover:ユーティリティを有効にします
				パディング/マージンにより、ホバー領域がボックス外のリサイズハンドルを含むようになります
			*/}
			<div
				ref={nodeRef}
				className="absolute group"
				style={{
					pointerEvents: isPenMode ? 'none' : 'auto',
					// Add padding so hover area includes the resize handles
					padding: '10px',
					margin: '-10px',
				}}
			>
				<Resizable
					width={currentSize.width}
					height={currentSize.height}
					onResize={handleResize}
					onResizeStop={handleResizeStop}
					minConstraints={[50, 30]}
					maxConstraints={[800, 800]}
					resizeHandles={['nw', 'ne', 'sw', 'se']}
					handle={(h, ref) => (
						<ResizeHandle position={h} innerRef={ref} isSelected={Boolean(isSelected)} />
					)}
				>
					<section
						className={cn(
							'flex flex-col bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-md border shadow-sm transition-shadow',
							isSelected
								? 'border-primary ring-1 ring-primary z-20'
								: 'border-transparent hover:border-stone-300 dark:hover:border-stone-700 z-10',
							'hover:shadow-md'
						)}
						style={{
							width: currentSize.width,
							height: currentSize.height,
						}}
						onClick={handleClick}
						onKeyDown={handleKeyDown}
						tabIndex={isPenMode ? -1 : 0}
						aria-label="Text block"
					>
						{/* ドラッグハンドル - 上部 */}
						<div
							className={cn(
								'drag-handle absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-t-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity z-30',
								isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
							)}
						>
							<GripVertical className="w-3 h-3 text-muted-foreground" />
						</div>

						{/* ドラッグハンドル - 下部 */}
						<div
							className={cn(
								'drag-handle absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-b-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity z-30',
								isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
							)}
						>
							<GripVertical className="w-3 h-3 text-muted-foreground" />
						</div>

						{/* コンテンツ */}
						<div className="w-full h-full overflow-hidden p-2">
							<RichTextEditor
								content={object.content}
								onChange={(content) => onUpdate(object.id, { content })}
								className="h-full w-full focus:outline-none"
								variant="canvas"
								onEditorReady={(editor) => onEditorReady?.(object.id, editor)}
							/>
						</div>
					</section>
				</Resizable>
			</div>
		</Draggable>
	)
}
