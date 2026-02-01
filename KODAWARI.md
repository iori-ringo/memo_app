# 技術的なこだわり（Technology Highlights）

このドキュメントは、就活ポートフォリオ用にプロジェクトの技術的なこだわりをまとめたものです。

---

## 📱 プロジェクト概要

**Magic Memo** - macOS向けデスクトップメモアプリ

「事実 → 抽象化 → 転用」というメソッドに基づいた独自のノート構造を持つ、キャンバスベースのメモアプリケーション。

**技術スタック**
- **フロントエンド**: Next.js 16 / React 19 / TypeScript
- **デスクトップ**: Electron 39
- **スタイリング**: Tailwind CSS v4 / Shadcn UI
- **エディタ**: Tiptap（リッチテキスト）
- **AI統合**: Google Gemini API
- **データ永続化**: electron-store

---

## 🏗️ アーキテクチャ設計

### Feature-Based Architecture

機能ごとにモジュールを分割し、依存関係を明確に定義しています。

```
src/
├── app/                   # ルーティングのみ（薄いレイヤー）
├── features/              # 機能ベースのモジュール
├── shared/                # 共有コンポーネント
├── lib/                   # ユーティリティ
└── types/                 # グローバル型定義（SSoT）
```

**こだわりポイント**:
- **循環依存の防止**: 依存方向を厳密に `app → features → shared → lib → types` と定義
- **Platform Adapter**: Electron 依存を `src/lib/platform-events.ts` に抽象化し、Web 版との両立性を確保

### 📂 Feature構成と責務

`src/features` はアプリケーションの中核ロジックを含み、責務ごとに4つの主要モジュールに分割されています。

#### 1. `features/notebook`（ノートブック・キャンバス機能）
**責務**: 「描画」と「配置」。空間的なレイアウト、無限キャンバス、オブジェクト管理。

- **`components/canvas/`**: キャンバスの土台
  - `notebook-canvas.tsx`: パン・ズーム機能を持つキャンバス本体
  - `canvas-background.tsx`: 背景描画（横罫線やセクション区切り）
  - `connection-layer.tsx`: ブロック間の接続線（矢印）描画
- **`components/blocks/`**: キャンバス上のオブジェクト
  - `text-block.tsx`: ドラッグ・リサイズ可能なテキストボックスコンテナ
  - `handwriting-layer.tsx`: 手書きストローク描画レイヤー
- **`components/toolbar/`**: 操作ツール
  - `ribbon-toolbar.tsx`: コンテキストに応じた操作パネル（MacライクなリボンUI）

**エディタコンポーネント** は `notebook` 内に統合済み（`components/editor/`）。キャンバス専用のため独立した feature としない設計判断を行った。

**こだわりポイント: カスタムフックによる関心の分離**
キャンバス機能は操作が複雑になりがちですが、ロジックを4つのカスタムフックに完全分離することで、View (`notebook-canvas.tsx`) を薄く保っています。

- **`use-canvas-layout.ts`**: レイアウト境界の計算と永続化
- **`use-canvas-operations.ts`**: オブジェクトのCRUD操作を一元管理
- **`use-canvas-selection.ts`**: 選択状態とフォーカス制御（エディタ連動含む）
- **`use-canvas-shortcuts.ts`**: グローバルショートカットとモード制御

**パフォーマンス最適化: `useRef` によるイベントリスナー制御**
ショートカット制御 (`use-canvas-shortcuts.ts`) では、選択中のオブジェクトや操作モードなど、頻繁に変更される多数の状態に依存しています。

**Before (`useEffect` 依存配列パターン):**
`useEffect` の依存配列に状態を入れる一般的な実装では、モード切り替えや選択変更のたびに「既存リスナーの削除」→「新リスナーの登録」という脱着処理が頻繁に発生し、ブラウザに不要な負荷を与えていました。

**After (`useRef` 最新値参照パターン):**
これを防ぐため、**「イベントリスナーは最初の1回だけ登録し、変化する値は `useRef` に保存して参照する」** パターン（Vercel の React Best Practices "advanced-use-latest"）を採用しました。

1.  イベントリスナーは**初回マウント時のみ登録**し、一切作り直さない。
2.  状態が変わるたびに `useRef` の中身だけを軽量に書き換える。
3.  イベント発火時に、リスナー内部から `ref.current` を経由して最新の状態を取得する。

