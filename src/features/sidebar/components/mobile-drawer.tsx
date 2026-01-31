'use client'

import { Menu } from 'lucide-react'
import { AppSidebar } from '@/features/sidebar/components/app-sidebar'
import { Button } from '@/shared/shadcn/button'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/shadcn/sheet'
import type { NotePage } from '@/types/note'

type MobileDrawerProps = {
	pages: NotePage[]
	activePageId: string | null
	onSelectPage: (id: string | null) => void
	onAddPage: () => void
	onUpdatePage?: (id: string, updates: Partial<NotePage>) => void
	onDeletePage: (id: string) => Promise<void>
	onRestorePage: (id: string) => Promise<void>
	onPermanentDeletePage: (id: string) => Promise<void>
}

export const MobileDrawer = ({
	pages,
	activePageId,
	onSelectPage,
	onAddPage,
	onUpdatePage,
	onDeletePage,
	onRestorePage,
	onPermanentDeletePage,
}: MobileDrawerProps) => {
	return (
		<div className="md:hidden fixed top-4 left-4 z-50">
			<Sheet>
				<SheetTrigger asChild>
					<Button variant="outline" size="icon" type="button" aria-label="メニューを開く">
						<Menu className="h-4 w-4" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" className="p-0 w-80">
					<AppSidebar
						pages={pages}
						activePageId={activePageId}
						onSelectPage={onSelectPage}
						onAddPage={onAddPage}
						onUpdatePage={onUpdatePage}
						onDeletePage={onDeletePage}
						onRestorePage={onRestorePage}
						onPermanentDeletePage={onPermanentDeletePage}
					/>
				</SheetContent>
			</Sheet>
		</div>
	)
}
