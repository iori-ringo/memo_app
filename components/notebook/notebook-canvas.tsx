import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { NotePage, CanvasObject, Connection, Stroke } from "@/types/note";
import { CanvasBackground } from "./canvas-background";
import { TextBlock } from "./text-block";
import { ConnectionLayer } from "./connection-layer";
import { HandwritingLayer } from "./handwriting-layer";
import { RibbonToolbar } from "./ribbon-toolbar";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Editor } from "@tiptap/react";

interface NotebookCanvasProps {
    page: NotePage;
    onUpdate: (id: string, updates: Partial<NotePage>) => void;
}

export function NotebookCanvas({ page, onUpdate }: NotebookCanvasProps) {
    const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
    const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
    const [isConnectMode, setIsConnectMode] = useState(false);
    const [isPenMode, setIsPenMode] = useState(false);
    const [isEraserMode, setIsEraserMode] = useState(false);
    const [isObjectEraserMode, setIsObjectEraserMode] = useState(false);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [activeEditor, setActiveEditor] = useState<Editor | null>(null);
    const [titleHeight, setTitleHeight] = useState(10);
    const [centerPosition, setCenterPosition] = useState(50);
    const [diversionPosition, setDiversionPosition] = useState(75);
    const containerRef = useRef<HTMLDivElement>(null);
    const editorInstancesRef = useRef<Map<string, Editor>>(new Map());

    // Key listeners
    React.useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in an input or contenteditable
            if (e.target instanceof HTMLElement && (e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
                return;
            }

            if (e.key.toLowerCase() === "c") {
                setIsConnectMode((prev) => !prev);
                setIsPenMode(false);
                setIsEraserMode(false);
                setIsObjectEraserMode(false);
                setConnectingFrom(null);
            } else if (e.key.toLowerCase() === "p") {
                const newPenMode = !isPenMode;
                setIsPenMode(newPenMode);
                setIsConnectMode(false);
                setIsEraserMode(false);
                setIsObjectEraserMode(false);
                // Clear selections when entering pen mode
                if (newPenMode) {
                    setSelectedObjectId(null);
                    setSelectedConnectionId(null);
                    setActiveEditor(null);
                }
            } else if (e.key.toLowerCase() === "e") {
                if (e.shiftKey) {
                    // Shift+E for object eraser
                    const newMode = !isObjectEraserMode;
                    setIsObjectEraserMode(newMode);
                    setIsEraserMode(false);
                    setIsPenMode(false);
                    setIsConnectMode(false);
                    if (newMode) {
                        setSelectedObjectId(null);
                        setSelectedConnectionId(null);
                        setActiveEditor(null);
                    }
                } else {
                    // E for regular eraser
                    const newMode = !isEraserMode;
                    setIsEraserMode(newMode);
                    setIsObjectEraserMode(false);
                    setIsPenMode(false);
                    setIsConnectMode(false);
                    if (newMode) {
                        setSelectedObjectId(null);
                        setSelectedConnectionId(null);
                        setActiveEditor(null);
                    }
                }
            } else if (
                ((e.key === "Delete" || e.key === "Backspace") ||
                    (e.key.toLowerCase() === "d" && (e.metaKey || e.ctrlKey))) &&
                (selectedObjectId || selectedConnectionId)
            ) {
                e.preventDefault();
                if (selectedObjectId) {
                    handleDeleteObject(selectedObjectId);
                } else if (selectedConnectionId) {
                    handleDeleteConnection(selectedConnectionId);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedObjectId, selectedConnectionId]);

    // Migration Logic
    React.useEffect(() => {
        if ((!page.objects || page.objects.length === 0) && (page.fact || page.abstraction || page.diversion)) {
            const newObjects: CanvasObject[] = [];

            if (page.fact) {
                newObjects.push({
                    id: uuidv4(),
                    type: "text",
                    section: "fact",
                    content: page.fact,
                    x: 50,
                    y: 50,
                    width: 400,
                    height: 300,
                });
            }

            if (page.abstraction) {
                newObjects.push({
                    id: uuidv4(),
                    type: "text",
                    section: "abstraction",
                    content: page.abstraction,
                    x: 600,
                    y: 50,
                    width: 300,
                    height: 300,
                });
            }

            if (page.diversion) {
                newObjects.push({
                    id: uuidv4(),
                    type: "text",
                    section: "diversion",
                    content: page.diversion,
                    x: 950,
                    y: 50,
                    width: 300,
                    height: 300,
                });
            }

            if (newObjects.length > 0) {
                onUpdate(page.id, { objects: newObjects });
            }
        }
    }, [page.id, page.objects?.length]); // Only run if objects length changes (specifically 0) or page id changes

    const handleEditorReady = (objectId: string, editor: Editor) => {
        // Store the editor instance
        editorInstancesRef.current.set(objectId, editor);

        // If this object is currently selected, set it as the active editor
        if (selectedObjectId === objectId) {
            setActiveEditor(editor);
        }
    };

    const handleBlockClick = (id: string) => {
        if (isConnectMode) {
            if (connectingFrom === null) {
                setConnectingFrom(id);
            } else if (connectingFrom !== id) {
                // Create connection
                const newConnection: Connection = {
                    id: uuidv4(),
                    fromObjectId: connectingFrom,
                    toObjectId: id,
                    type: "line",
                    style: "hand-drawn",
                };
                onUpdate(page.id, { connections: [...(page.connections || []), newConnection] });
                setConnectingFrom(null);
                setIsConnectMode(false);
            }
        } else if (!isPenMode) {
            setSelectedObjectId(id);
            setSelectedConnectionId(null); // Clear connection selection
            // Find and set the active editor for this block
            // Note: We'll need to get the editor instance when the block is selected
        }
    };

    const handleConnectionClick = (connectionId: string) => {
        if (!isPenMode && !isConnectMode) {
            setSelectedConnectionId(connectionId);
            setSelectedObjectId(null);
            setActiveEditor(null);
        }
    };

    // Update active editor when selection changes
    React.useEffect(() => {
        if (selectedObjectId === null) {
            setActiveEditor(null);
        } else {
            // Get the editor instance for the selected object
            const editor = editorInstancesRef.current.get(selectedObjectId);
            if (editor) {
                setActiveEditor(editor);
            }
        }
    }, [selectedObjectId]);

    const handleAddBlock = (e: React.MouseEvent) => {
        if (isPenMode || isConnectMode) return;
        // Only trigger on double click on the background
        if (e.target !== e.currentTarget) return;

        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const newObject: CanvasObject = {
            id: uuidv4(),
            type: "text",
            section: "fact", // Default
            content: "",
            x,
            y,
            width: 200,
            height: 100,
        };

        const newObjects = [...(page.objects || []), newObject];
        onUpdate(page.id, { objects: newObjects });
        setSelectedObjectId(newObject.id);
    };

    const handleUpdateObject = (objectId: string, updates: Partial<CanvasObject>) => {
        const newObjects = (page.objects || []).map((obj) =>
            obj.id === objectId ? { ...obj, ...updates } : obj
        );
        onUpdate(page.id, { objects: newObjects });
    };

    const handleUpdateStrokes = (newStrokes: Stroke[]) => {
        onUpdate(page.id, { strokes: newStrokes });
    };

    const toggleFavorite = () => {
        onUpdate(page.id, { isFavorite: !page.isFavorite });
    };

    const handleBoundaryChange = (boundary: 'title' | 'center' | 'diversion', value: number) => {
        if (boundary === 'title') {
            setTitleHeight(value);
        } else if (boundary === 'center') {
            setCenterPosition(value);
        } else if (boundary === 'diversion') {
            setDiversionPosition(value);
        }
    };

    const handleDeleteObject = (objectId: string) => {
        // Remove the object
        const newObjects = (page.objects || []).filter(obj => obj.id !== objectId);

        // Remove any connections involving this object
        const newConnections = (page.connections || []).filter(
            conn => conn.fromObjectId !== objectId && conn.toObjectId !== objectId
        );

        onUpdate(page.id, { objects: newObjects, connections: newConnections });

        // Clean up editor instance
        editorInstancesRef.current.delete(objectId);

        // Clear selection
        if (selectedObjectId === objectId) {
            setSelectedObjectId(null);
            setActiveEditor(null);
        }
    };

    const handleDeleteConnection = (connectionId: string) => {
        const newConnections = (page.connections || []).filter(conn => conn.id !== connectionId);
        onUpdate(page.id, { connections: newConnections });
    };

    return (
        <div className="w-full h-full flex flex-col overflow-hidden shadow-2xl rounded-lg border border-stone-200 dark:border-stone-800">
            {/* Ribbon Toolbar */}
            <RibbonToolbar
                editor={activeEditor}
                isConnectMode={isConnectMode}
                isPenMode={isPenMode}
                isEraserMode={isEraserMode}
                isObjectEraserMode={isObjectEraserMode}
                isFavorite={page.isFavorite || false}
                hasSelection={selectedObjectId !== null || selectedConnectionId !== null}
                onToggleConnectMode={() => {
                    setIsConnectMode((prev) => !prev);
                    setIsPenMode(false);
                    setIsEraserMode(false);
                    setIsObjectEraserMode(false);
                }}
                onTogglePenMode={() => {
                    const newPenMode = !isPenMode;
                    setIsPenMode(newPenMode);
                    setIsConnectMode(false);
                    setIsEraserMode(false);
                    setIsObjectEraserMode(false);
                    // Clear selections when entering pen mode
                    if (newPenMode) {
                        setSelectedObjectId(null);
                        setSelectedConnectionId(null);
                        setActiveEditor(null);
                    }
                }}
                onToggleEraserMode={() => {
                    const newMode = !isEraserMode;
                    setIsEraserMode(newMode);
                    setIsObjectEraserMode(false);
                    setIsPenMode(false);
                    setIsConnectMode(false);
                    if (newMode) {
                        setSelectedObjectId(null);
                        setSelectedConnectionId(null);
                        setActiveEditor(null);
                    }
                }}
                onToggleObjectEraserMode={() => {
                    const newMode = !isObjectEraserMode;
                    setIsObjectEraserMode(newMode);
                    setIsEraserMode(false);
                    setIsPenMode(false);
                    setIsConnectMode(false);
                    if (newMode) {
                        setSelectedObjectId(null);
                        setSelectedConnectionId(null);
                        setActiveEditor(null);
                    }
                }}
                onToggleFavorite={toggleFavorite}
                onDelete={() => {
                    if (selectedObjectId) {
                        handleDeleteObject(selectedObjectId);
                    } else if (selectedConnectionId) {
                        handleDeleteConnection(selectedConnectionId);
                    }
                }}
            />

            {/* Mode Indicators */}
            <div className="absolute top-16 right-4 z-50 flex gap-2 items-center pointer-events-none">
                {isConnectMode && (
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        Connect Mode
                    </div>
                )}
                {isPenMode && (
                    <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                        Pen Mode
                    </div>
                )}
            </div>

            <CanvasBackground
                className="flex-1"
                titleHeight={titleHeight}
                centerPosition={centerPosition}
                diversionPosition={diversionPosition}
                onBoundaryChange={handleBoundaryChange}
            >
                <div
                    ref={containerRef}
                    className="w-full h-full relative"
                    onDoubleClick={handleAddBlock}
                    onClick={() => {
                        if (!isPenMode) {
                            setSelectedObjectId(null);
                            setSelectedConnectionId(null);
                        }
                        if (isConnectMode) {
                            setConnectingFrom(null);
                            setIsConnectMode(false);
                        }
                    }}
                >
                    <ConnectionLayer
                        connections={page.connections || []}
                        objects={page.objects || []}
                        selectedConnectionId={selectedConnectionId}
                        onConnectionClick={handleConnectionClick}
                        onDeleteConnection={handleDeleteConnection}
                    />

                    <HandwritingLayer
                        strokes={page.strokes || []}
                        onUpdate={handleUpdateStrokes}
                        isPenMode={isPenMode}
                        isEraserMode={isEraserMode}
                        isObjectEraserMode={isObjectEraserMode}
                        color="#000000" // Could be configurable later
                    />

                    {(page.objects || []).map((obj) => (
                        <TextBlock
                            key={obj.id}
                            object={obj}
                            onUpdate={handleUpdateObject}
                            onDelete={handleDeleteObject}
                            isSelected={selectedObjectId === obj.id || connectingFrom === obj.id}
                            onSelect={() => handleBlockClick(obj.id)}
                            onEditorReady={handleEditorReady}
                            isPenMode={isPenMode}
                        />
                    ))}
                </div>
            </CanvasBackground>
        </div>
    );
}
