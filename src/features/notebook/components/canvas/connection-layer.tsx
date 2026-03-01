/**
 * ConnectionLayer - 接続線レイヤーコンポーネント
 *
 * テキストブロック間の接続線（矢印・実線・破線）を描画。
 *
 * @algorithm
 * 線の描画はブロック中心から中心への直線を計算し、
 * 各ブロックの矩形境界との交点を求めて、枠からはみ出さないようにする。
 * getIntersection() でパラメトリック方程式を使用して交点を算出。
 *
 * @layers
 * - Visual Layer (z-0): SVG線の表示
 * - Interaction Layer (z-5): クリック判定用の太い透明線
 *
 * @optimization
 * - getIntersection: モジュールスコープの純粋関数（毎レンダリングの再作成を防止）
 * - objectMap: useMemoでMap化（objects.find() の O(N) → O(1)）
 * - connectionLines: useMemoで交点計算を事前化（visual/interaction 両レイヤーで共有）
 * - React.memo: 親の再レンダリング時に不要な再計算を抑制
 */
'use client'

import { type MouseEvent, memo, useMemo } from 'react'
import type { CanvasObject, Connection } from '@/types/note'

type ConnectionLayerProps = {
	connections: Connection[]
	objects: CanvasObject[]
	selectedConnectionId?: string | null
	onSelect?: (connectionId: string) => void
	onDelete?: (connectionId: string) => void
}

type Point = { x: number; y: number }
type Rect = { x: number; y: number; width: number; height: number }

// 直線と矩形の交点を算出する純粋関数（モジュールスコープで再作成を防止）
const getIntersection = (p1: Point, p2: Point, rect: Rect): Point => {
	const dx = p2.x - p1.x
	const dy = p2.y - p1.y

	// 2点が同一の場合はp1を返す
	if (dx === 0 && dy === 0) return p1

	// 4辺との交点パラメータを計算
	const tValues: number[] = []

	// 左辺
	if (dx !== 0) {
		const t = (rect.x - p1.x) / dx
		if (t >= 0 && t <= 1) {
			const y = p1.y + t * dy
			if (y >= rect.y && y <= rect.y + rect.height) tValues.push(t)
		}
	}

	// 右辺
	if (dx !== 0) {
		const t = (rect.x + rect.width - p1.x) / dx
		if (t >= 0 && t <= 1) {
			const y = p1.y + t * dy
			if (y >= rect.y && y <= rect.y + rect.height) tValues.push(t)
		}
	}

	// 上辺
	if (dy !== 0) {
		const t = (rect.y - p1.y) / dy
		if (t >= 0 && t <= 1) {
			const x = p1.x + t * dx
			if (x >= rect.x && x <= rect.x + rect.width) tValues.push(t)
		}
	}

	// 下辺
	if (dy !== 0) {
		const t = (rect.y + rect.height - p1.y) / dy
		if (t >= 0 && t <= 1) {
			const x = p1.x + t * dx
			if (x >= rect.x && x <= rect.x + rect.width) tValues.push(t)
		}
	}

	// p1が矩形内部にある場合、最小のtが出口方向の交点
	if (tValues.length === 0) return p1

	const t = Math.min(...tValues)
	return {
		x: p1.x + t * dx,
		y: p1.y + t * dy,
	}
}

export const ConnectionLayer = memo(
	({ connections, objects, selectedConnectionId, onSelect }: ConnectionLayerProps) => {
		const handleClick = (e: MouseEvent, connectionId: string) => {
			e.stopPropagation()
			onSelect?.(connectionId)
		}

		// objects配列をMapに変換（O(1)ルックアップ）
		const objectMap = useMemo(() => new Map(objects.map((o) => [o.id, o])), [objects])

		// 交点計算を事前に行い、visual/interaction両レイヤーで共有
		const connectionLines = useMemo(() => {
			return connections
				.map((conn) => {
					const sourceObj = objectMap.get(conn.fromObjectId)
					const targetObj = objectMap.get(conn.toObjectId)
					if (!sourceObj || !targetObj) return null

					const startCenter: Point = {
						x: sourceObj.x + sourceObj.width / 2,
						y: sourceObj.y + sourceObj.height / 2,
					}
					const endCenter: Point = {
						x: targetObj.x + targetObj.width / 2,
						y: targetObj.y + targetObj.height / 2,
					}

					return {
						conn,
						start: getIntersection(startCenter, endCenter, sourceObj),
						end: getIntersection(endCenter, startCenter, targetObj),
					}
				})
				.filter((line): line is { conn: Connection; start: Point; end: Point } => line !== null)
		}, [connections, objectMap])

		return (
			<>
				{/* Visual layer - behind text blocks */}
				<svg
					className="absolute inset-0 z-0 overflow-visible"
					style={{ pointerEvents: 'none' }}
					aria-hidden="true"
				>
					{connectionLines.map(({ conn, start, end }) => {
						const isSelected = selectedConnectionId === conn.id

						return (
							<g key={conn.id}>
								{/* Visible line */}
								<line
									x1={start.x}
									y1={start.y}
									x2={end.x}
									y2={end.y}
									stroke="currentColor"
									strokeWidth={isSelected ? '4' : '2'}
									className={
										isSelected ? 'text-primary' : 'text-stone-400 dark:text-stone-600 opacity-50'
									}
									strokeDasharray={conn.style === 'dashed' ? '5,5' : undefined}
								/>
							</g>
						)
					})}
				</svg>

				{/* Interaction layer - above visual layer but below text blocks (z-5) */}
				<svg
					className="absolute inset-0 z-5 overflow-visible"
					style={{ pointerEvents: 'none' }}
					aria-hidden="true"
				>
					{connectionLines.map(({ conn, start, end }) => (
						<g key={`click-${conn.id}`}>
							{/* Invisible thick line for easier clicking */}
							{/* biome-ignore lint/a11y/useSemanticElements: SVG line element cannot be replaced with button */}
							<line
								role="button"
								x1={start.x}
								y1={start.y}
								x2={end.x}
								y2={end.y}
								stroke="transparent"
								strokeWidth="20"
								className="cursor-pointer"
								style={{ pointerEvents: 'stroke' }}
								onClick={(e) => handleClick(e, conn.id)}
							/>
						</g>
					))}
				</svg>
			</>
		)
	}
)

ConnectionLayer.displayName = 'ConnectionLayer'
