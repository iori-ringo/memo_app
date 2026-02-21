import { useEffect, useState } from 'react'
import { DEFAULT_LAYOUT } from '@/features/notebook/constants'
import type { NotePage } from '@/types/note'

export const useCanvasLayout = (
	page: NotePage,
	onUpdate: (id: string, updates: Partial<NotePage>) => void
) => {
	const [titleHeight, setTitleHeight] = useState(DEFAULT_LAYOUT.TITLE_HEIGHT)
	const [centerPosition, setCenterPosition] = useState(DEFAULT_LAYOUT.CENTER_POSITION)
	const [diversionPosition, setDiversionPosition] = useState(DEFAULT_LAYOUT.DIVERSION_POSITION)

	// Load layout from page data
	// プリミティブ値に分解して不要なeffect再実行を防止（rerender-dependencies）
	const layoutTitleHeight = page.layout?.titleHeight
	const layoutCenterPosition = page.layout?.centerPosition
	const layoutDiversionPosition = page.layout?.diversionPosition

	useEffect(() => {
		setTitleHeight(layoutTitleHeight ?? DEFAULT_LAYOUT.TITLE_HEIGHT)
		setCenterPosition(layoutCenterPosition ?? DEFAULT_LAYOUT.CENTER_POSITION)
		setDiversionPosition(layoutDiversionPosition ?? DEFAULT_LAYOUT.DIVERSION_POSITION)
	}, [layoutTitleHeight, layoutCenterPosition, layoutDiversionPosition])

	const handleBoundaryChange = (boundary: 'title' | 'center' | 'diversion', value: number) => {
		const newLayout = {
			titleHeight: boundary === 'title' ? value : titleHeight,
			centerPosition: boundary === 'center' ? value : centerPosition,
			diversionPosition: boundary === 'diversion' ? value : diversionPosition,
		}

		if (boundary === 'title') {
			setTitleHeight(value)
		} else if (boundary === 'center') {
			setCenterPosition(value)
		} else if (boundary === 'diversion') {
			setDiversionPosition(value)
		}

		// Save to page
		onUpdate(page.id, { layout: newLayout })
	}

	return {
		titleHeight,
		centerPosition,
		diversionPosition,
		handleBoundaryChange,
	}
}
