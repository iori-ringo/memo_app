import React from "react";
import { CanvasObject, Connection } from "@/types/note";

interface ConnectionLayerProps {
    connections: Connection[];
    objects: CanvasObject[];
    selectedConnectionId?: string | null;
    onConnectionClick?: (connectionId: string) => void;
    onDeleteConnection?: (connectionId: string) => void;
}

export function ConnectionLayer({
    connections,
    objects,
    selectedConnectionId,
    onConnectionClick,
    onDeleteConnection
}: ConnectionLayerProps) {
    // Helper to find object center
    const getCenter = (id: string) => {
        const obj = objects.find((o) => o.id === id);
        if (!obj) return null;
        return {
            x: obj.x + obj.width / 2,
            y: obj.y + obj.height / 2,
        };
    };

    const handleClick = (e: React.MouseEvent, connectionId: string) => {
        e.stopPropagation();
        if (onConnectionClick) {
            onConnectionClick(connectionId);
        }
    };

    return (
        <>
            {/* Visual layer - behind text blocks */}
            <svg className="absolute inset-0 z-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                {connections.map((conn) => {
                    const start = getCenter(conn.fromObjectId);
                    const end = getCenter(conn.toObjectId);

                    if (!start || !end) return null;

                    const isSelected = selectedConnectionId === conn.id;

                    return (
                        <g key={conn.id}>
                            {/* Visible line */}
                            <line
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                stroke="currentColor"
                                strokeWidth={isSelected ? "4" : "2"}
                                className={isSelected ? "text-primary" : "text-stone-400 dark:text-stone-600 opacity-50"}
                                strokeDasharray={conn.style === "dashed" ? "5,5" : undefined}
                            />
                        </g>
                    );
                })}
            </svg>

            {/* Interaction layer - above text blocks for clicking */}
            <svg className="absolute inset-0 z-30 overflow-visible" style={{ pointerEvents: 'none' }}>
                {connections.map((conn) => {
                    const start = getCenter(conn.fromObjectId);
                    const end = getCenter(conn.toObjectId);

                    if (!start || !end) return null;

                    return (
                        <g key={`click-${conn.id}`}>
                            {/* Invisible thick line for easier clicking */}
                            <line
                                x1={start.x}
                                y1={start.y}
                                x2={end.x}
                                y2={end.y}
                                stroke="transparent"
                                strokeWidth="20"
                                className="cursor-pointer"
                                style={{ pointerEvents: 'auto' }}
                                onClick={(e) => handleClick(e, conn.id)}
                            />
                        </g>
                    );
                })}
            </svg>
        </>
    );
}
