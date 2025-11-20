import React from "react";
import { Editor } from "@tiptap/react";
import { Bold, Italic, List, ListOrdered, Link2, Pen, Star, Trash2, Eraser, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface RibbonToolbarProps {
    editor: Editor | null;
    isConnectMode: boolean;
    isPenMode: boolean;
    isEraserMode: boolean;
    isObjectEraserMode: boolean;
    isFavorite: boolean;
    hasSelection: boolean;
    onToggleConnectMode: () => void;
    onTogglePenMode: () => void;
    onToggleEraserMode: () => void;
    onToggleObjectEraserMode: () => void;
    onToggleFavorite: () => void;
    onDelete: () => void;
}

export function RibbonToolbar({
    editor,
    isConnectMode,
    isPenMode,
    isEraserMode,
    isObjectEraserMode,
    isFavorite,
    hasSelection,
    onToggleConnectMode,
    onTogglePenMode,
    onToggleEraserMode,
    onToggleObjectEraserMode,
    onToggleFavorite,
    onDelete,
}: RibbonToolbarProps) {
    const colors = [
        { name: "Black", value: "#000000" },
        { name: "Red", value: "#ef4444" },
        { name: "Blue", value: "#3b82f6" },
        { name: "Yellow", value: "#eab308" },
    ];

    return (
        <div className="w-full bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 px-4 py-2 flex items-center gap-2 shadow-sm">
            {/* Text Formatting */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    disabled={!editor}
                    className={cn("h-8 w-8 p-0", editor?.isActive("bold") && "bg-muted")}
                    title="太字 (Ctrl+B)"
                >
                    <Bold className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    disabled={!editor}
                    className={cn("h-8 w-8 p-0", editor?.isActive("italic") && "bg-muted")}
                    title="斜体 (Ctrl+I)"
                >
                    <Italic className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Colors */}
            <div className="flex items-center gap-1">
                {colors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => editor?.chain().focus().setColor(color.value).run()}
                        disabled={!editor}
                        className={cn(
                            "w-6 h-6 rounded border border-stone-300 dark:border-stone-700 hover:ring-2 hover:ring-primary hover:ring-offset-1",
                            editor?.isActive("textStyle", { color: color.value }) && "ring-2 ring-primary ring-offset-1"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                    />
                ))}
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Lists */}
            <div className="flex items-center gap-1">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    disabled={!editor}
                    className={cn("h-8 w-8 p-0", editor?.isActive("bulletList") && "bg-muted")}
                    title="箇条書き"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    disabled={!editor}
                    className={cn("h-8 w-8 p-0", editor?.isActive("orderedList") && "bg-muted")}
                    title="番号付きリスト"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editor?.chain().focus().toggleTaskList().run()}
                    disabled={!editor}
                    className={cn("h-8 w-8 p-0", editor?.isActive("taskList") && "bg-muted")}
                    title="チェックボックス"
                >
                    <Square className="h-4 w-4" />
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Modes */}
            <div className="flex items-center gap-1">
                <Button
                    variant={isConnectMode ? "default" : "ghost"}
                    size="sm"
                    onClick={onToggleConnectMode}
                    className="h-8 px-3"
                    title="接続モード (C)"
                >
                    <Link2 className="h-4 w-4 mr-1" />
                    {isConnectMode && <span className="text-xs">Connect</span>}
                </Button>
                <Button
                    variant={isPenMode ? "default" : "ghost"}
                    size="sm"
                    onClick={onTogglePenMode}
                    className="h-8 px-3"
                    title="ペンモード (P)"
                >
                    <Pen className="h-4 w-4 mr-1" />
                    {isPenMode && <span className="text-xs">Pen</span>}
                </Button>
                <Button
                    variant={isEraserMode ? "default" : "ghost"}
                    size="sm"
                    onClick={onToggleEraserMode}
                    className="h-8 px-3"
                    title="消しゴム (E)"
                >
                    <Eraser className="h-4 w-4 mr-1" />
                    {isEraserMode && <span className="text-xs">Eraser</span>}
                </Button>
                <Button
                    variant={isObjectEraserMode ? "default" : "ghost"}
                    size="sm"
                    onClick={onToggleObjectEraserMode}
                    className="h-8 px-3"
                    title="オブジェクト消しゴム (Shift+E)"
                >
                    <Eraser className="h-4 w-4 mr-1" />
                    {isObjectEraserMode && <span className="text-xs">Obj</span>}
                </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            {/* Delete */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                disabled={!hasSelection}
                className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                title="削除 (Delete)"
            >
                <Trash2 className="h-4 w-4 mr-1" />
                <span className="text-xs">削除</span>
            </Button>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Favorite */}
            <Button
                variant="ghost"
                size="sm"
                onClick={onToggleFavorite}
                className="h-8 px-3"
                title="お気に入り"
            >
                <Star className={cn("h-4 w-4", isFavorite && "fill-yellow-400 text-yellow-400")} />
            </Button>
        </div>
    );
}
