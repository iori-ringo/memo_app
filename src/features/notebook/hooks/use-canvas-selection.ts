import type { Editor } from '@tiptap/react'
import { useCallback, useState } from 'react'

export const useCanvasSelection = () => {
	const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null)
	const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null)
	const [activeEditor, setActiveEditor] = useState<Editor | null>(null)

	const handleBlockClick = useCallback((id: string) => {
		setSelectedObjectId(id)
		setSelectedConnectionId(null)
	}, [])

	const handleConnectionClick = useCallback(
		(connectionId: string) => {
			setSelectedConnectionId(connectionId)
			setSelectedObjectId(null)
			// Blur editor if active
			if (activeEditor) {
				activeEditor.commands.blur()
				setActiveEditor(null)
			}
		},
		[activeEditor]
	)

	const handleBackgroundClick = useCallback(() => {
		setSelectedObjectId(null)
		setSelectedConnectionId(null)
		if (activeEditor) {
			activeEditor.commands.blur()
			setActiveEditor(null)
		}
	}, [activeEditor])

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
