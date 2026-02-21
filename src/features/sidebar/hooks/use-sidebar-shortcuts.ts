import { useEffect, useRef } from 'react'

type UseSidebarShortcutsProps = {
	onAddPage: () => void
}

export const useSidebarShortcuts = ({ onAddPage }: UseSidebarShortcutsProps) => {
	// useRef Latest Value Pattern: ref経由で最新値を参照（use-sidebar-editing と同一パターン）
	const onAddPageRef = useRef(onAddPage)
	onAddPageRef.current = onAddPage

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
				e.preventDefault()
				onAddPageRef.current()
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])
}
