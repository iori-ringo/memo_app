/**
 * CanvasBackground - キャンバス背景コンポーネント
 *
 * ノートブックの背景線とセクション区切りを描画。
 *
 * @sections
 * - Title（タイトル）: 上部エリア
 * - Fact（ファクト）: 左ページ、事実を記録
 * - Abstraction（抽象化）: 右ページ左側
 * - Diversion（転用）: 右ページ右側
 *
 * @features
 * - ドラッグ可能なセクション境界線
 * - ノートブック風の横罫線パターン
 * - ダークモード対応
 */
'use client'

import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

type CanvasBackgroundProps = {
	className?: string
	children?: ReactNode
	titleHeight?: number
	centerPosition?: number
	diversionPosition?: number
	onBoundaryChange?: (boundary: 'title' | 'center' | 'diversion', value: number) => void
	isPenMode?: boolean
}

// 静的JSXの抽出（rendering-hoist-jsx）- propsに依存しないため再作成不要
const notebookLinesPattern = (
	<div
		className="absolute inset-0 pointer-events-none opacity-10 dark:opacity-5"
		style={{
			backgroundImage: 'linear-gradient(#000 1px, transparent 1px)',
			backgroundSize: '100% 2rem',
			marginTop: '2rem',
		}}
	/>
)

export const CanvasBackground = ({
	className,
	children,
	titleHeight = 10,
	centerPosition = 50,
	diversionPosition = 75,
	onBoundaryChange,
	isPenMode = false,
}: CanvasBackgroundProps) => {
	const [isDragging, setIsDragging] = useState<string | null>(null)

	const handleMouseDown = (boundary: 'title' | 'center' | 'diversion') => (e: ReactMouseEvent) => {
		e.preventDefault()
		setIsDragging(boundary)
	}

	useEffect(() => {
		const handleMouseMove = (e: globalThis.MouseEvent) => {
			if (!isDragging || !onBoundaryChange) return

			const canvas = document.querySelector('.canvas-background-container') as HTMLElement
			if (!canvas) return

			const rect = canvas.getBoundingClientRect()

			if (isDragging === 'title') {
				const newHeight = ((e.clientY - rect.top) / rect.height) * 100
				const clampedHeight = Math.max(5, Math.min(30, newHeight)) // 5-30%
				onBoundaryChange('title', clampedHeight)
			} else if (isDragging === 'center') {
				const newPosition = ((e.clientX - rect.left) / rect.width) * 100
				const clampedPosition = Math.max(30, Math.min(70, newPosition)) // 30-70%
				onBoundaryChange('center', clampedPosition)
			} else if (isDragging === 'diversion') {
				const newPosition = ((e.clientX - rect.left) / rect.width) * 100
				const clampedPosition = Math.max(55, Math.min(95, newPosition)) // 55-95%
				onBoundaryChange('diversion', clampedPosition)
			}
		}

		const handleMouseUp = () => {
			setIsDragging(null)
		}

		if (isDragging) {
			document.addEventListener('mousemove', handleMouseMove)
			document.addEventListener('mouseup', handleMouseUp)
		}

		return () => {
			document.removeEventListener('mousemove', handleMouseMove)
			document.removeEventListener('mouseup', handleMouseUp)
		}
	}, [isDragging, onBoundaryChange])

	const boundaryClassName = `absolute bg-stone-500 dark:bg-stone-400 hover:bg-primary dark:hover:bg-primary z-15 ${isPenMode ? 'pointer-events-none' : 'pointer-events-auto cursor-col-resize'}`
	const horizontalBoundaryClassName = `absolute bg-stone-400 dark:bg-stone-600 hover:bg-primary dark:hover:bg-primary z-15 ${isPenMode ? 'pointer-events-none' : 'pointer-events-auto cursor-row-resize'}`

	return (
		<div
			className={cn(
				'relative w-full h-full bg-[#fdfbf7] dark:bg-[#1c1c1c] overflow-hidden canvas-background-container pointer-events-none',
				className
			)}
		>
			{/* Notebook Lines Pattern */}
			{notebookLinesPattern}

			{/* Section Boundaries */}
			{/* Center divider - separates left and right pages */}
			{/* biome-ignore lint/a11y/useSemanticElements: カスタムドラッグハンドルのためhrでは代替不可 */}
			<div
				role="separator"
				aria-orientation="vertical"
				aria-valuenow={Math.round(centerPosition)}
				aria-valuemin={30}
				aria-valuemax={70}
				aria-label="左右ページ境界"
				tabIndex={0}
				className={`${boundaryClassName} top-0 bottom-0 w-1`}
				style={{ left: `${centerPosition}%` }}
				onMouseDown={handleMouseDown('center')}
			/>

			{/* Left page horizontal line - Title bottom */}
			{/* biome-ignore lint/a11y/useSemanticElements: カスタムドラッグハンドルのためhrでは代替不可 */}
			<div
				role="separator"
				aria-orientation="horizontal"
				aria-valuenow={Math.round(titleHeight)}
				aria-valuemin={5}
				aria-valuemax={30}
				aria-label="タイトル境界"
				tabIndex={0}
				className={`${horizontalBoundaryClassName} left-0 h-1`}
				style={{
					top: `${titleHeight}%`,
					right: `${100 - centerPosition}%`,
				}}
				onMouseDown={handleMouseDown('title')}
			/>

			{/* Right page vertical line - Abstraction/Diversion separator */}
			{/* biome-ignore lint/a11y/useSemanticElements: カスタムドラッグハンドルのためhrでは代替不可 */}
			<div
				role="separator"
				aria-orientation="vertical"
				aria-valuenow={Math.round(diversionPosition)}
				aria-valuemin={55}
				aria-valuemax={95}
				aria-label="抽象化・転用境界"
				tabIndex={0}
				className={`${boundaryClassName} top-0 bottom-0 w-1`}
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
			<div className="relative z-10 w-full h-full">{children}</div>
		</div>
	)
}
