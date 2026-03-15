import type { Editor } from '@tiptap/react'
import { useCallback, useRef, useState } from 'react'

export const useCanvasSelection = () => {
	const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
	const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
	const [activeEditor, setActiveEditor] = useState<Editor | null>(null)

	// useLatest パターン: activeEditor の ref 経由参照でコールバックを安定化
	const activeEditorRef = useRef(activeEditor)
	activeEditorRef.current = activeEditor

	const handleBlockClick = useCallback((id: string) => {
		setSelectedObjectId(id)
		setSelectedConnectionId(null)
	}, [])

	const handleConnectionClick = useCallback(
		(connectionId: string) => {
			setSelectedConnectionId(connectionId)
			setSelectedObjectId(null)
			// Blur editor if active
			if (activeEditorRef.current) {
				activeEditorRef.current.commands.blur()
				setActiveEditor(null)
			}
		},
		[]
	)

	const handleBackgroundClick = useCallback(() => {
		setSelectedObjectId(null)
		setSelectedConnectionId(null)
		if (activeEditorRef.current) {
			activeEditorRef.current.commands.blur()
			setActiveEditor(null)
		}
	}, [])

	const handleEditorReady = useCallback((objectId: string, editor: Editor) => {
		// When editor is focused, select the object
		editor.on('focus', () => {
			setSelectedObjectId(objectId)
			setSelectedConnectionId(null)
			setActiveEditor(editor)
		})
	}, [])

	return {
		selectedObjectId,
		selectedConnectionId,
		activeEditor,
		handleBlockClick,
		handleConnectionClick,
		handleBackgroundClick,
		handleEditorReady,
		setSelectedObjectId,
		setSelectedConnectionId,
	}
}
