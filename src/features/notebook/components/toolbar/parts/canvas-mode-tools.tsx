/**
 * CanvasModeTools - キャンバスモード切り替えツール群
 *
 * 接続モード、ペンモード、オブジェクト消しゴムモードの切り替えを提供。
 */
'use client'

import { Eraser, Link2, Pen } from 'lucide-react'
import { Button } from '@/shared/shadcn/button'

interface CanvasModeToolsProps {
	isConnectMode: boolean
	isPenMode: boolean
	isObjectEraserMode: boolean
	onToggleConnectMode: () => void
	onTogglePenMode: () => void
	onToggleObjectEraserMode: () => void
}

export const CanvasModeTools = ({
	isConnectMode,
	isPenMode,
	isObjectEraserMode,
	onToggleConnectMode,
	onTogglePenMode,
	onToggleObjectEraserMode,
}: CanvasModeToolsProps) => {
	return (
		<div className="flex items-center gap-1">
			<Button
				variant={isConnectMode ? 'default' : 'ghost'}
				size="sm"
				onClick={onToggleConnectMode}
				className="h-8 px-3"
				title="接続モード (C)"
			>
				<Link2 className="h-4 w-4 mr-1" />
				<span className="text-xs">Connect</span>
			</Button>
			<Button
				variant={isPenMode ? 'default' : 'ghost'}
				size="sm"
				onClick={onTogglePenMode}
				className="h-8 px-3"
				title="ペンモード (P)"
			>
				<Pen className="h-4 w-4 mr-1" />
				<span className="text-xs">Pen</span>
			</Button>
			<Button
				variant={isObjectEraserMode ? 'default' : 'ghost'}
				size="sm"
				onClick={onToggleObjectEraserMode}
				className="h-8 px-3"
				title="オブジェクト消しゴム (Shift+E)"
			>
				<Eraser className="h-4 w-4 mr-1" />
				<span className="text-xs">Obj</span>
			</Button>
		</div>
	)
}
