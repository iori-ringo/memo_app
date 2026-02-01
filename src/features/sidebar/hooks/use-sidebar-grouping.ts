import { isThisWeek, isToday, isYesterday } from 'date-fns'
import { useMemo } from 'react'
import type { NotePage } from '@/types/note'

export type GroupedPages = {
	today: NotePage[]
	yesterday: NotePage[]
	thisWeek: NotePage[]
	older: NotePage[]
}

export const useSidebarGrouping = (pages: NotePage[]) => {
	return useMemo(() => {
		// 1回のイテレーションで全ての分類を行う (js-combine-iterations)
		const activePages: NotePage[] = []
		const deletedPages: NotePage[] = []
		const favoritePages: NotePage[] = []
		const groupedPages: GroupedPages = {
			today: [],
			yesterday: [],
			thisWeek: [],
			older: [],
		}

		for (const page of pages) {
			if (page.deletedAt) {
				deletedPages.push(page)
				continue
			}

			activePages.push(page)

			if (page.isFavorite) {
				favoritePages.push(page)
				continue
			}

			// 非お気に入りページを日付でグループ化
			const date = new Date(page.updatedAt)
			if (isToday(date)) {
				groupedPages.today.push(page)
			} else if (isYesterday(date)) {
				groupedPages.yesterday.push(page)
			} else if (isThisWeek(date)) {
				groupedPages.thisWeek.push(page)
			} else {
				groupedPages.older.push(page)
			}
		}

		// 各グループを新しい順にソート
		for (const group of Object.values(groupedPages)) {
			group.sort((a, b) => b.updatedAt - a.updatedAt)
		}

		return { activePages, deletedPages, favoritePages, groupedPages }
	}, [pages])
}
