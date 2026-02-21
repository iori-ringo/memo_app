/**
 * DeleteButton - 削除ボタンコンポーネント
 *
 * 選択中のオブジェクトまたは接続を削除する機能を提供。
 */
'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/shared/shadcn/button'

type DeleteButtonProps = {
	hasSelection: boolean
	onDelete: () => void
}

export const DeleteButton = ({ hasSelection, onDelete }: DeleteButtonProps) => {
	return (
		<Button
			variant="ghost"
			size="sm"
			onClick={onDelete}
			disabled={!hasSelection}
			className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
			title="削除 (Delete)"
		>
			<Trash2 className="h-4 w-4 mr-1" />
			<span className="text-xs">削除</span>
		</Button>
	)
}
