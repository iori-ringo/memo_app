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

**こだわりポイント: レスポンシブ対応のコンポーネント分離**

Desktop（固定サイドバー）とMobile（Sheet/ドロワー）で異なるUIを提供していますが、これを `DesktopSidebar` と `MobileDrawer` に分離することで:
- 各コンポーネントの責務が明確に
- 将来的なプラットフォーム固有の最適化が容易に
- テストやスタイル変更の影響範囲を限定

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
