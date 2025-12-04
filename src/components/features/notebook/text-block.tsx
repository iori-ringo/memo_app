import React, { useState, useRef, useEffect } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { Resizable, ResizeCallbackData } from "react-resizable";
import { CanvasObject } from "@/types/note";
import { RichTextEditor } from "@/components/features/editor/rich-text-editor";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

import "react-resizable/css/styles.css";

interface TextBlockProps {
	object: CanvasObject;
	onUpdate: (id: string, updates: Partial<CanvasObject>) => void;
	onDelete?: (id: string) => void;
	isSelected?: boolean;
	onSelect?: (id: string) => void;
	onEditorReady?: (objectId: string, editor: any) => void;
	isPenMode?: boolean;
}

export function TextBlock({ object, onUpdate, onDelete, isSelected, onSelect, onEditorReady, isPenMode }: TextBlockProps) {
	const [isEditing, setIsEditing] = useState(false);
	const [currentSize, setCurrentSize] = useState({ width: object.width, height: object.height });
	const [currentPos, setCurrentPos] = useState({ x: object.x, y: object.y });
	const nodeRef = useRef<HTMLDivElement>(null);

	// Update local state when object changes
	useEffect(() => {
		setCurrentSize({ width: object.width, height: object.height });
		setCurrentPos({ x: object.x, y: object.y });
	}, [object.width, object.height, object.x, object.y]);

	const handleDrag = (e: DraggableEvent, data: DraggableData) => {
		setCurrentPos({ x: data.x, y: data.y });
	};

	const handleDragStop = (e: DraggableEvent, data: DraggableData) => {
		setCurrentPos({ x: data.x, y: data.y });
		onUpdate(object.id, { x: data.x, y: data.y });
	};

	const handleResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
		const { size, handle } = data;

		// Calculate position change based on handle
		// If resizing from left (w) or top (n), we need to adjust position
		let newX = currentPos.x;
		let newY = currentPos.y;

		if (handle.includes('w')) {
			newX = currentPos.x + (currentSize.width - size.width);
		}
		if (handle.includes('n')) {
			newY = currentPos.y + (currentSize.height - size.height);
		}

		setCurrentSize({ width: size.width, height: size.height });
		setCurrentPos({ x: newX, y: newY });
	};

	const handleResizeStop = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
		const { size, handle } = data;

		// Final calculation using the latest state
		let newX = currentPos.x;
		let newY = currentPos.y;

		// We need to recalculate based on the final size data provided by the event
		// because handleResize might not have fired for the very last pixel
		// Actually, relying on currentPos from handleResize is safer for visual consistency,
		// but we should ensure the logic matches.

		// Let's trust the currentPos updated by handleResize, but we need to be careful
		// if handleResize wasn't called (e.g. just a click).
		// A safer approach for the final commit is to calculate from the original object state + delta?
		// No, react-resizable gives us the absolute size.

		// Let's just commit the current local state to the parent
		onUpdate(object.id, {
			width: size.width,
			height: size.height,
			x: currentPos.x,
			y: currentPos.y
		});
	};

	const handleDelete = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (onDelete) {
			onDelete(object.id);
		}
	};

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
			<div
				ref={nodeRef}
				className={cn(
					"absolute flex flex-col bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-md border shadow-sm transition-shadow group",
					isSelected ? "border-primary ring-1 ring-primary z-20" : "border-transparent hover:border-stone-300 dark:hover:border-stone-700 z-10",
					"hover:shadow-md"
				)}
				style={{
					width: currentSize.width,
					height: currentSize.height,
					pointerEvents: isPenMode ? 'none' : 'auto'
				}}
				onClick={(e) => {
					if (!isPenMode) {
						e.stopPropagation();
						onSelect?.(object.id);
					}
				}}
			>
				{/* Drag Handle - Top */}
				<div className="drag-handle absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-t-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-30">
					<GripVertical className="w-3 h-3 text-muted-foreground" />
				</div>

				{/* Drag Handle - Bottom */}
				<div className="drag-handle absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-b-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-30">
					<GripVertical className="w-3 h-3 text-muted-foreground" />
				</div>

				<Resizable
					width={currentSize.width}
					height={currentSize.height}
					onResize={handleResize}
					onResizeStop={handleResizeStop}
					minConstraints={[50, 30]}
					maxConstraints={[800, 800]}
					resizeHandles={['nw', 'ne', 'sw', 'se']}
					handle={(h, ref) => (
						<div
							ref={ref}
							className={`react-resizable-handle react-resizable-handle-${h} absolute w-3 h-3 bg-primary border border-white rounded-sm opacity-0 group-hover:opacity-100 transition-opacity z-50 cursor-${h}-resize`}
							style={{
								top: h.includes('n') ? '-6px' : undefined,
								bottom: h.includes('s') ? '-6px' : undefined,
								left: h.includes('w') ? '-6px' : undefined,
								right: h.includes('e') ? '-6px' : undefined,
							}}
						/>
					)}
				>
					<div
						style={{
							width: `${currentSize.width}px`,
							height: `${currentSize.height}px`
						}}
						className="overflow-hidden p-2 relative"
					>
						<RichTextEditor
							content={object.content}
							onChange={(content) => onUpdate(object.id, { content })}
							className="h-full w-full focus:outline-none"
							variant="canvas"
							onEditorReady={(editor) => onEditorReady?.(object.id, editor)}
						/>
					</div>
				</Resizable>
			</div>
		</Draggable>
	);
}
