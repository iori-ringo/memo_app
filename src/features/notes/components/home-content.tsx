'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useEffect, useRef } from 'react'

import { selectActivePage, useNoteStore } from '@/features/notes/stores/note-store'
import { SidebarContainer } from '@/features/sidebar/components/sidebar-container'
import { getToggledTheme } from '@/lib/theme'
import type { NotePage } from '@/types/note'

// framer-motion の動的インポート（bundle-dynamic-imports）
const MotionPageWrapper = dynamic(
	() => import('./motion-page-wrapper').then((mod) => ({ default: mod.MotionPageWrapper })),
	{ ssr: false }
)

// 静的JSXの抽出（rendering-hoist-jsx）
const emptyState = (
	<div className="flex items-center justify-center h-full text-muted-foreground">
		ページを選択または作成してください
	</div>
)

export const HomeContent = () => {
	const { setTheme, resolvedTheme } = useTheme()

	// キャンバス用: アクティブページのみ購読（サイドバーとは独立）
	const activePage = useNoteStore(selectActivePage)
	const isHydrated = useNoteStore((s) => s.isHydrated)
	const hydrate = useNoteStore((s) => s.hydrate)
	const addPage = useNoteStore((s) => s.addPage)
	const updatePage = useNoteStore((s) => s.updatePage)

	// 初回 hydration
	useEffect(() => {
		hydrate()
	}, [hydrate])

	// useLatest パターン: 最新の値を ref に保存（advanced-use-latest）
	const latestRef = useRef({ addPage, setTheme, resolvedTheme })
	useEffect(() => {
		latestRef.current = { addPage, setTheme, resolvedTheme }
	}, [addPage, setTheme, resolvedTheme])

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
					latestRef.current.addPage()
				})
				const cleanupToggleDark = platformEvents.onToggleDark(() => {
					const { resolvedTheme, setTheme } = latestRef.current
					// resolvedThemeがundefinedの場合はdarkをデフォルトに
					setTheme(getToggledTheme(resolvedTheme))
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

	if (!isHydrated) return null

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
			{/* Sidebar - 独立してストアを購読。キャンバス操作で再レンダリングされない */}
			<SidebarContainer />

			{/* Main Content */}
			<main className="flex-1 flex flex-col h-full overflow-hidden relative">
				{/* Mobile Header */}
				<div className="md:hidden flex items-center p-4 border-b bg-background">
					<span className="ml-4 font-semibold">Memo of Magic</span>
				</div>

				{/* Notebook Area */}
				<div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex justify-center">
					<div className="w-full max-w-7xl h-full min-h-[800px]">
						<MotionPageWrapper
							activePage={activePage}
							onUpdate={updatePage as (id: string, updates: Partial<NotePage>) => void}
							emptyState={emptyState}
						/>
					</div>
				</div>
			</main>
		</div>
	)
}