```typescript
// パフォーマンス最適化パターン
const stateRef = useRef({ ...dependencies })

// 1. 状態が変わるたびにRefの中身だけを上書き（非常に軽量）
useEffect(() => {
  stateRef.current = { ...dependencies }
}, [dependencies])

// 2. イベントリスナーは初回のみ登録（依存配列は空）
useEffect(() => {
  const handler = (e) => {
    // 3. 実行時にRefから「その瞬間の最新状態」を取得
    const current = stateRef.current
    if (current.selectedObjectId) {
      // ...
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])
```
これにより、リスナーの再登録コストを**ゼロ**にしつつ、常に最新の状態に基づいた安全なショートカット処理を実現しています。


#### 2. `features/notes`（データ管理機能）
**責務**: 「データの永続化」。UIから切り離されたデータの読み書きと状態管理。

- **`components/home-content.tsx`**: アプリのメインレイアウト（Container コンポーネント）
  - **役割**: アプリのシェル（外枠）であり、すべての状態を集約して子に流す Container
  - Sidebar + NotebookCanvas を配置・統合
  - `useNotes` / `useTrash` を呼び出し、子コンポーネントに props で配布
  - Electronメニューイベント（新規作成、ダークモード）を受信
- **`hooks/use-notes.ts`**: ノートのCRUD操作と状態管理
- **`hooks/use-trash.ts`**: ゴミ箱機能（ソフトデリート、復元、自動クリーンアップ）
- **`services/note-storage.ts`**: ファイルシステムやlocalStorageへの永続化処理

**こだわりポイント: プラットフォームイベントリスナーの最適化**

`home-content.tsx` では Electron メニューからのイベント（新規作成、ダークモード切替）を受信しています。

**Before（依存配列パターン）:**
`resolvedTheme` や `handleAddPage` を依存配列に含めると、テーマ変更やコールバック再生成のたびにリスナーが再登録されていました。

**After（`useLatest` パターン）:**
Vercel React Best Practices の `advanced-use-latest` を適用し、リスナーは初回マウント時のみ登録。変化する値は `useRef` 経由で参照することで、リスナーの再登録コストをゼロにしています。

```typescript
// useLatest パターン: 最新の値を ref に保存
const latestRef = useRef({ handleAddPage, setTheme, resolvedTheme })

useEffect(() => {
  latestRef.current = { handleAddPage, setTheme, resolvedTheme }
}, [handleAddPage, setTheme, resolvedTheme])

// リスナーは初回のみ登録（依存配列は空）
useEffect(() => {
  const cleanup = platformEvents.onNewPage(() => {
    latestRef.current.handleAddPage()
  })
  return cleanup
}, [])
```

**こだわりポイント: レスポンシブ対応のコンポーネント分離**

Desktop（固定サイドバー）とMobile（Sheet/ドロワー）で異なるUIを提供していますが、これを `DesktopSidebar` と `MobileDrawer` に分離することで:
#### 3. `features/sidebar`（ナビゲーション機能）
**責務**: 「整理と移動」。ノートの探索と切り替え。

- **`components/app-sidebar.tsx`**: ナビゲーション全体のコアコンポーネント
- **`components/desktop-sidebar.tsx`**: Desktop用サイドバーラッパー
- **`components/mobile-drawer.tsx`**: Mobile用ドロワーラッパー
- **`components/parts/`**: ページリスト、ゴミ箱、設定などの個別パーツ
- **`components/parts/page-item-menu.tsx`**: ContextMenu/DropdownMenu 共通のメニュー項目定義

**こだわりポイント: notebookパターンに倣ったhooks分割**

サイドバーのロジックは当初 `use-sidebar-logic.ts`（111行）に集約されていましたが、notebook の hooks 分割パターンに倣い、責務ごとに4つのカスタムフックに分離しました。

| フック | 責務 | 適用したベストプラクティス |
|--------|------|---------------------------|
| `use-sidebar-search.ts` | 検索フィルタリング | `useMemo` でメモ化 |
| `use-sidebar-grouping.ts` | 日付グループ化・お気に入り分離 | `useMemo` + `js-combine-iterations` |
| `use-sidebar-editing.ts` | ページタイトル編集状態 | `useCallback` + `useRef` Latest Value |
| `use-sidebar-shortcuts.ts` | Cmd+M ショートカット | `useRef` Latest Value Pattern |

**メリット**:
- **単一責務**: 各フックが1つの関心事のみを扱い、テストやデバッグが容易に
- **再利用性**: 検索やグループ化のロジックを他のコンポーネントでも再利用可能
- **パフォーマンス**: 不要な再計算・再レンダリングを防止

