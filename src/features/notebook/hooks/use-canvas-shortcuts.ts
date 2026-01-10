import type { Editor } from '@tiptap/react'
import { useEffect } from 'react'

interface UseCanvasShortcutsProps {
	selectedObjectId: string | null
	selectedConnectionId: string | null
	isPenMode: boolean
	isConnectMode: boolean
	activeEditor: Editor | null
	handleDeleteObject: (id: string) => void
	handleDeleteConnection: (id: string) => void
	setIsPenMode: (isPenMode: boolean) => void
	setIsConnectMode: (isConnectMode: boolean) => void
	setIsObjectEraserMode: (isObjectEraserMode: boolean) => void
	setSelectedObjectId: (id: string | null) => void
	setSelectedConnectionId: (id: string | null) => void
	handleAddBlock: (x: number, y: number) => void
	mousePositionRef: React.MutableRefObject<{ x: number; y: number }>
}

export const useCanvasShortcuts = ({
	selectedObjectId,
	selectedConnectionId,
	isPenMode,
	isConnectMode,
	activeEditor,
	handleDeleteObject,
	handleDeleteConnection,
	setIsPenMode,
	setIsConnectMode,
	setIsObjectEraserMode,
	setSelectedObjectId,
	setSelectedConnectionId,
	handleAddBlock,
	mousePositionRef,
}: UseCanvasShortcutsProps) => {
	// biome-ignore lint/correctness/useExhaustiveDependencies: mousePositionRef is a ref object that doesn't change, only its .current property does
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isCmdOrCtrl = e.metaKey || e.ctrlKey

			// Ignore if typing in an input or textarea or contenteditable (unless it's a command)
			const isTyping =
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				(e.target instanceof HTMLElement && e.target.isContentEditable)

			// Allow commands even when typing, but be careful not to block default typing behavior
			// For example, Cmd+B is bold, which is fine. But we want to intercept specific ones.

			// --- Global Canvas Shortcuts (Cmd+...) ---

			// Cmd+D: Delete selected object/connection (Overrides Dark Mode)
			if (isCmdOrCtrl && e.key === 'd') {
				e.preventDefault()
				if (selectedObjectId) {
					handleDeleteObject(selectedObjectId)
					setSelectedObjectId(null)
				}
				if (selectedConnectionId) {
					handleDeleteConnection(selectedConnectionId)
					setSelectedConnectionId(null)
				}
				return
			}

			// Cmd+N: New Text Box
			if (isCmdOrCtrl && e.key === 'n') {
				e.preventDefault()
				const { x, y } = mousePositionRef.current
				handleAddBlock(x, y)
				return
			}

			// Cmd+P: Pen Mode
			if (isCmdOrCtrl && e.key === 'p') {
				e.preventDefault()
				setIsPenMode(true)
				setIsConnectMode(false)
				setIsObjectEraserMode(false)
				return
			}

			// Cmd+E: Eraser Mode
			if (isCmdOrCtrl && e.key === 'e') {
				e.preventDefault()
				setIsObjectEraserMode(true)
				setIsPenMode(false)
				setIsConnectMode(false)
				return
			}

			// --- Text Formatting Shortcuts (Only when editor is active) ---
			if (activeEditor && isCmdOrCtrl) {
				// Cmd + / - : Font Size
				if (e.key === '+' || e.key === '=') {
					// + or = (often same key)
					e.preventDefault()
					// We need to know the current font size to increase it.
					// Tiptap's attributes might help, or we can rely on the editor command if we implemented one.
					// Our FontSize extension uses setFontSize.
					// Let's assume a step of 2px.
					const currentSize = activeEditor.getAttributes('textStyle').fontSize || '16px'
					const sizeNum = parseInt(currentSize.replace('px', ''), 10)
					activeEditor
						.chain()
						.focus()
						.setFontSize(`${sizeNum + 2}px`)
						.run()
					return
				}
				if (e.key === '-') {
					e.preventDefault()
					const currentSize = activeEditor.getAttributes('textStyle').fontSize || '16px'
					const sizeNum = parseInt(currentSize.replace('px', ''), 10)
					if (sizeNum > 8) {
						activeEditor
							.chain()
							.focus()
							.setFontSize(`${sizeNum - 2}px`)
							.run()
					}
					return
				}

				// Cmd+O: Strikethrough
				if (e.key === 'o') {
					e.preventDefault()
					activeEditor.chain().focus().toggleStrike().run()
					return
				}

				// Cmd+1: Bullet List
				if (e.key === '1') {
					e.preventDefault()
					activeEditor.chain().focus().toggleBulletList().run()
					return
				}
				// Cmd+2: Numbered List
				if (e.key === '2') {
					e.preventDefault()
					activeEditor.chain().focus().toggleOrderedList().run()
					return
				}
				// Cmd+3: Checkbox List (TaskList)
				if (e.key === '3') {
					e.preventDefault()
					activeEditor.chain().focus().toggleTaskList().run()
					return
				}

				// Cmd+L: Align Left
				if (e.key === 'l') {
					e.preventDefault()
					activeEditor.chain().focus().setTextAlign('left').run()
					return
				}
				// Cmd+G: Align Center
				if (e.key === 'g') {
					e.preventDefault()
					activeEditor.chain().focus().setTextAlign('center').run()
					return
				}
				// Cmd+R: Align Right
				if (e.key === 'r') {
					e.preventDefault()
					activeEditor.chain().focus().setTextAlign('right').run()
					return
				}
			}

			// --- Standard Non-Cmd Shortcuts ---

			if (e.key === 'Delete' || e.key === 'Backspace') {
				if (!isTyping) {
					if (selectedObjectId) {
						handleDeleteObject(selectedObjectId)
						setSelectedObjectId(null)
					}
					if (selectedConnectionId) {
						handleDeleteConnection(selectedConnectionId)
						setSelectedConnectionId(null)
					}
				}
			}

			if (e.key === 'Escape') {
				setSelectedObjectId(null)
				setSelectedConnectionId(null)
				setIsPenMode(false)
				setIsConnectMode(false)
				setIsObjectEraserMode(false)
				if (activeEditor) {
					activeEditor.commands.blur()
				}
			}

			// Mode toggles (Single keys, only when not typing)
			if (!isTyping && !isCmdOrCtrl) {
				if (e.key === 'p') {
					setIsPenMode(!isPenMode)
					setIsConnectMode(false)
					setIsObjectEraserMode(false)
				}
				if (e.key === 'c') {
					setIsConnectMode(!isConnectMode)
					setIsPenMode(false)
					setIsObjectEraserMode(false)
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [
		selectedObjectId,
		selectedConnectionId,
		isPenMode,
		isConnectMode,
		activeEditor,
		handleDeleteObject,
		handleDeleteConnection,
		setIsPenMode,
		setIsConnectMode,
		setIsObjectEraserMode,
		setSelectedObjectId,
		setSelectedConnectionId,
		handleAddBlock,
	])
}
