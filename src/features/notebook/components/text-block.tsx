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

type TextBlockProps = {
	object: CanvasObject
	onUpdate: (id: string, updates: Partial<CanvasObject>) => void
	onDelete?: (id: string) => void
	isSelected?: boolean
	onSelect?: (id: string) => void
	onEditorReady?: (objectId: string, editor: Editor) => void
	isPenMode?: boolean
}

// -----------------------------------------------------------------------------
// Resize Handle Configuration
// -----------------------------------------------------------------------------
// ハンドルのサイズ (px)
const HANDLE_SIZE_PX = 13
// ハンドルの位置オフセット (px) - マイナス値で外側に配置
const HANDLE_OFFSET_PX = -13

// Resize handle component - positioned based on configuration
// Uses group-hover for visibility (CSS-based, no JavaScript state needed)
// IMPORTANT: Must forward all props to DOM element for react-resizable drag events to work
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
			// Tailwind sizing classes (w-5 h-5) removed in favor of inline styles for precise control
			'absolute bg-primary border-2 border-white rounded-full shadow-md z-50 transition-opacity',
			// Use group-hover for CSS-based hover detection, or show always when selected
			isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
			position === 'nw' && 'cursor-nw-resize',
			position === 'ne' && 'cursor-ne-resize',
			position === 'sw' && 'cursor-sw-resize',
			position === 'se' && 'cursor-se-resize'
		)}
		style={{
			width: `${HANDLE_SIZE_PX}px`,
			height: `${HANDLE_SIZE_PX}px`,
			// Position calculation based on offset
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

	// Update local state when object changes
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

			// Calculate position change based on handle
			// If resizing from left (w) or top (n), we need to adjust position
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

			// Commit the current local state to the parent
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
				Using CSS group-hover instead of JavaScript onMouseEnter/onMouseLeave
				The 'group' class enables group-hover: utilities for child elements
				Padding/margin ensure hover area includes the resize handles outside the box
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
							'flex flex-col bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-md border shadow-sm transition-shadow outline-none',
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
						{/* Drag Handle - Top */}
						<div
							className={cn(
								'drag-handle absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-t-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity z-30',
								isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
							)}
						>
							<GripVertical className="w-3 h-3 text-muted-foreground" />
						</div>

						{/* Drag Handle - Bottom */}
						<div
							className={cn(
								'drag-handle absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-b-md flex items-center justify-center cursor-grab active:cursor-grabbing transition-opacity z-30',
								isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
							)}
						>
							<GripVertical className="w-3 h-3 text-muted-foreground" />
						</div>

						{/* Content */}
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
