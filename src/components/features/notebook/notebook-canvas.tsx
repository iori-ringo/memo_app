import React, { useState, useRef } from "react";
import { NotePage } from "@/types/note";
import { CanvasBackground } from "./canvas-background";
import { TextBlock } from "./text-block";
import { ConnectionLayer } from "./connection-layer";
import { HandwritingLayer } from "./handwriting-layer";
import { RibbonToolbar } from "./ribbon-toolbar";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCanvasLayout } from "@/hooks/notebook/use-canvas-layout";
import { useCanvasSelection } from "@/hooks/notebook/use-canvas-selection";
import { useCanvasOperations } from "@/hooks/notebook/use-canvas-operations";
import { useCanvasShortcuts } from "@/hooks/notebook/use-canvas-shortcuts";

interface NotebookCanvasProps {
	page: NotePage;
	onUpdate: (id: string, updates: Partial<NotePage>) => void;
}

export function NotebookCanvas({ page, onUpdate }: NotebookCanvasProps) {
	const [isPenMode, setIsPenMode] = useState(false);
	const [isConnectMode, setIsConnectMode] = useState(false);
	const [isObjectEraserMode, setIsObjectEraserMode] = useState(false);
	const [connectSourceId, setConnectSourceId] = useState<string | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const mousePositionRef = useRef<{ x: number; y: number }>({ x: 100, y: 100 });

	const handleMouseMove = (e: React.MouseEvent) => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			mousePositionRef.current = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			};
		}
	};

	const { titleHeight, centerPosition, diversionPosition, handleBoundaryChange } = useCanvasLayout(
		page,
		onUpdate,
	);

	const {
		selectedObjectId,
		selectedConnectionId,
		activeEditor,
		handleBlockClick,
		handleConnectionClick,
		handleBackgroundClick,
		handleEditorReady,
		setSelectedObjectId,
		setSelectedConnectionId,
	} = useCanvasSelection();

	const {
		handleAddBlock,
		handleUpdateObject,
		handleDeleteObject,
		handleDeleteConnection,
		handleUpdateStrokes,
		toggleFavorite,
	} = useCanvasOperations(page, onUpdate, containerRef as React.RefObject<HTMLDivElement>);

	useCanvasShortcuts({
		selectedObjectId,
		selectedConnectionId,
		isPenMode,
		isConnectMode,
		activeEditor,
		handleDeleteObject,
		handleDeleteConnection,
		setIsPenMode,
		setIsConnectMode,
		setIsObjectEraserMode,
		setSelectedObjectId,
		setSelectedConnectionId,
		handleAddBlock,
		handleUpdateObject,
		mousePositionRef,
	});

	const handleDeleteSelection = () => {
		if (selectedObjectId) {
			handleDeleteObject(selectedObjectId);
			setSelectedObjectId(null);
		}
		if (selectedConnectionId) {
			handleDeleteConnection(selectedConnectionId);
			setSelectedConnectionId(null);
		}
	};

	const onBlockClick = (id: string) => {
		if (isConnectMode) {
			if (!connectSourceId) {
				setConnectSourceId(id);
				setSelectedObjectId(id); // Visual feedback
			} else {
				if (connectSourceId !== id) {
					// Check for existing connection
					const existingConnection = page.connections.find(
						(conn) =>
							(conn.fromObjectId === connectSourceId && conn.toObjectId === id) ||
							(conn.fromObjectId === id && conn.toObjectId === connectSourceId),
					);

					if (!existingConnection) {
						// Create connection
						const newConnection = {
							id: crypto.randomUUID(),
							fromObjectId: connectSourceId,
							toObjectId: id,
							type: "arrow" as const,
							style: "solid" as const,
						};
						onUpdate(page.id, {
							connections: [...page.connections, newConnection],
						});
					}

					setConnectSourceId(null);
					setSelectedObjectId(null);
				} else {
					// Clicked same object, cancel selection
					setConnectSourceId(null);
					setSelectedObjectId(null);
				}
			}
		} else {
			handleBlockClick(id);
		}
	};

	return (
		<div className="flex flex-col h-full relative bg-stone-50 dark:bg-stone-900 overflow-hidden">
			{/* Toolbar */}
			<div className="z-20 bg-white dark:bg-stone-800 border-b shadow-sm">
				<div className="flex items-center justify-between px-4 py-2">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleFavorite}
							className={page.isFavorite ? "text-yellow-500" : "text-muted-foreground"}
						>
							<Star className={`w-5 h-5 ${page.isFavorite ? "fill-current" : ""}`} />
						</Button>
						<input
							type="text"
							value={page.title}
							onChange={(e) => onUpdate(page.id, { title: e.target.value })}
							className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-1 min-w-[200px]"
							placeholder="無題のページ"
						/>
					</div>
					<div className="flex items-center gap-2">
						<RibbonToolbar
							editor={activeEditor}
							isPenMode={isPenMode}
							onTogglePenMode={() => {
								setIsPenMode(!isPenMode);
								if (!isPenMode) {
									setIsConnectMode(false);
									setIsObjectEraserMode(false);
									setConnectSourceId(null);
								}
							}}
							isConnectMode={isConnectMode}
							onToggleConnectMode={() => {
								setIsConnectMode(!isConnectMode);
								if (!isConnectMode) {
									setIsPenMode(false);
									setIsObjectEraserMode(false);
									setSelectedObjectId(null);
									setConnectSourceId(null);
								} else {
									// Turning off connect mode
									setConnectSourceId(null);
								}
							}}
							isObjectEraserMode={isObjectEraserMode}
							onToggleObjectEraserMode={() => {
								setIsObjectEraserMode(!isObjectEraserMode);
								if (!isObjectEraserMode) {
									setIsPenMode(false);
									setIsConnectMode(false);
									setConnectSourceId(null);
								}
							}}
							hasSelection={!!selectedObjectId || !!selectedConnectionId}
							onDelete={handleDeleteSelection}
						/>
					</div>
				</div>
			</div>

			{/* Canvas Area */}
			<div
				ref={containerRef}
				className={`flex-1 relative overflow-hidden ${isPenMode ? "cursor-crosshair" : "cursor-default"
					}`}
				onDoubleClick={handleAddBlock}
				onClick={handleBackgroundClick}
				onMouseMove={handleMouseMove}
			>
				{/* Background Layer (Lines & Sections) */}
				<CanvasBackground
					titleHeight={titleHeight}
					centerPosition={centerPosition}
					diversionPosition={diversionPosition}
					onBoundaryChange={handleBoundaryChange}
					isPenMode={isPenMode}
				/>

				{/* Content Layer (Text Blocks) */}
				<div className="absolute inset-0 z-10 pointer-events-none">
					{page.objects.map((obj) => (
						<TextBlock
							key={obj.id}
							object={obj}
							onUpdate={handleUpdateObject}
							onDelete={handleDeleteObject}
							isSelected={selectedObjectId === obj.id}
							onSelect={onBlockClick}
							onEditorReady={handleEditorReady}
							isPenMode={isPenMode}
						/>
					))}
				</div>

				{/* Connection Layer (Arrows) */}
				<ConnectionLayer
					connections={page.connections}
					objects={page.objects}
					onDelete={handleDeleteConnection}
					isConnectMode={isConnectMode}
					selectedConnectionId={selectedConnectionId}
					onSelect={handleConnectionClick}
				/>

				{/* Handwriting Layer */}
				<HandwritingLayer
					strokes={page.strokes}
					onUpdate={handleUpdateStrokes}
					isPenMode={isPenMode}
					isObjectEraserMode={isObjectEraserMode}
					color="#000000"
					width={3}
					isHighlighter={false}
				/>
			</div>
		</div>
	);
}
