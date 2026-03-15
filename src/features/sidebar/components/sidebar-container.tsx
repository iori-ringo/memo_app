/**
 * SidebarContainer - サイドバーの独立コンテナ
 *
 * ストアに直接サブスクライブし、HomeContent を経由しない。
 * キャンバス操作（ドラッグ/リサイズ等）によるサイドバーの不要な再レンダリングを防止する。
 */
'use client'

import { useCallback } from 'react'

import { useSidebarNotes } from '@/features/notes/hooks/use-sidebar-notes'
import { DesktopSidebar } from '@/features/sidebar/components/desktop-sidebar'
import { MobileDrawer } from '@/features/sidebar/components/mobile-drawer'
import { useMediaQuery } from '@/hooks/use-media-query'

export const SidebarContainer = () => {
	const isDesktop = useMediaQuery('(min-width: 768px)')

	const {
		pagesMeta,
		activePageId,
		addPage,
		updatePage,
		setActivePageId,
		softDeletePage,
		restorePage,
		permanentDeletePage,
	} = useSidebarNotes()

	// confirm() を UI 側で処理する暫定ラッパー（TODO: AlertDialog に置換）
	const handlePermanentDeletePage = useCallback(
		(id: string) => {
			if (!confirm('このページを完全に削除してもよろしいですか？この操作は取り消せません。')) {
				return
			}
			permanentDeletePage(id)
		},
		[permanentDeletePage]
	)

	const sidebarProps = {
		pages: pagesMeta,
		activePageId,
		onSelectPage: setActivePageId,
		onAddPage: addPage,
		onUpdatePage: updatePage,
		onDeletePage: softDeletePage,
		onRestorePage: restorePage,
		onPermanentDeletePage: handlePermanentDeletePage,
	}

	return isDesktop ? (
		<DesktopSidebar {...sidebarProps} />
	) : (
		<MobileDrawer {...sidebarProps} />
	)
}
