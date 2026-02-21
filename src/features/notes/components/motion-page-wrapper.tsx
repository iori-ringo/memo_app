'use client'

import { AnimatePresence, motion } from 'framer-motion'
import type { ReactNode } from 'react'

import { NotebookCanvas } from '@/features/notebook/components/canvas/notebook-canvas'
import type { NotePage } from '@/types/note'

type MotionPageWrapperProps = {
	activePage: NotePage | undefined
	onUpdate: (id: string, updates: Partial<NotePage>) => void
	emptyState: ReactNode
}

export const MotionPageWrapper = ({ activePage, onUpdate, emptyState }: MotionPageWrapperProps) => {
	return (
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
					<NotebookCanvas page={activePage} onUpdate={onUpdate} />
				</motion.div>
			) : (
				emptyState
			)}
		</AnimatePresence>
	)
}
