/**
 * NotebookCanvas - ノートブックのメインキャンバスコンポーネント
 *
 * 「メモの魔力」ノートの中核となるキャンバス。
 *
 * @layers
 * 1. CanvasBackground - 背景線とセクション区切り
 * 2. TextBlock - ドラッグ可能なテキストブロック
 * 3. ConnectionLayer - オブジェクト間の接続線
 * 4. HandwritingLayer - 手書き入力レイヤー
 *
 * @modes
 * - 通常モード: テキストブロックの編集
 * - ペンモード (P): 手書き入力
 * - 接続モード (C): ブロック間接続の作成
 * - 消しゴムモード (Shift+E): オブジェクト削除
 *
 * @dependencies
 * - hooks/use-canvas-layout: レイアウト管理
 * - hooks/use-canvas-operations: CRUD操作
 * - hooks/use-canvas-selection: 選択状態管理
 * - hooks/use-canvas-shortcuts: キーボードショートカット
 */
'use client'

import { Star } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { HandwritingLayer } from '@/features/notebook/components/blocks/handwriting-layer'
import { TextBlock } from '@/features/notebook/components/blocks/text-block'
import { CanvasBackground } from '@/features/notebook/components/canvas/canvas-background'
import { ConnectionLayer } from '@/features/notebook/components/canvas/connection-layer'
import { RibbonToolbar } from '@/features/notebook/components/toolbar/ribbon-toolbar'
import { useCanvasLayout } from '@/features/notebook/hooks/use-canvas-layout'
import { useCanvasOperations } from '@/features/notebook/hooks/use-canvas-operations'
import { useCanvasSelection } from '@/features/notebook/hooks/use-canvas-selection'
import { useCanvasShortcuts } from '@/features/notebook/hooks/use-canvas-shortcuts'
import { Button } from '@/shared/shadcn/button'
import type { NotePage } from '@/types/note'

type NotebookCanvasProps = {
	page: NotePage
	onUpdate: (id: string, updates: Partial<NotePage>) => void
}

export const NotebookCanvas = ({ page, onUpdate }: NotebookCanvasProps) => {
	const [isPenMode, setIsPenMode] = useState(false)
	const [isConnectMode, setIsConnectMode] = useState(false)
	const [isObjectEraserMode, setIsObjectEraserMode] = useState(false)
	const [connectSourceId, setConnectSourceId] = useState<string | null>(null)
	const containerRef = useRef<HTMLDivElement>(null)
	const mousePositionRef = useRef<{ x: number; y: number }>({ x: 100, y: 100 })

	const handleMouseMove = (e: React.MouseEvent) => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect()
			mousePositionRef.current = {
				x: e.clientX - rect.left,
				y: e.clientY - rect.top,
			}
		}
	}

	const { titleHeight, centerPosition, diversionPosition, handleBoundaryChange } = useCanvasLayout(
		page,
		onUpdate
	)

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
	} = useCanvasSelection()

	const {
		handleAddBlock,
		handleUpdateObject,
		handleDeleteObject,
		handleDeleteConnection,
		handleUpdateStrokes,
		toggleFavorite,
	} = useCanvasOperations(page, onUpdate, containerRef as React.RefObject<HTMLDivElement>)

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
		mousePositionRef,
	})

	// モードトグルコールバックの安定化（rerender-functional-setstate）
	// functional setStateで最新の状態を参照し、依存配列を空にして関数の再作成を防止
	const handleTogglePenMode = useCallback(() => {
		setIsPenMode((prev) => {
			if (!prev) {
				// ペンモードON時は他のモードをOFF
				setIsConnectMode(false)
				setIsObjectEraserMode(false)
				setConnectSourceId(null)
			}
			return !prev
		})
	}, [])

	const handleToggleConnectMode = useCallback(() => {
		setIsConnectMode((prev) => {
			if (!prev) {
				// 接続モードON時は他のモードをOFF
				setIsPenMode(false)
				setIsObjectEraserMode(false)
				setSelectedObjectId(null)
				setConnectSourceId(null)
			} else {
				// 接続モードOFF時はソースをリセット
				setConnectSourceId(null)
			}
			return !prev
		})
	}, [setSelectedObjectId])

	const handleToggleObjectEraserMode = useCallback(() => {
		setIsObjectEraserMode((prev) => {
			if (!prev) {
				// 消しゴムモードON時は他のモードをOFF
				setIsPenMode(false)
				setIsConnectMode(false)
				setConnectSourceId(null)
			}
			return !prev
		})
	}, [])

	const handleDeleteSelection = () => {
		if (selectedObjectId) {
			handleDeleteObject(selectedObjectId)
			setSelectedObjectId(null)
		}
		if (selectedConnectionId) {
			handleDeleteConnection(selectedConnectionId)
			setSelectedConnectionId(null)
		}
	}

	const onBlockClick = (id: string) => {
		if (isConnectMode) {
			if (!connectSourceId) {
				setConnectSourceId(id)
				setSelectedObjectId(id) // Visual feedback
			} else {
				if (connectSourceId !== id) {
					// Check for existing connection
					const existingConnection = page.connections.find(
						(conn) =>
							(conn.fromObjectId === connectSourceId && conn.toObjectId === id) ||
							(conn.fromObjectId === id && conn.toObjectId === connectSourceId)
					)

					if (!existingConnection) {
						// Create connection
						const newConnection = {
							id: crypto.randomUUID(),
							fromObjectId: connectSourceId,
							toObjectId: id,
							type: 'arrow' as const,
							style: 'solid' as const,
						}
						onUpdate(page.id, {
							connections: [...page.connections, newConnection],
						})
					}

					setConnectSourceId(null)
					setSelectedObjectId(null)
				} else {
					// Clicked same object, cancel selection
					setConnectSourceId(null)
					setSelectedObjectId(null)
				}
			}
		} else {
			handleBlockClick(id)
		}
	}

	return (
		<div className="flex flex-col h-full relative bg-stone-50 dark:bg-stone-900 overflow-hidden">
			{/* Toolbar */}
			<div className="z-20 bg-white dark:bg-stone-800 border-b shadow-sm">
				<div className="flex items-center justify-between pl-4 pr-1 py-2">
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={toggleFavorite}
							className={page.isFavorite ? 'text-yellow-500' : 'text-muted-foreground'}
						>
							<Star className={`w-5 h-5 ${page.isFavorite ? 'fill-current' : ''}`} />
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
							onTogglePenMode={handleTogglePenMode}
							isConnectMode={isConnectMode}
							onToggleConnectMode={handleToggleConnectMode}
							isObjectEraserMode={isObjectEraserMode}
							onToggleObjectEraserMode={handleToggleObjectEraserMode}
							hasSelection={!!selectedObjectId || !!selectedConnectionId}
							onDelete={handleDeleteSelection}
						/>
					</div>
				</div>
			</div>

			{/* Canvas Area */}
			<div
				ref={containerRef}
				role="application"
				aria-label="ノートキャンバス"
				className={`flex-1 relative overflow-hidden ${
					isPenMode ? 'cursor-crosshair' : 'cursor-default'
				}`}
				onDoubleClick={handleAddBlock}
				onClick={handleBackgroundClick}
				onKeyDown={(e) => {
					// キーボードショートカットは useCanvasShortcuts で処理
					// Enter/Spaceでダブルクリック相当の操作（新規ブロック追加）
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault()
						handleAddBlock(e as unknown as React.MouseEvent)
					}
				}}
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
	)
}