**こだわりポイント: 複数イテレーションの統合 (`js-combine-iterations`)**

`use-sidebar-grouping.ts` では、ページの分類処理を最適化しました。

**Before（4回イテレーション）:**
```typescript
const activePages = pages.filter((p) => !p.deletedAt)        // 1回目
const deletedPages = pages.filter((p) => p.deletedAt)        // 2回目
const favoritePages = activePages.filter((p) => p.isFavorite) // 3回目
const nonFavoritePages = activePages.filter((p) => !p.isFavorite) // 4回目
```

**After（1回イテレーション）:**
```typescript
const activePages: NotePage[] = []
const deletedPages: NotePage[] = []
const favoritePages: NotePage[] = []

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
  // 日付グループ化...
}
```

**メリット**: 配列を1回走査するだけで全ての分類が完了し、O(4n) → O(n) に改善。

**こだわりポイント: メニュー項目の共通化（DRY原則）**

`page-list-item.tsx` では、DropdownMenu（...ボタン）と ContextMenu（右クリック）で同じメニュー項目を表示しますが、当初は同じ定義が2回書かれていました。

**Before（重複コード）:**
```tsx
// ContextMenu用
const menuItems = isTrash ? (
  <>
    <ContextMenuItem onClick={() => onRestore?.(page.id)}>復元</ContextMenuItem>
    <ContextMenuItem onClick={() => onPermanentDelete?.(page.id)}>完全に削除</ContextMenuItem>
  </>
) : (...)

// DropdownMenu用（ほぼ同じ内容を再定義）
const dropdownMenuItems = isTrash ? (
  <>
    <DropdownMenuItem onClick={() => onRestore?.(page.id)}>復元</DropdownMenuItem>
    <DropdownMenuItem onClick={() => onPermanentDelete?.(page.id)}>完全に削除</DropdownMenuItem>
  </>
) : (...)
```

**After（共通化）:**
```typescript
// page-item-menu.tsx
type PageMenuAction = {
  icon: LucideIcon
  label: string
  onClick: () => void
  variant?: 'default' | 'destructive'
}

// アクション定義を共通化
export const getPageMenuActions = (page, handlers, isTrash): PageMenuAction[] => {
  if (isTrash) {
    return [
      { icon: RotateCcw, label: '復元', onClick: () => handlers.onRestore?.(page.id) },
      { icon: Trash2, label: '完全に削除', onClick: () => handlers.onPermanentDelete?.(page.id), variant: 'destructive' }
    ]
  }
  return [...]
}

// 各メニューコンポーネントは actions を受け取ってレンダリング
export const PageContextMenuItems = ({ actions }) => (...)
export const PageDropdownMenuItems = ({ actions }) => (...)
```

**メリット**:
- **DRY原則**: メニュー項目の定義が1箇所に集約され、変更時の修正漏れを防止
- **一貫性**: ContextMenu と DropdownMenu で必ず同じ項目が表示される
- **拡張性**: 新しいメニュー項目の追加が容易

**こだわりポイント: 安定したコールバック参照 (`useCallback` + `useRef`)**

`use-sidebar-editing.ts` では、編集関連のハンドラーが毎レンダーで再生成されないよう最適化しました。

```typescript
// useRef Latest Value Pattern: コールバック内で最新値を参照
const pagesRef = useRef(pages)
pagesRef.current = pages
const onUpdatePageRef = useRef(onUpdatePage)
onUpdatePageRef.current = onUpdatePage

// 安定したコールバック（依存配列が空）
const handleStartEditing = useCallback((page: NotePage) => {
  setEditingPageId(page.id)
  setEditingTitle(page.title)
}, [])

const handleFinishEditing = useCallback(() => {
  setEditingPageId((currentEditingPageId) => {
    // ref経由で最新のpages/onUpdatePageを参照
    const page = pagesRef.current.find((p) => p.id === currentEditingPageId)
    // ...
  })
}, [])
```

**メリット**:
- **安定した参照**: `handleStartEditing` 等が再生成されないため、子コンポーネントの不要な再レンダリングを防止
- **Stale Closure防止**: `useRef` 経由で常に最新の `pages` と `onUpdatePage` を参照

**こだわりポイント: インライン編集のベストプラクティス適用**

`PageListItem` コンポーネント（`components/parts/page-list-item.tsx`）では、ページタイトルのインライン編集機能を実装しています。PatternFly、Atlassian Design、Cloudscape などの主要デザインシステムのガイドラインを参考に、以下のパターンを採用しました。

