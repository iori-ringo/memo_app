import type { Editor } from '@tiptap/react'
import { useEffect, useRef } from 'react'

type UseCanvasShortcutsProps = {
	selectedObjectId: string | null
	selectedConnectionId: string | null
	isConnectMode: boolean
	activeEditor: Editor | null
	handleDeleteObject: (id: string) => void
	handleDeleteConnection: (id: string) => void
	toggleConnectMode: () => void
	setSelectedObjectId: (id: string | null) => void
	setSelectedConnectionId: (id: string | null) => void
	handleAddBlock: (x: number, y: number) => void
	mousePositionRef: React.MutableRefObject<{ x: number; y: number }>
}

export const useCanvasShortcuts = ({
	selectedObjectId,
	selectedConnectionId,
	isConnectMode,
	activeEditor,
	handleDeleteObject,
	handleDeleteConnection,
	toggleConnectMode,
	setSelectedObjectId,
	setSelectedConnectionId,
	handleAddBlock,
	mousePositionRef,
}: UseCanvasShortcutsProps) => {
	// 最新の状態を保持するRef
	const stateRef = useRef({
		selectedObjectId,
		selectedConnectionId,
		isConnectMode,
		activeEditor,
		handleDeleteObject,
		handleDeleteConnection,
		toggleConnectMode,
		setSelectedObjectId,
		setSelectedConnectionId,
		handleAddBlock,
	})

	// 状態が変わるたびにRefを更新
	useEffect(() => {
		stateRef.current = {
			selectedObjectId,
			selectedConnectionId,
			isConnectMode,
			activeEditor,
			handleDeleteObject,
			handleDeleteConnection,
			toggleConnectMode,
			setSelectedObjectId,
			setSelectedConnectionId,
			handleAddBlock,
		}
	}, [
		selectedObjectId,
		selectedConnectionId,
		isConnectMode,
		activeEditor,
		handleDeleteObject,
		handleDeleteConnection,
		toggleConnectMode,
		setSelectedObjectId,
		setSelectedConnectionId,
		handleAddBlock,
	])

	// biome-ignore lint/correctness/useExhaustiveDependencies: mousePositionRef is a ref object that doesn't change, only its .current property does
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			const isCmdOrCtrl = e.metaKey || e.ctrlKey
			// Refから最新の状態を取得
			const current = stateRef.current
			const { activeEditor: editor } = current

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
				if (current.selectedObjectId) {
					current.handleDeleteObject(current.selectedObjectId)
					current.setSelectedObjectId(null)
				}
				if (current.selectedConnectionId) {
					current.handleDeleteConnection(current.selectedConnectionId)
					current.setSelectedConnectionId(null)
				}
				return
			}

			// Cmd+N: 新規テキストボックス
			if (isCmdOrCtrl && e.key === 'n') {
				e.preventDefault()
				const { x, y } = mousePositionRef.current
				current.handleAddBlock(x, y)
				return
			}

			// --- テキスト書式設定ショートカット (エディタがアクティブな場合のみ) ---
			if (editor && isCmdOrCtrl) {
				// Cmd + / - : フォントサイズ
				if (e.key === '+' || e.key === '=') {
					// + または = (多くの場合同じキー)
					e.preventDefault()
					// サイズを大きくするために現在のフォントサイズを知る必要がある
					// Tiptapの属性が使えるかもしれないし、実装していればエディタコマンドに頼ることもできる
					// FontSize拡張機能は setFontSize を使用している
					// 2px単位で増減すると仮定
					const currentSize = editor.getAttributes('textStyle').fontSize || '16px'
					const sizeNum = parseInt(currentSize.replace('px', ''), 10)
					editor
						.chain()
						.focus()
						.setFontSize(`${sizeNum + 2}px`)
						.run()
					return
				}
				if (e.key === '-') {
					e.preventDefault()
					const currentSize = editor.getAttributes('textStyle').fontSize || '16px'
					const sizeNum = parseInt(currentSize.replace('px', ''), 10)
					if (sizeNum > 8) {
						editor
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
					editor.chain().focus().toggleStrike().run()
					return
				}

				// Cmd+1: 箇条書き
				if (e.key === '1') {
					e.preventDefault()
					editor.chain().focus().toggleBulletList().run()
					return
				}
				// Cmd+2: 番号付きリスト
				if (e.key === '2') {
					e.preventDefault()
					editor.chain().focus().toggleOrderedList().run()
					return
				}
				// Cmd+3: チェックボックスリスト (タスクリスト)
				if (e.key === '3') {
					e.preventDefault()
					editor.chain().focus().toggleTaskList().run()
					return
				}

				// Cmd+L: 左揃え
				if (e.key === 'l') {
					e.preventDefault()
					editor.chain().focus().setTextAlign('left').run()
					return
				}
				// Cmd+G: 中央揃え
				if (e.key === 'g') {
					e.preventDefault()
					editor.chain().focus().setTextAlign('center').run()
					return
				}
				// Cmd+R: 右揃え
				if (e.key === 'r') {
					e.preventDefault()
					editor.chain().focus().setTextAlign('right').run()
					return
				}
			}

			// --- 標準的な非Cmdショートカット ---

			if (e.key === 'Delete' || e.key === 'Backspace') {
				if (!isTyping) {
					if (current.selectedObjectId) {
						current.handleDeleteObject(current.selectedObjectId)
						current.setSelectedObjectId(null)
					}
					if (current.selectedConnectionId) {
						current.handleDeleteConnection(current.selectedConnectionId)
						current.setSelectedConnectionId(null)
					}
				}
			}

			if (e.key === 'Escape') {
				current.setSelectedObjectId(null)
				current.setSelectedConnectionId(null)
				// 接続モードON時のみトグルでOFF（connectSourceIdもクリアされる）
				if (current.isConnectMode) {
					current.toggleConnectMode()
				}
				if (editor) {
					editor.commands.blur()
				}
			}

			// モード切り替え (単一キー、入力中でない場合のみ)
			if (!isTyping && !isCmdOrCtrl) {
				if (e.key === 'c') {
					current.toggleConnectMode()
				}
			}
		}

		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [])
}
