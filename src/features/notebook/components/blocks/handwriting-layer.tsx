/**
 * HandwritingLayer - 手書き入力レイヤーコンポーネント
 *
 * Canvas 要素を使用した手書きストロークの描画と管理。
 *
 * @modes
 * - ペンモード: 手書きストロークを追加
 * - 消しゴムモード: ストロークのポイントを部分削除
 * - オブジェクト消しゴムモード: ストローク全体をクリックで削除
 *
 * @drawing
 * - PointerEvent を使用（タッチ/マウス/ペン対応）
 * - 筆圧情報も取得可能（e.pressure）
 * - ハイライターモード対応（半透明で描画）
 *
 * @state
 * - strokes: 保存済みのストローク配列
 * - currentStroke: 描画中のストローク
 * - mousePos: 消しゴムプレビュー用のマウス位置
 */
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { Stroke } from '@/types/note'

type HandwritingLayerProps = {
	strokes: Stroke[]
	onUpdate: (strokes: Stroke[]) => void
	isPenMode: boolean
	isEraserMode?: boolean
	isObjectEraserMode?: boolean
	color?: string
	width?: number
	isHighlighter?: boolean
}

export const HandwritingLayer = ({
	strokes,
	onUpdate,
	isPenMode,
	isEraserMode = false,
	isObjectEraserMode = false,
	color = '#000000',
	width = 2,
	isHighlighter = false,
}: HandwritingLayerProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null)
	const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)

	// コンテナに合わせてキャンバスサイズを変更
	useEffect(() => {
		const canvas = canvasRef.current
		if (!canvas) return

		const resizeCanvas = () => {
			const parent = canvas.parentElement
			if (!parent) return

			// キャンバスサイズを親要素に合わせる
			const rect = parent.getBoundingClientRect()
			canvas.width = rect.width
			canvas.height = rect.height

			// サイズ変更後に再描画
			const ctx = canvas.getContext('2d')
			if (!ctx) return

			ctx.clearRect(0, 0, canvas.width, canvas.height)
			ctx.lineCap = 'round'
			ctx.lineJoin = 'round'

			const drawStroke = (stroke: Stroke, highlight: boolean = false) => {
				if (stroke.points.length < 2) return

				ctx.beginPath()
				ctx.strokeStyle = highlight ? '#ff0000' : stroke.color
				ctx.lineWidth = stroke.width
				ctx.globalAlpha = highlight ? 0.5 : stroke.isHighlighter ? 0.3 : 1.0

				if (stroke.isHighlighter) {
					ctx.lineCap = 'butt'
				} else {
					ctx.lineCap = 'round'
				}

				ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
				for (let i = 1; i < stroke.points.length; i++) {
					ctx.lineTo(stroke.points[i].x, stroke.points[i].y)
				}
				ctx.stroke()
				ctx.globalAlpha = 1.0
			}

			// ストロークを描画
			if (isEraserMode && mousePos) {
				const eraserRadius = 10
				// 影響を受けないストロークを通常通り描画
				strokes.forEach((stroke) => {
					const isAffected = stroke.points.some((point) => {
						const dist = Math.sqrt((point.x - mousePos.x) ** 2 + (point.y - mousePos.y) ** 2)
						return dist <= eraserRadius
					})
					if (!isAffected) {
						drawStroke(stroke)
					}
				})
				// 影響を受けるストロークをハイライト表示
				strokes.forEach((stroke) => {
					const isAffected = stroke.points.some((point) => {
						const dist = Math.sqrt((point.x - mousePos.x) ** 2 + (point.y - mousePos.y) ** 2)
						return dist <= eraserRadius
					})
					if (isAffected) {
						drawStroke(stroke, true)
					}
				})

				// 消しゴムカーソルを描画
				ctx.beginPath()
				ctx.arc(mousePos.x, mousePos.y, eraserRadius, 0, Math.PI * 2)
				ctx.strokeStyle = '#999'
				ctx.lineWidth = 2
				ctx.setLineDash([5, 5])
				ctx.stroke()
				ctx.setLineDash([])
			} else {
				strokes.forEach((stroke) => {
					drawStroke(stroke)
				})
			}

			if (currentStroke) {
				drawStroke(currentStroke)
			}
		}

		// 初回リサイズ
		resizeCanvas()

		// サイズ変更を監視
		const resizeObserver = new ResizeObserver(resizeCanvas)
		if (canvas.parentElement) {
			resizeObserver.observe(canvas.parentElement)
		}

		return () => {
			resizeObserver.disconnect()
		}
	}, [strokes, currentStroke, isEraserMode, mousePos])

	const handlePointerDown = (e: React.PointerEvent) => {
		if (!isPenMode && !isEraserMode && !isObjectEraserMode) return
		e.preventDefault() // スクロール/選択を防止
		const rect = canvasRef.current?.getBoundingClientRect()
		if (!rect) return

		const x = e.clientX - rect.left
		const y = e.clientY - rect.top

		if (isObjectEraserMode) {
			// オブジェクト消しゴム: クリックでストローク全体を削除
			const clickedStroke = strokes.find((stroke) =>
				stroke.points.some((point) => Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2) < 15)
			)
			if (clickedStroke) {
				const newStrokes = strokes.filter((s) => s.id !== clickedStroke.id)
				onUpdate(newStrokes)
			}
		} else if (isEraserMode) {
			// 通常消しゴム: 消去開始
			const pressure = e.pressure
			setCurrentStroke({
				id: uuidv4(),
				points: [{ x, y, pressure }],
				color,
				width,
				isHighlighter,
			})
		} else if (isPenMode) {
			// ペンモード: 描画開始
			const pressure = e.pressure
			setCurrentStroke({
				id: uuidv4(),
				points: [{ x, y, pressure }],
				color,
				width,
				isHighlighter,
			})
		}
	}

	const handlePointerMove = (e: React.PointerEvent) => {
		const rect = canvasRef.current?.getBoundingClientRect()
		if (!rect) return

		const x = e.clientX - rect.left
		const y = e.clientY - rect.top

		// 消しゴムプレビュー用のマウス位置を更新
		if (isEraserMode) {
			setMousePos({ x, y })
		}

		if (!isPenMode && !isEraserMode) return
		e.preventDefault()

		const pressure = e.pressure

		if (isEraserMode) {
			// 消しゴムのパスに触れたストロークの一部を消去
			const eraserRadius = 10
			const newStrokes = strokes
				.map((stroke) => {
					const remainingPoints = stroke.points.filter((point) => {
						const dist = Math.sqrt((point.x - x) ** 2 + (point.y - y) ** 2)
						return dist > eraserRadius
					})

					// ポイントが残っていない場合、削除対象としてマーク
					if (remainingPoints.length === 0) {
						return null
					}

					// ポイントが削除された場合、ストロークを更新
					if (remainingPoints.length < stroke.points.length) {
						return { ...stroke, points: remainingPoints }
					}

					return stroke
				})
				.filter(Boolean) as Stroke[]

			if (newStrokes.length !== strokes.length || newStrokes.some((s, i) => s !== strokes[i])) {
				onUpdate(newStrokes)
			}
		} else if (isPenMode && currentStroke) {
			setCurrentStroke((prev) => {
				if (!prev) return null
				return {
					...prev,
					points: [...prev.points, { x, y, pressure }],
				}
			})
		}
	}

	const handlePointerUp = (_e: React.PointerEvent) => {
		if (isEraserMode) {
			// 消しゴムの場合、ストロークを保存する必要はない
			setCurrentStroke(null)
			setMousePos(null)
		} else if (isPenMode && currentStroke) {
			onUpdate([...strokes, currentStroke])
			setCurrentStroke(null)
		}
	}

	const handlePointerLeave = () => {
		setMousePos(null)
	}

	const isInteractiveMode = isPenMode || isEraserMode || isObjectEraserMode
	const cursorClass = isObjectEraserMode
		? 'cursor-pointer'
		: isEraserMode
			? 'cursor-not-allowed'
			: 'cursor-crosshair'

	return (
		<canvas
			ref={canvasRef}
			className={`absolute inset-0 z-1 ${isInteractiveMode ? `${cursorClass} touch-none` : 'pointer-events-none'}`}
			onPointerDown={handlePointerDown}
			onPointerMove={handlePointerMove}
			onPointerUp={handlePointerUp}
			onPointerLeave={handlePointerLeave}
		/>
	)
}