1. **レイアウトの安定化**: 編集/表示モードで DOM 構造を大きく変えず、`flex-1 min-w-0` のシンプルな flex 構造で幅を制御。編集時もコンテナの高さが変わらないよう `border-b` のみ使用し、レイアウトジャンプを防止。

2. **確実なフォーカス管理**: `autoFocus` 属性ではなく `useEffect` + `useRef` でフォーカスを制御。編集開始時にテキスト全選択も実行し、即座に入力可能な状態に。

3. **blur 自動保存パターン**: 短いテキスト編集では blur で自動保存が UX のベストプラクティス。Escape キーでキャンセル、Enter キーで確定のキーボード操作にも対応。

4. **ドロップダウン位置の明示的指定**: ScrollArea 内での配置を考慮し、`side="bottom"` `align="end"` `collisionPadding={8}` を明示指定。Radix UI の Portal と組み合わせ、親の overflow に影響されない正確な位置計算を実現。

```typescript
// フォーカス管理: autoFocus より確実な useEffect パターン
const inputRef = useRef<HTMLInputElement>(null)

useEffect(() => {
  if (isEditing && inputRef.current) {
    inputRef.current.focus()
    inputRef.current.select() // 全選択で即編集可能に
  }
}, [isEditing])
```

**こだわりポイント: レスポンシブ対応のコンポーネント分離**

Desktop（固定サイドバー）とMobile（Sheet/ドロワー）で異なるUIを提供していますが、これを `DesktopSidebar` と `MobileDrawer` に分離することで:
- 各コンポーネントの責務が明確に
- 将来的なプラットフォーム固有の最適化が容易に
- テストやスタイル変更の影響範囲を限定

**こだわりポイント: ScrollAreaの排除とパディング一元管理**

サイドバー内の要素（検索欄、ボタン、ページリスト）の横幅を統一するため、以下のリファクタリングを実施しました。

**課題**: shadcn/radix の `ScrollArea` はスクロールバー用のスペース（約10px）をViewport横に確保するため、ScrollArea内外で要素の幅がずれる問題がありました。

**解決策**:
1. `ScrollArea` を通常の `div` + `overflow-y-auto` に置き換え（オーバーレイスクロールバー化）
2. 固定要素（ボタン）をスクロール領域の外に配置
3. 親コンテナで `px-4` を一元管理し、子コンポーネントの個別パディングを削除

```tsx
// Before: ScrollArea内外で幅がずれる
<SidebarHeader className="p-4" />      {/* 16px */}
<ScrollArea>
  <div className="p-2">                 {/* 8px + スクロールバー分ずれる */}
    <Button className="mx-2" />         {/* 個別調整が必要 */}
    <PageListItem className="px-2" />   {/* 個別調整が必要 */}
  </div>
</ScrollArea>

// After: 親で一元管理
<SidebarHeader className="p-4" />       {/* 16px */}
<div className="p-4 pt-3">              {/* 16px - ボタンは外 */}
  <Button className="w-full" />
</div>
<div className="overflow-y-auto">
  <div className="px-4 py-2">           {/* 16px - 統一 */}
    <PageListItem />                    {/* パディング不要 */}
  </div>
</div>
```

**学び**: `ScrollArea` はスクロールバーのカスタムスタイリングが必要な場合に有効ですが、他要素との幅統一が求められる場面では通常の `overflow-y-auto` の方がシンプルに解決できます。

### 型の Single Source of Truth (SSoT)

Electron と Web 間のデータ整合性を保つため、型定義を一箇所に集約しています。



**こだわりポイント: `.d.ts` の採用理由**
Electron と Next.js (Web) で型を共有する際、単純に `.ts` ファイルとして `src/types` に置くと、以下の問題が発生しました。

1. **`rootDir` 制約の衝突**: `src/types/note.ts` は「ソースコード」とみなされるため、Electron のコンパイラ（`tsc`）が「`src` ディレクトリは `rootDir`（`electron/`）の外側にある」とエラーを出します。
2. **設定の複雑化**: これを回避するには、Electron 側の `tsconfig.json` を大幅に変更し、アプリ全体のディレクトリ構造を再定義する必要があり、設定が複雑化します。

そこで、今回 **`.d.ts`（型定義ファイル）として配置するアプローチ** を採用しました。`.d.ts` はコンパイル対象の実装コードを含まない「型の辞書」として扱われるため、`rootDir` の制約を受けずに Electron / Web 両方からクリーンに参照でき、ビルド設定もシンプルなまま維持できます。

