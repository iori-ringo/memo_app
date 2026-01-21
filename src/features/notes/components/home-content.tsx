'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Menu } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import { NotebookCanvas } from '@/features/notebook/components/notebook-canvas'
import { useNotes } from '@/features/notes/hooks/use-notes'
import { useTrash } from '@/features/notes/hooks/use-trash'
import { AppSidebar } from '@/features/sidebar/components/app-sidebar'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/shared/ui/sheet'

export const HomeContent = () => {
	const { setTheme, resolvedTheme } = useTheme()

	const {
		pages,
		setPages,
		activePageId,
		setActivePageId,
		activePage,
		isClient,
		handleAddPage,
		handleUpdatePage,
		handleUpdatePageTitle,
	} = useNotes()

	const { cleanupOldTrash, handleDeletePage, handleRestorePage, handlePermanentDeletePage } =
		useTrash({
			pages,
			setPages,
			activePageId,
			setActivePageId,
		})

	// 起動時にゴミ箱の自動クリーンアップ
	useEffect(() => {
		if (isClient) {
			cleanupOldTrash()
		}
	}, [isClient, cleanupOldTrash])

	// Platform event listeners (Electron menu events, etc.)
	useEffect(() => {
		let isMounted = true
		let cleanupFn: (() => void) | undefined

		// Import dynamically to avoid SSR issues
		const setupListeners = async () => {
			const { platformEvents } = await import('@/lib/platform-events')

			// Prevent registration if unmounted during await
			if (!isMounted) return

			const cleanupNewPage = platformEvents.onNewPage(() => {
				handleAddPage()
			})
			const cleanupToggleDark = platformEvents.onToggleDark(() => {
				setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
			})

			cleanupFn = () => {
				cleanupNewPage()
				cleanupToggleDark()
			}
		}

		setupListeners()

		return () => {
			isMounted = false
			cleanupFn?.()
		}
	}, [handleAddPage, resolvedTheme, setTheme])

	if (!isClient) return null // ハイドレーションミスマッチを防止

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
			{/* Desktop Sidebar */}
			<div className="hidden md:block w-64 shrink-0 h-full">
				<AppSidebar
					pages={pages}
					activePageId={activePageId}
					onSelectPage={setActivePageId}
					onAddPage={handleAddPage}
					onUpdatePageTitle={handleUpdatePageTitle}
					onDeletePage={handleDeletePage}
					onRestorePage={handleRestorePage}
					onPermanentDeletePage={handlePermanentDeletePage}
					className="h-full w-full border-r"
				/>
			</div>

			{/* Mobile Drawer */}
			<div className="md:hidden fixed top-4 left-4 z-50">
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="icon">
							<Menu className="h-4 w-4" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="p-0 w-80">
						<AppSidebar
							pages={pages}
							activePageId={activePageId}
							onSelectPage={(id) => {
								setActivePageId(id)
							}}
							onAddPage={handleAddPage}
							onUpdatePageTitle={handleUpdatePageTitle}
							onDeletePage={handleDeletePage}
							onRestorePage={handleRestorePage}
							onPermanentDeletePage={handlePermanentDeletePage}
						/>
					</SheetContent>
				</Sheet>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col h-full overflow-hidden relative">
				{/* Mobile Header */}
				<div className="md:hidden flex items-center p-4 border-b bg-background">
					<span className="ml-4 font-semibold">Memo of Magic</span>
				</div>

				{/* Notebook Area */}
				<div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex justify-center">
					<div className="w-full max-w-7xl h-full min-h-[800px]">
						<AnimatePresence mode="wait">
							{activePage ? (
								<motion.div
									key={activePage.id}
									initial={{ opacity: 0, rotateY: 90, transformOrigin: 'left' }}
									animate={{ opacity: 1, rotateY: 0 }}
									exit={{ opacity: 0, rotateY: -90, transformOrigin: 'right' }}
									transition={{ duration: 0.4, ease: 'easeInOut' }}
									className="w-full h-full"
									style={{ perspective: '1000px' }}
								>
									<NotebookCanvas page={activePage} onUpdate={handleUpdatePage} />
								</motion.div>
							) : (
								<div className="flex items-center justify-center h-full text-muted-foreground">
									ページを選択または作成してください
								</div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	)
}
