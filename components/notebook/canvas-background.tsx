import React from "react";
import { cn } from "@/lib/utils";

interface CanvasBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    titleHeight?: number; // Percentage 0-100
    centerPosition?: number; // Percentage 0-100
    diversionPosition?: number; // Percentage 0-100 (within right page)
    onBoundaryChange?: (boundary: 'title' | 'center' | 'diversion', value: number) => void;
}

export function CanvasBackground({
    className,
    children,
    titleHeight = 10,
    centerPosition = 50,
    diversionPosition = 75,
    onBoundaryChange,
}: CanvasBackgroundProps) {
    const [isDragging, setIsDragging] = React.useState<string | null>(null);

    const handleMouseDown = (boundary: 'title' | 'center' | 'diversion') => (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(boundary);
    };

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isDragging || !onBoundaryChange) return;

            const canvas = document.querySelector('.canvas-background-container') as HTMLElement;
            if (!canvas) return;

            const rect = canvas.getBoundingClientRect();

            if (isDragging === 'title') {
                const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
                const clampedHeight = Math.max(5, Math.min(30, newHeight)); // 5-30%
                onBoundaryChange('title', clampedHeight);
            } else if (isDragging === 'center') {
                const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
                const clampedPosition = Math.max(30, Math.min(70, newPosition)); // 30-70%
                onBoundaryChange('center', clampedPosition);
            } else if (isDragging === 'diversion') {
                const newPosition = ((e.clientX - rect.left) / rect.width) * 100;
                const clampedPosition = Math.max(55, Math.min(95, newPosition)); // 55-95%
                onBoundaryChange('diversion', clampedPosition);
            }
        };

        const handleMouseUp = () => {
            setIsDragging(null);
        };

        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, onBoundaryChange]);

    return (
        <div className={cn("relative w-full h-full bg-[#fdfbf7] dark:bg-[#1c1c1c] overflow-hidden canvas-background-container", className)}>
            {/* Notebook Lines Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5"
                style={{
                    backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
                    backgroundSize: "100% 2rem", // 32px line height
                    marginTop: "2rem"
                }}
            />

            {/* Section Boundaries */}
            {/* Center divider - separates left and right pages */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-stone-500 dark:bg-stone-400 hover:bg-primary dark:hover:bg-primary cursor-col-resize z-20"
                style={{ left: `${centerPosition}%` }}
                onMouseDown={handleMouseDown('center')}
            />

            {/* Left page horizontal line - Title bottom */}
            <div
                className="absolute left-0 h-1 bg-stone-400 dark:bg-stone-600 hover:bg-primary dark:hover:bg-primary cursor-row-resize z-20"
                style={{
                    top: `${titleHeight}%`,
                    right: `${100 - centerPosition}%`
                }}
                onMouseDown={handleMouseDown('title')}
            />

            {/* Right page vertical line - Abstraction/Diversion separator */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-stone-400 dark:bg-stone-600 hover:bg-primary dark:hover:bg-primary cursor-col-resize z-20"
                style={{ left: `${diversionPosition}%` }}
                onMouseDown={handleMouseDown('diversion')}
            />

            {/* Section Labels */}
            <div className="absolute top-2 left-4 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider pointer-events-none z-10">
                Title / タイトル
            </div>
            <div
                className="absolute left-4 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider pointer-events-none z-10"
                style={{ top: `${titleHeight + 2}%` }}
            >
                Fact / ファクト
            </div>
            <div
                className="absolute top-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider pointer-events-none z-10"
                style={{ left: `${centerPosition + 2}%` }}
            >
                Abstraction / 抽象化
            </div>
            <div
                className="absolute top-2 text-xs font-medium text-stone-400 dark:text-stone-500 uppercase tracking-wider pointer-events-none z-10"
                style={{ left: `${diversionPosition + 2}%` }}
            >
                Diversion / 転用
            </div>

            {/* Content Layer */}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
}
