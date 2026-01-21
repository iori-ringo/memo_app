/**
 * SidebarHeader - サイドバーヘッダーコンポーネント
 *
 * ロゴ、検索バー、テーマ切替を含む。
 */
'use client'

import { Book, Search } from 'lucide-react'
import { Input } from '@/shared/shadcn/input'
import { ModeToggle } from '@/shared/ui/mode-toggle'

interface SidebarHeaderProps {
	searchQuery: string
	onSearchChange: (value: string) => void
}

export const SidebarHeader = ({ searchQuery, onSearchChange }: SidebarHeaderProps) => {
	return (
		<div className="p-4 border-b space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 font-semibold text-lg">
					<Book className="h-5 w-5 text-primary" />
					<span>My Notebook</span>
				</div>
				<ModeToggle />
			</div>
			<div className="relative">
				<Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
				<Input
					placeholder="検索..."
					className="pl-8 bg-background"
					value={searchQuery}
					onChange={(e) => onSearchChange(e.target.value)}
				/>
			</div>
		</div>
	)
}