| 定義場所 | 役割 |
|---------|------|
| `src/types/note.d.ts` | **SSoT**。`NotePage`, `AppConfig` 等のコア型定義 |
| `electron/ipc/types.ts` | `src/types` から import。IPC チャンネル定義のみ保持 |
| `src/types/electron.d.ts` | グローバル Window 型拡張 |

---

## 🎨 キャンバスベースのUI

テキストブロックを自由に配置・接続できるキャンバスUIを実装しました。

### 実装技術

| 機能 | ライブラリ | 実装ファイル |
|------|-----------|-------------|
| ドラッグ | `react-draggable` | `text-block.tsx` |
| リサイズ | `react-resizable` | `text-block.tsx` |
| 接続線 | SVG (Vanilla) | `connection-layer.tsx` |

### 接続線のこだわり

オブジェクト間の接続線は、中心間ではなく**矩形の境界からの接続**を実現しています。

```typescript
// 線と矩形の交点を計算するアルゴリズムを実装
const getIntersection = (
  p1: { x: number; y: number },  // 始点（中心）
  p2: { x: number; y: number },  // 終点（中心）
  rect: { x: number; y: number; width: number; height: number }
) => {
  // 4辺それぞれとの交点を計算し、最も近いものを返す
  // ...
}
```

### カスタムリサイズハンドル

ライブラリのデフォルトUIではなく、デザインに合わせたピル型ハンドルを実装しています。

```typescript
// CSS group-hover を活用したホバー効果
// isSelected 時は常時表示、それ以外はホバー時のみ表示
className={cn(
  isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
)}
```

### パフォーマンスを意識した手書き描画

手書きレイヤー（`features/notebook/components/blocks/handwriting-layer.tsx`）では、Reactの宣言的なデータフローと、Canvas APIの命令的な描画処理を組み合わせています。

**こだわりポイント:**
- **Canvas API vs SVG**: 多数のストロークを扱う際のパフォーマンス（DOM要素数の爆発を防ぐ）と、ペンの追従性（リアルタイム描画）を重視し、SVGではなくCanvas要素への直接描画を採用しました。
- **命令的アプローチの採用**: Reactの状態管理から一時的に離れ、`useEffect` 内で Context2D API を直接操作することで、VDOMのオーバーヘッドを回避し、ネイティブに近い書き心地を実現しています。

```typescript
// パフォーマンス重視の命令的描画処理
useEffect(() => {
  const ctx = canvas.getContext('2d')
  // Reactのレンダリングサイクルを待たずに直接描画
  ctx.beginPath()
  ctx.moveTo(x, y)
  // ...
}, [strokes])
```

---

## ✏️ リッチテキストエディタ

**Tiptap**をベースに、カスタム拡張を追加しています。

### カスタム拡張

- **フォントサイズ拡張** (`extensions/font-size.ts`)
  - `setFontSize` / `unsetFontSize` コマンドを追加
  - CSS変数ベースのサイズ管理

### キャンバスモードとサイドバーモードの切り替え

同じエディタコンポーネントで `variant` プロパティにより表示を切り替え。

```tsx
<RichTextEditor
  variant="canvas"  // または "sidebar"
  // ...
/>
```

---

## 🤖 AI統合（Gemini API）

ノートの内容をAIが分析し、「抽象化」と「転用」を自動生成する機能を実装しています。

### IPC経由のセキュアなAPI呼び出し

レンダラー側から直接APIを呼び出すのではなく、メインプロセスで処理しています。

```
[Renderer] → IPC → [Main Process] → Gemini API → [Main Process] → IPC → [Renderer]
```

### モック対応

API Keyが設定されていない開発環境でも動作するよう、モックレスポンスを用意しています。

```typescript
const MOCK_RESPONSES = {
  abstraction: 'これは抽象化のサンプルテキストです...',
  diversion: 'これは転用のサンプルテキストです...',
  summary: 'これは要約のサンプルテキストです...',
} as const
```

---

## 🔒 Electron セキュリティ

### ベストプラクティスの適用

| 設定 | 値 | 目的 |
|------|---|------|
| `contextIsolation` | `true` | プリロードスクリプトの分離 |
| `nodeIntegration` | `false` | レンダラーからのNode.jsアクセス禁止 |
| `sandbox` | `true` | サンドボックス化 |

### 型安全なIPC通信

チャンネル名を定数として定義し、型安全性を確保しています。

