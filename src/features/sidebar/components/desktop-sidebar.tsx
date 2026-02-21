'use client'

import { AppSidebar } from '@/features/sidebar/components/app-sidebar'
import type { NotePage } from '@/types/note'

type DesktopSidebarProps = {
	pages: NotePage[]
	activePageId: string | null
	onSelectPage: (id: string | null) => void
	onAddPage: () => void
	onUpdatePage?: (id: string, updates: Partial<NotePage>) => void
	onDeletePage: (id: string) => void
	onRestorePage: (id: string) => void
	onPermanentDeletePage: (id: string) => void
}

export const DesktopSidebar = ({
	pages,
	activePageId,
	onSelectPage,
	onAddPage,
	onUpdatePage,
	onDeletePage,
	onRestorePage,
	onPermanentDeletePage,
}: DesktopSidebarProps) => {
	return (
		<div className="hidden md:block w-64 shrink-0 h-full">
			<AppSidebar
				pages={pages}
				activePageId={activePageId}
				onSelectPage={onSelectPage}
				onAddPage={onAddPage}
				onUpdatePage={onUpdatePage}
				onDeletePage={onDeletePage}
				onRestorePage={onRestorePage}
				onPermanentDeletePage={onPermanentDeletePage}
				className="h-full w-full border-r"
			/>
		</div>
	)
}
