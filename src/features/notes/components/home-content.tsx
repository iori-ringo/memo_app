'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'
import { NotebookCanvas } from '@/features/notebook/components/canvas/notebook-canvas'
import { useNotes } from '@/features/notes/hooks/use-notes'
import { useTrash } from '@/features/notes/hooks/use-trash'
import { DesktopSidebar } from '@/features/sidebar/components/desktop-sidebar'
import { MobileDrawer } from '@/features/sidebar/components/mobile-drawer'

// 静的JSXの抽出（rendering-hoist-jsx）
const emptyState = (
	<div className="flex items-center justify-center h-full text-muted-foreground">
		ページを選択または作成してください
	</div>
)

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
	} = useNotes()

	const { cleanupOldTrash, handleDeletePage, handleRestorePage, handlePermanentDeletePage } =
		useTrash({
			pages,
			setPages,
			activePageId,
			setActivePageId,
		})

	// useLatest パターン: 最新の値を ref に保存（advanced-use-latest）
	const latestRef = useRef({
		handleAddPage,
		setTheme,
		resolvedTheme,
	})

	// 状態が変わるたびに ref を更新（軽量）
	useEffect(() => {
		latestRef.current = {
			handleAddPage,
			setTheme,
			resolvedTheme,
		}
	}, [handleAddPage, setTheme, resolvedTheme])

	// cleanupOldTrashをrefで保持（初回のみ実行用）
	const cleanupOldTrashRef = useRef(cleanupOldTrash)
	useEffect(() => {
		cleanupOldTrashRef.current = cleanupOldTrash
	}, [cleanupOldTrash])

	// 起動時にゴミ箱の自動クリーンアップ（初回のみ実行）
	useEffect(() => {
		if (isClient) {
			cleanupOldTrashRef.current()
		}
	}, [isClient])

	// Platform event listeners (Electron menu events, etc.)
	// リスナーは初回のみ登録、ref経由で最新値を参照
	useEffect(() => {
		let isMounted = true
		let cleanupFn: (() => void) | undefined

		const setupListeners = async () => {
			try {
				const { platformEvents } = await import('@/lib/platform-events')

				if (!isMounted) return

				const cleanupNewPage = platformEvents.onNewPage(() => {
					latestRef.current.handleAddPage()
				})
				const cleanupToggleDark = platformEvents.onToggleDark(() => {
					const { resolvedTheme, setTheme } = latestRef.current
					// resolvedThemeがundefinedの場合はdarkをデフォルトに
					setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
				})

				cleanupFn = () => {
					cleanupNewPage()
					cleanupToggleDark()
				}
			} catch {
				// Web環境やplatform-eventsが利用できない場合は無視
				console.debug('Platform events not available')
			}
		}

		setupListeners()

		return () => {
			isMounted = false
			cleanupFn?.()
		}
	}, []) // 依存配列を空に: リスナーは初回のみ登録

	if (!isClient) return null

	// サイドバー用の共通プロップス
	const sidebarProps = {
		pages,
		activePageId,
		onSelectPage: setActivePageId,
		onAddPage: handleAddPage,
		onUpdatePage: handleUpdatePage,
		onDeletePage: handleDeletePage,
		onRestorePage: handleRestorePage,
		onPermanentDeletePage: handlePermanentDeletePage,
	}

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
			{/* Desktop Sidebar */}
			<DesktopSidebar {...sidebarProps} />

			{/* Mobile Drawer */}
			<MobileDrawer {...sidebarProps} />

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
								emptyState
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</div>
	)
}
