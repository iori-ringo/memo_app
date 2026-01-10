'use client'

import type { Editor } from '@tiptap/react'
import { GripVertical } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { DraggableData, Position, ResizableDelta, RndResizeCallback } from 'react-rnd'
import { Rnd } from 'react-rnd'
import { RichTextEditor } from '@/features/editor/components/rich-text-editor'
import { cn } from '@/lib/utils'
import type { CanvasObject } from '@/types/note'

interface TextBlockProps {
	object: CanvasObject
	onUpdate: (id: string, updates: Partial<CanvasObject>) => void
	onDelete?: (id: string) => void
	isSelected?: boolean
	onSelect?: (id: string) => void
	onEditorReady?: (objectId: string, editor: Editor) => void
	isPenMode?: boolean
}

// Custom resize handle component
const ResizeHandle = ({ position }: { position: string }) => (
	<div
		className={cn(
			'absolute w-3 h-3 bg-primary border border-white rounded-sm',
			'opacity-0 group-hover:opacity-100 transition-opacity z-50',
			position.includes('n') && '-top-1.5',
			position.includes('s') && '-bottom-1.5',
			position.includes('w') && '-left-1.5',
			position.includes('e') && '-right-1.5'
		)}
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
	const [position, setPosition] = useState({ x: object.x, y: object.y })
	const [size, setSize] = useState({ width: object.width, height: object.height })

	// Sync with external object changes
	useEffect(() => {
		setPosition({ x: object.x, y: object.y })
		setSize({ width: object.width, height: object.height })
	}, [object.x, object.y, object.width, object.height])

	const handleDragStop = useCallback(
		(_e: unknown, data: DraggableData) => {
			const newPos = { x: data.x, y: data.y }
			setPosition(newPos)
			onUpdate(object.id, newPos)
		},
		[object.id, onUpdate]
	)

	const handleResizeStop: RndResizeCallback = useCallback(
		(_e, _direction, ref, _delta: ResizableDelta, newPosition: Position) => {
			const newSize = {
				width: ref.offsetWidth,
				height: ref.offsetHeight,
			}
			setSize(newSize)
			setPosition(newPosition)
			onUpdate(object.id, {
				...newSize,
				x: newPosition.x,
				y: newPosition.y,
			})
		},
		[object.id, onUpdate]
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
		<Rnd
			position={position}
			size={size}
			onDragStop={handleDragStop}
			onResizeStop={handleResizeStop}
			dragHandleClassName="drag-handle"
			bounds="parent"
			disableDragging={isPenMode}
			minWidth={50}
			minHeight={30}
			maxWidth={800}
			maxHeight={800}
			enableResizing={
				isPenMode
					? false
					: {
							topLeft: true,
							topRight: true,
							bottomLeft: true,
							bottomRight: true,
							top: false,
							right: false,
							bottom: false,
							left: false,
						}
			}
			resizeHandleComponent={{
				topLeft: <ResizeHandle position="nw" />,
				topRight: <ResizeHandle position="ne" />,
				bottomLeft: <ResizeHandle position="sw" />,
				bottomRight: <ResizeHandle position="se" />,
			}}
			className={cn(
				'flex flex-col bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-md border shadow-sm transition-shadow group',
				isSelected
					? 'border-primary ring-1 ring-primary z-20'
					: 'border-transparent hover:border-stone-300 dark:hover:border-stone-700 z-10',
				'hover:shadow-md'
			)}
			style={{
				pointerEvents: isPenMode ? 'none' : 'auto',
			}}
		>
			<section
				className="w-full h-full relative"
				onClick={handleClick}
				onKeyDown={handleKeyDown}
				tabIndex={isPenMode ? -1 : 0}
				aria-label="Text block"
			>
				{/* Drag Handle - Top */}
				<div className="drag-handle absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-t-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-30">
					<GripVertical className="w-3 h-3 text-muted-foreground" />
				</div>

				{/* Drag Handle - Bottom */}
				<div className="drag-handle absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-b-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-30">
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
		</Rnd>
	)
}
