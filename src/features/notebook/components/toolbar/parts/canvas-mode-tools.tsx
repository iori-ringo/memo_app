/**
 * CanvasModeTools - キャンバスモード切り替えツール群
 *
 * 接続モードの切り替えを提供。
 */
'use client'

import { Link2 } from 'lucide-react'
import { Button } from '@/shared/shadcn/button'

type CanvasModeToolsProps = {
	isConnectMode: boolean
	onToggleConnectMode: () => void
}

export const CanvasModeTools = ({ isConnectMode, onToggleConnectMode }: CanvasModeToolsProps) => {
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
		</div>
	)
}