```typescript
// electron/ipc/types.ts
export const IPC_CHANNELS = {
  LOAD_PAGES: 'load-pages',
  SAVE_PAGES: 'save-pages',
  // ...
} as const

export type IpcChannelName = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]
```

### 入力検証

レンダラーからのデータは信頼せず、メインプロセス側で厳密に検証しています。

```typescript
// electron/utils/validators.ts
export function isValidNotePage(page: unknown): page is NotePage {
  if (typeof page !== 'object' || page === null) return false
  // 必須フィールドと必須配列の型チェック
  return (
    typeof p.id === 'string' &&
    Array.isArray(p.objects) &&
    Array.isArray(p.strokes) &&
    Array.isArray(p.connections)
  )
}
```

### ナビゲーション制限

外部サイトへの遷移をブロックし、許可されたオリジンのみ許可しています。

```typescript
// 外部遷移をブロック
mainWindow.webContents.on('will-navigate', (event, url) => {
  if (!ALLOWED_ORIGINS.some((origin) => url.startsWith(origin))) {
    event.preventDefault()
  }
})

// 外部リンクは https/mailto のみ許可
mainWindow.webContents.setWindowOpenHandler(({ url }) => {
  const allowedSchemes = ['https:', 'mailto:']
  // ...
})
```

---

## 🛠️ 開発体験の向上

### Biome によるリンティング

ESLint + Prettier から Biome に移行し、高速なリンティング・フォーマットを実現しています。

### Props定義における `type` の採用

ReactコンポーネントのProps定義において、`interface` ではなく `type` エイリアスを全面的に採用しています。

**採用理由:**
1.  **意図しないマージの防止**: `interface` は同名の定義が自動的に結合される「Declaration Merging」という仕様がありますが、Props定義においては意図しない拡張によるバグの原因となり得ます。`type` はこれを防止します。
2.  **型表現の柔軟性**: Union型やIntersection型、Utility Typesとの組み合わせにおいて、`type` の方が直感的かつ柔軟に記述できます。
3.  **一貫性**: アプリケーション内の他の型定義（状態管理やAPI型）が `type` で行われているため、コードベース全体の一貫性を保ちます。

### パスエイリアス

TypeScriptのパスエイリアスを活用し、可読性の高いインポートを実現。

```typescript
// Before
import { Button } from '../../../shared/ui/button'

// After
import { Button } from '@/shared/ui/button'
```

---

## 📊 技術選定の理由

| 技術 | 選定理由 |
|------|---------|
| **Next.js + Electron** | SSGによる高速静的ファイル生成とデスクトップ統合 |
| **Tiptap** | 拡張性の高いリッチテキスト、ProseMirrorベース |
| **electron-store** | シンプルで型安全なローカルストレージ |
| **Tailwind CSS v4** | 高速なビルドとユーティリティファースト設計 |
| **Shadcn UI** | カスタマイズ可能なコンポーネントライブラリ |

---

## 🚀 今後の展望

### クラウド同期（Supabase）

現在のデータ永続化は環境ごとに分離されています。

| 環境 | 保存先 | 実装ファイル |
|------|--------|-------------|
| Electronデスクトップ | ファイルシステム（`electron-store`） | `electron/store/` |
| Webブラウザ | `localStorage` | `features/notes/services/note-storage.ts` |

**今後の計画**: **Supabase** を導入し、デバイス間でのデータ同期を実現する。

**選定理由**:
- BaaS（Backend as a Service）のためバックエンド開発が不要
- TypeScriptとの相性が良い（型生成サポート）
- 認証機能が組み込み（Email, Google, GitHub等）
- リアルタイム同期が可能
- 無料枠が十分（個人開発に最適）
- **MCP（Model Context Protocol）サーバー対応**: AI支援による効率的な開発が可能

**Supabase MCP サーバーの活用**:
Supabase は公式で MCP サーバーを提供しており、AIエージェントと連携した開発が可能。
- テーブル設計・マイグレーション生成を自然言語で指示
- DBスキーマからTypeScript型を自動生成
- Edge Functions のデプロイ
- プロジェクト設定（URL、APIキー）の取得

**実装ステップ（予定）**:
1. Supabase プロジェクト作成とテーブル設計
2. `note-storage.ts` にSupabaseアダプターを追加
3. ユーザー認証（ログイン/サインアップ）の実装
4. オフライン対応（ローカル優先 + バックグラウンド同期）
5. 同期コンフリクトの解決ロジック

### その他の展望

- 手書き入力の改善
- 複数ノートブック対応の強化
