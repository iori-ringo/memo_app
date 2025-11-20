import React, { useRef, useEffect, useState } from "react";
import { Stroke } from "@/types/note";
import { v4 as uuidv4 } from "uuid";

interface HandwritingLayerProps {
    strokes: Stroke[];
    onUpdate: (strokes: Stroke[]) => void;
    isPenMode: boolean;
    isEraserMode?: boolean;
    isObjectEraserMode?: boolean;
    color?: string;
    width?: number;
    isHighlighter?: boolean;
}

export function HandwritingLayer({
    strokes,
    onUpdate,
    isPenMode,
    isEraserMode = false,
    isObjectEraserMode = false,
    color = "#000000",
    width = 2,
    isHighlighter = false,
}: HandwritingLayerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);

    // Draw all strokes
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Handle resizing
        // For simplicity, we assume the canvas size matches the parent container (100% w/h)
        // We might need a ResizeObserver if the container changes size often, 
        // but for now let's rely on window resize or initial render.
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        const drawStroke = (stroke: Stroke) => {
            if (stroke.points.length < 2) return;

            ctx.beginPath();
            ctx.strokeStyle = stroke.color;
            ctx.lineWidth = stroke.width;
            ctx.globalAlpha = stroke.isHighlighter ? 0.3 : 1.0;

            if (stroke.isHighlighter) {
                ctx.lineCap = "butt"; // Highlighters usually have flat ends
            } else {
                ctx.lineCap = "round";
            }

            ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
            for (let i = 1; i < stroke.points.length; i++) {
                ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0; // Reset alpha
        };

        // Draw saved strokes
        strokes.forEach(drawStroke);

        // Draw current stroke being drawn
        if (currentStroke) {
            drawStroke(currentStroke);
        }
    }, [strokes, currentStroke, canvasRef.current?.offsetWidth, canvasRef.current?.offsetHeight]);

    const handlePointerDown = (e: React.PointerEvent) => {
        if (!isPenMode && !isEraserMode && !isObjectEraserMode) return;
        e.preventDefault(); // Prevent scrolling/selection
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (isObjectEraserMode) {
            // Object eraser: remove entire stroke on click
            const clickedStroke = strokes.find(stroke =>
                stroke.points.some(point =>
                    Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < 15
                )
            );
            if (clickedStroke) {
                const newStrokes = strokes.filter(s => s.id !== clickedStroke.id);
                onUpdate(newStrokes);
            }
        } else if (isEraserMode) {
            // Normal eraser: start erasing
            const pressure = e.pressure;
            setCurrentStroke({
                id: uuidv4(),
                points: [{ x, y, pressure }],
                color,
                width,
                isHighlighter,
            });
        } else if (isPenMode) {
            // Pen mode: start drawing
            const pressure = e.pressure;
            setCurrentStroke({
                id: uuidv4(),
                points: [{ x, y, pressure }],
                color,
                width,
                isHighlighter,
            });
        }
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isPenMode && !isEraserMode) return;
        e.preventDefault();
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const pressure = e.pressure;

        if (isEraserMode) {
            // Erase parts of strokes that touch the eraser path
            const eraserRadius = 10;
            const newStrokes = strokes.map(stroke => {
                const remainingPoints = stroke.points.filter(point => {
                    const dist = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2);
                    return dist > eraserRadius;
                });

                // If no points left, mark for deletion
                if (remainingPoints.length === 0) {
                    return null;
                }

                // If points were removed, update the stroke
                if (remainingPoints.length < stroke.points.length) {
                    return { ...stroke, points: remainingPoints };
                }

                return stroke;
            }).filter(Boolean) as Stroke[];

            if (newStrokes.length !== strokes.length || newStrokes.some((s, i) => s !== strokes[i])) {
                onUpdate(newStrokes);
            }
        } else if (isPenMode && currentStroke) {
            setCurrentStroke((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    points: [...prev.points, { x, y, pressure }],
                };
            });
        }
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        if (isEraserMode) {
            // For eraser, we don't need to save a stroke
            setCurrentStroke(null);
        } else if (isPenMode && currentStroke) {
            onUpdate([...strokes, currentStroke]);
            setCurrentStroke(null);
        }
    };

    const isInteractiveMode = isPenMode || isEraserMode || isObjectEraserMode;
    const cursorClass = isObjectEraserMode ? "cursor-pointer" : isEraserMode ? "cursor-not-allowed" : "cursor-crosshair";

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 z-40 ${isInteractiveMode ? `${cursorClass} touch-none` : "pointer-events-none"}`}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
        />
    );
}
