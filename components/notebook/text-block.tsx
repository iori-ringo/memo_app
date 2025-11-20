import React, { useState, useRef, useEffect } from "react";
import Draggable, { DraggableData, DraggableEvent } from "react-draggable";
import { ResizableBox, ResizeCallbackData } from "react-resizable";
import { CanvasObject } from "@/types/note";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

import "react-resizable/css/styles.css";

interface TextBlockProps {
    object: CanvasObject;
    onUpdate: (id: string, updates: Partial<CanvasObject>) => void;
    onDelete?: (id: string) => void;
    isSelected?: boolean;
    onSelect?: () => void;
    onEditorReady?: (objectId: string, editor: any) => void;
    isPenMode?: boolean;
}

export function TextBlock({ object, onUpdate, onDelete, isSelected, onSelect, onEditorReady, isPenMode }: TextBlockProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [currentSize, setCurrentSize] = useState({ width: object.width, height: object.height });
    const nodeRef = useRef<HTMLDivElement>(null);

    // Update local size when object changes
    useEffect(() => {
        setCurrentSize({ width: object.width, height: object.height });
    }, [object.width, object.height]);

    const handleDrag = (e: DraggableEvent, data: DraggableData) => {
        onUpdate(object.id, { x: data.x, y: data.y });
    };

    const handleResize = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
        // Update local state immediately for smooth resizing
        setCurrentSize({ width: data.size.width, height: data.size.height });
    };

    const handleResizeStop = (e: React.SyntheticEvent, data: ResizeCallbackData) => {
        // Persist to parent state when resizing stops
        onUpdate(object.id, { width: data.size.width, height: data.size.height });
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
            position={{ x: object.x, y: object.y }}
            onStop={handleDrag}
            handle=".drag-handle"
            bounds="parent"
            disabled={isPenMode}
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
                        onSelect?.();
                    }
                }}
            >
                {/* Drag Handle */}
                <div className="drag-handle absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 bg-stone-200 dark:bg-stone-800 rounded-t-md flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-3 h-3 text-muted-foreground" />
                </div>

                <ResizableBox
                    width={currentSize.width}
                    height={currentSize.height}
                    onResize={handleResize}
                    onResizeStop={handleResizeStop}
                    minConstraints={[100, 50]}
                    maxConstraints={[800, 800]}
                    handle={
                        <span className="react-resizable-handle react-resizable-handle-se absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 group-hover:opacity-100" />
                    }
                    axis="both"
                >
                    <div className="w-full h-full overflow-hidden p-2">
                        <RichTextEditor
                            content={object.content}
                            onChange={(content) => onUpdate(object.id, { content })}
                            className="h-full w-full focus:outline-none"
                            variant="canvas"
                            onEditorReady={(editor) => onEditorReady?.(object.id, editor)}
                        />
                    </div>
                </ResizableBox>
            </div>
        </Draggable>
    );
}
