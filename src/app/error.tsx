'use client'

import { useEffect } from 'react'

import { Button } from '@/shared/shadcn/button'

const ErrorPage = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
	useEffect(() => {
		console.error('Unhandled error:', error)
	}, [error])

	return (
		<div className="flex h-screen items-center justify-center">
			<div className="flex flex-col items-center gap-4 text-center">
				<h2 className="text-xl font-semibold text-foreground">エラーが発生しました</h2>
				<p className="text-sm text-muted-foreground">{error.message}</p>
				<Button onClick={reset} variant="outline">
					再試行
				</Button>
			</div>
		</div>
	)
}

export default ErrorPage
