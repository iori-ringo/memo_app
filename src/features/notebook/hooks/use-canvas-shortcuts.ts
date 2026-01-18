import type { Editor } from '@tiptap/react'
import { useEffect } from 'react'

type UseCanvasShortcutsProps = {
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

			// 入力フィールドやテキストエリア、contenteditable で入力中の場合は無視する（コマンドの場合を除く）
			const isTyping =
				e.target instanceof HTMLInputElement ||
				e.target instanceof HTMLTextAreaElement ||
				(e.target instanceof HTMLElement && e.target.isContentEditable)

			// 入力中でもコマンドは許可するが、デフォルトの入力動作をブロックしないように注意する
			// 例: Cmd+B (太字) はOKだが、特定のコマンドはインターセプトしたい

			// --- グローバルキャンバスショートカット (Cmd+...) ---

			// Cmd+D: 選択したオブジェクト/接続を削除 (ダークモード切り替えを上書き)
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

			// Cmd+N: 新規テキストボックス
			if (isCmdOrCtrl && e.key === 'n') {
				e.preventDefault()
				const { x, y } = mousePositionRef.current
				handleAddBlock(x, y)
				return
			}

			// Cmd+P: ペンモード
			if (isCmdOrCtrl && e.key === 'p') {
				e.preventDefault()
				setIsPenMode(true)
				setIsConnectMode(false)
				setIsObjectEraserMode(false)
				return
			}

			// Cmd+E: 消しゴムモード
			if (isCmdOrCtrl && e.key === 'e') {
				e.preventDefault()
				setIsObjectEraserMode(true)
				setIsPenMode(false)
				setIsConnectMode(false)
				return
			}

			// --- テキスト書式設定ショートカット (エディタがアクティブな場合のみ) ---
			if (activeEditor && isCmdOrCtrl) {
				// Cmd + / - : フォントサイズ
				if (e.key === '+' || e.key === '=') {
					// + または = (多くの場合同じキー)
					e.preventDefault()
					// サイズを大きくするために現在のフォントサイズを知る必要がある
					// Tiptapの属性が使えるかもしれないし、実装していればエディタコマンドに頼ることもできる
					// FontSize拡張機能は setFontSize を使用している
					// 2px単位で増減すると仮定
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

				// Cmd+O: 取り消し線
				if (e.key === 'o') {
					e.preventDefault()
					activeEditor.chain().focus().toggleStrike().run()
					return
				}

				// Cmd+1: 箇条書き
				if (e.key === '1') {
					e.preventDefault()
					activeEditor.chain().focus().toggleBulletList().run()
					return
				}
				// Cmd+2: 番号付きリスト
				if (e.key === '2') {
					e.preventDefault()
					activeEditor.chain().focus().toggleOrderedList().run()
					return
				}
				// Cmd+3: チェックボックスリスト (タスクリスト)
				if (e.key === '3') {
					e.preventDefault()
					activeEditor.chain().focus().toggleTaskList().run()
					return
				}

				// Cmd+L: 左揃え
				if (e.key === 'l') {
					e.preventDefault()
					activeEditor.chain().focus().setTextAlign('left').run()
					return
				}
				// Cmd+G: 中央揃え
				if (e.key === 'g') {
					e.preventDefault()
					activeEditor.chain().focus().setTextAlign('center').run()
					return
				}
				// Cmd+R: 右揃え
				if (e.key === 'r') {
					e.preventDefault()
					activeEditor.chain().focus().setTextAlign('right').run()
					return
				}
			}

			// --- 標準的な非Cmdショートカット ---

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

			// モード切り替え (単一キー、入力中でない場合のみ)
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
