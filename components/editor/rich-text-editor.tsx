"use client";

import React, { useEffect } from "react";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Bold, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    className?: string;
    editable?: boolean;
    variant?: "default" | "canvas";
    onEditorReady?: (editor: Editor) => void;
}

export function RichTextEditor({
    content,
    onChange,
    className,
    editable = true,
    variant = "default",
    onEditorReady,
}: RichTextEditorProps) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextStyle,
            Color,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
        ],
        content,
        editable,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px]",
            },
        },
        onCreate: ({ editor }) => {
            onEditorReady?.(editor);
        },
    });

    if (!editor) {
        return null;
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {editable && variant === "default" && (
                <div className="flex items-center gap-1 border-b pb-2 mb-2 sticky top-0 bg-background/95 backdrop-blur z-10">
                    <ToolbarButtons editor={editor} />
                </div>
            )}

            {/* BubbleMenu temporarily disabled - Tiptap v3 compatibility issue */}
            {/* {editable && variant === "default" && (
                <BubbleMenu editor={editor} className="flex items-center gap-1 bg-background border rounded-lg shadow-lg p-1">
                    <ToolbarButtons editor={editor} />
                    <div className="w-px h-4 bg-border mx-1" />
                    <ColorPicker editor={editor} />
                </BubbleMenu>
            )} */}

            <EditorContent editor={editor} className="flex-1" />
        </div>
    );
}

function ToolbarButtons({ editor }: { editor: any }) {
    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("bold") && "bg-muted")}
            >
                <Bold className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("italic") && "bg-muted")}
            >
                <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-4 bg-border mx-1" />
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("bulletList") && "bg-muted")}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={cn("h-8 w-8 p-0", editor.isActive("orderedList") && "bg-muted")}
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
        </>
    );
}

function ColorPicker({ editor }: { editor: any }) {
    const colors = ["#000000", "#ef4444", "#3b82f6", "#eab308"]; // Black, Red, Blue, Yellow

    return (
        <div className="flex items-center gap-1">
            {colors.map((color) => (
                <button
                    key={color}
                    onClick={() => editor.chain().focus().setColor(color).run()}
                    className={cn(
                        "w-4 h-4 rounded-full border border-stone-200 dark:border-stone-700",
                        editor.isActive("textStyle", { color }) && "ring-2 ring-offset-1 ring-primary"
                    )}
                    style={{ backgroundColor: color }}
                />
            ))}
        </div>
    );
}
