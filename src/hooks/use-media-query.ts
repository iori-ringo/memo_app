'use client'

import { useEffect, useState } from 'react'

/**
 * メディアクエリの一致状態を監視するフック
 *
 * SSR 時は false を返し、クライアント側で matchMedia を使用して判定する。
 */
export const useMediaQuery = (query: string): boolean => {
	const [matches, setMatches] = useState(false)

	useEffect(() => {
		const mql = window.matchMedia(query)
		setMatches(mql.matches)

		const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
		mql.addEventListener('change', handler)
		return () => mql.removeEventListener('change', handler)
	}, [query])

	return matches
}
