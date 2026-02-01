import { useEffect, useRef } from 'react'

type UseSidebarShortcutsProps = {
	onAddPage: () => void
}

export const useSidebarShortcuts = ({ onAddPage }: UseSidebarShortcutsProps) => {
	// useRef Latest Value Pattern: イベントリスナーを1度だけ登録し、
	// コールバックの最新値を ref 経由で参照
	const onAddPageRef = useRef(onAddPage)

	useEffect(() => {
		onAddPageRef.current = onAddPage
	}, [onAddPage])

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
