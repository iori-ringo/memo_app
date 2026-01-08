'use client'

import type { MouseEvent } from 'react'
import type { CanvasObject, Connection } from '@/types/note'

interface ConnectionLayerProps {
	connections: Connection[]
	objects: CanvasObject[]
	selectedConnectionId?: string | null
	onSelect?: (connectionId: string) => void
	onDelete?: (connectionId: string) => void
	isPenMode?: boolean
}

export const ConnectionLayer = ({
	connections,
	objects,
	selectedConnectionId,
	onSelect,
	onDelete,
	isPenMode = false,
}: ConnectionLayerProps) => {
	const handleClick = (e: MouseEvent, connectionId: string) => {
		e.stopPropagation()
		if (onSelect) {
			onSelect(connectionId)
		}
	}

	// Helper to find intersection point between line and rectangle
	const getIntersection = (
		p1: { x: number; y: number },
		p2: { x: number; y: number },
		rect: { x: number; y: number; width: number; height: number }
	) => {
		const dx = p2.x - p1.x
		const dy = p2.y - p1.y

		// If points are same, return p1
		if (dx === 0 && dy === 0) return p1

		// Calculate intersections with all 4 sides
		// Left: x = rect.x
		// Right: x = rect.x + rect.width
		// Top: y = rect.y
		// Bottom: y = rect.y + rect.height

		const tValues: number[] = []

		// Left edge
		if (dx !== 0) {
			const t = (rect.x - p1.x) / dx
			if (t >= 0 && t <= 1) {
				const y = p1.y + t * dy
				if (y >= rect.y && y <= rect.y + rect.height) tValues.push(t)
			}
		}

		// Right edge
		if (dx !== 0) {
			const t = (rect.x + rect.width - p1.x) / dx
			if (t >= 0 && t <= 1) {
				const y = p1.y + t * dy
				if (y >= rect.y && y <= rect.y + rect.height) tValues.push(t)
			}
		}

		// Top edge
		if (dy !== 0) {
			const t = (rect.y - p1.y) / dy
			if (t >= 0 && t <= 1) {
				const x = p1.x + t * dx
				if (x >= rect.x && x <= rect.x + rect.width) tValues.push(t)
			}
		}

		// Bottom edge
		if (dy !== 0) {
			const t = (rect.y + rect.height - p1.y) / dy
			if (t >= 0 && t <= 1) {
				const x = p1.x + t * dx
				if (x >= rect.x && x <= rect.x + rect.width) tValues.push(t)
			}
		}

		// Find the smallest t > 0 (closest intersection in direction of p2)
		// Actually for "exiting" the source box, we want the intersection.
		// But wait, the line is from Center A to Center B.
		// For Box A, we want the intersection that is in the direction of B.
		// For Box B, we want the intersection that is in the direction of A.

		// Let's simplify: We just want the intersection point closest to p2 (if we are starting from p1 inside rect)
		// Or closest to p1 (if we are starting from p2 inside rect)

		// Since we call this for both start and end:
		// For start point: p1 is center of source, p2 is center of target. We want intersection with source rect.
		// The intersection will be the one with smallest t > epsilon?
		// Actually, since p1 is INSIDE rect, there should be exactly one intersection in the direction of p2.

		if (tValues.length === 0) return p1 // Should not happen if p1 is center

		const t = Math.min(...tValues)
		return {
			x: p1.x + t * dx,
			y: p1.y + t * dy,
		}
	}

	return (
		<>
			{/* Visual layer - behind text blocks */}
			<svg
				className="absolute inset-0 z-0 overflow-visible"
				style={{ pointerEvents: 'none' }}
				aria-hidden="true"
			>
				{connections.map((conn) => {
					const sourceObj = objects.find((o) => o.id === conn.fromObjectId)
					const targetObj = objects.find((o) => o.id === conn.toObjectId)

					if (!sourceObj || !targetObj) return null

					const startCenter = {
						x: sourceObj.x + sourceObj.width / 2,
						y: sourceObj.y + sourceObj.height / 2,
					}
					const endCenter = {
						x: targetObj.x + targetObj.width / 2,
						y: targetObj.y + targetObj.height / 2,
					}

					// Calculate intersection points
					// For source: ray from startCenter to endCenter, intersect with sourceObj
					const start = getIntersection(startCenter, endCenter, sourceObj)
					// For target: ray from endCenter to startCenter, intersect with targetObj
					const end = getIntersection(endCenter, startCenter, targetObj)

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
				{connections.map((conn) => {
					const sourceObj = objects.find((o) => o.id === conn.fromObjectId)
					const targetObj = objects.find((o) => o.id === conn.toObjectId)

					if (!sourceObj || !targetObj) return null

					const startCenter = {
						x: sourceObj.x + sourceObj.width / 2,
						y: sourceObj.y + sourceObj.height / 2,
					}
					const endCenter = {
						x: targetObj.x + targetObj.width / 2,
						y: targetObj.y + targetObj.height / 2,
					}

					// Use same intersection points for interaction line so it matches visual
					const start = getIntersection(startCenter, endCenter, sourceObj)
					const end = getIntersection(endCenter, startCenter, targetObj)

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
								className={isPenMode ? '' : 'cursor-pointer'}
								style={{ pointerEvents: isPenMode ? 'none' : 'stroke' }}
								onClick={(e) => handleClick(e, conn.id)}
							/>
						</g>
					)
				})}
			</svg>
		</>
	)
}
