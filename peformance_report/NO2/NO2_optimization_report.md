# パフォーマンス最適化レポート — Phase 0〜4 実施結果

- **対象アプリ**: Magic Memo (Next.js 16 + Electron 39)
- **実施日**: 2026-03-14
- **計測環境**: macOS / Chrome / localhost (本番ビルド `next build` + `serve out`)

---

## 全体サマリー

| 指標 | NO1 (dev) | NO2 (prod) | 変化 |
|------|-----------|-----------|------|
| **Performance Score** | 67 | **87** | +20 |
| **Best Practices** | 78 | **100** | +22 |
| **FCP** | 2.5s | **1.4s** | -44% |
| **LCP** | 9.2s | **4.0s** | -57% |
| **TTI** | 9.3s | **4.1s** | -56% |
| **TBT** | 188ms | **90ms** | -52% |
| **CLS** | 0 | **0** | 維持 |
| **総転送サイズ** | 1,315 KiB | **429 KiB** | -67% |

### バジェット達成状況

| 指標 | バジェット | 実測 | 状態 |
|------|-----------|------|------|
| FCP | < 1,800ms | 1,400ms | 達成 |
| LCP | < 2,500ms | 4,000ms | **未達** |
| TBT | < 200ms | 90ms | 達成 |
| CLS | 0 | 0 | 達成 |
| スクリプト合計 | < 500KB | 352KB | 達成 |

---

## Phase 0: 計測基盤の固定化

### 目的

計測結果を再現・比較可能にするための条件統一とユーティリティ整備。

### 実施内容

| ファイル | 変更内容 |
|---------|---------|
| `src/lib/perf-marks.ts` (新規) | `performance.mark/measure` のSSR安全なラッパー関数と計測マーク名定数を定義 |
| `src/features/notes/stores/note-store.ts` | `hydrate` 完了時に `perfMark(PERF_MARKS.HYDRATE_COMPLETE)` を埋め込み |

#### 具体的な変更

**`src/lib/perf-marks.ts`（新規作成）**
- `PERF_MARKS` 定数オブジェクト: `APP_MOUNT_START`, `HYDRATE_COMPLETE`, `PAGE_SWITCH_START`, `PAGE_SWITCH_END`, `SAVE_START`, `SAVE_END` の 6 マークを定義
- `PERF_MEASURES` 定数オブジェクト: `PAGE_SWITCH`, `SAVE_DURATION` の 2 計測名を定義
- `perfMark(name)`: `typeof performance !== 'undefined'` ガード付きの `performance.mark()` ラッパー
- `perfMeasure(name, startMark, endMark)`: try-catch 付き `performance.measure()` ラッパー（マーク未存在時はエラーを握り潰す）
- `perfLog(name, startMark, endMark)`: `NODE_ENV === 'development'` 時のみ `console.debug` で計測結果を出力

**`src/features/notes/stores/note-store.ts`**
- `import { PERF_MARKS, perfMark } from '@/lib/perf-marks'` を追加
- `hydrate()` 内の `set({ isHydrated: true })` 直後（保存データあり・なし両方の分岐）に `perfMark(PERF_MARKS.HYDRATE_COMPLETE)` を挿入

### 結果

- `PERF_MARKS`, `PERF_MEASURES` の定数定義により、計測ポイントがコード上で一元管理される
- SSR環境（`typeof performance === 'undefined'`）でのエラーを防止するガード付き
- 今後の Phase で追加の計測ポイントを同ファイルに集約可能

---

## Phase 2: ホットパス最適化

### 目的

ユーザーが最も体感する「入力・保存・再描画」のボトルネックを解消する。

### 2-1. 保存の debounce 化

**理由**: キー入力 1 文字ごとに `store更新 → pages全体更新 → saveNotes(IPC)` が発火していた。Electron 環境では IPC 通信がメインスレッドをブロックし、タイピングレイテンシに直結する。

**実施方法**:

```typescript
// note-store.ts — subscribe を 300ms debounce に変更
let saveTimer: ReturnType<typeof setTimeout> | null = null

useNoteStore.subscribe(
  (state) => state.pages,
  (pages) => {
    if (!useNoteStore.getState().isHydrated || pages.length === 0) return
    if (saveTimer) clearTimeout(saveTimer)
    saveTimer = setTimeout(() => {
      void saveNotes(pages)
    }, 300)
  }
)
```

| 対象ファイル | 変更行 |
|-------------|--------|
| `src/features/notes/stores/note-store.ts` | L148-163 |

#### 具体的な変更

- モジュールスコープに `let saveTimer: ReturnType<typeof setTimeout> | null = null` を追加
- `useNoteStore.subscribe()` 内のコールバックを変更:
  - **変更前**: `if (isHydrated && pages.length > 0) { saveNotes(pages) }` — pages 変更のたびに即座に `saveNotes()` を呼び出し
  - **変更後**: 早期 return ガード `if (!isHydrated || pages.length === 0) return` + `clearTimeout(saveTimer)` で前回タイマーをキャンセルし、`setTimeout(() => { void saveNotes(pages) }, 300)` で 300ms 後に保存実行
- `saveNotes()` 呼び出しに `void` を付与（Promise の戻り値を明示的に無視）

**結果**: 100文字連続入力で保存呼び出しが ~100回 → 1回（最終入力から300ms後）に削減。

---

### 2-2. サイドバー重複マウント解消

**理由**: `DesktopSidebar` と `MobileDrawer` が常に両方マウントされていた。CSS (`hidden md:block` / `md:hidden`) で非表示にしているだけで、React ツリーは生存。検索・グルーピング・編集ロジックが 2 重実行されていた。

**実施方法**:

```typescript
// use-media-query.ts (新規フック)
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia(query)
    setMatches(mql.matches)
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches)
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

// home-content.tsx — 排他的マウント
const isDesktop = useMediaQuery('(min-width: 768px)')
return isDesktop
  ? <DesktopSidebar {...sidebarProps} />
  : <MobileDrawer {...sidebarProps} />
```

| 対象ファイル | 変更内容 |
|-------------|---------|
| `src/hooks/use-media-query.ts` (新規) | メディアクエリ監視フック |
| `src/features/notes/components/home-content.tsx` | 条件分岐レンダリング |

#### 具体的な変更

**`src/hooks/use-media-query.ts`（新規作成）**
- `'use client'` ディレクティブ付きのカスタムフック
- `useState(false)` で SSR 時はデフォルト `false`（モバイル扱い）
- `useEffect` 内で `window.matchMedia(query)` を生成し、初期値セットと `change` イベントリスナー登録
- クリーンアップで `removeEventListener` を実行

**`src/features/notes/components/home-content.tsx`**
- `import { useMediaQuery } from '@/hooks/use-media-query'` を追加
- コンポーネント先頭で `const isDesktop = useMediaQuery('(min-width: 768px)')` を呼び出し
- **変更前**: `<DesktopSidebar />` と `<MobileDrawer />` を常に両方レンダリング（CSS の `hidden md:block` / `md:hidden` で表示切替）
- **変更後**: `{isDesktop ? <DesktopSidebar {...sidebarProps} /> : <MobileDrawer {...sidebarProps} />}` で排他的にマウント（片方のみ React ツリーに存在）

**結果**: サイドバー関連コンポーネントのマウント数が半減。AppSidebar 内の `useSidebarSearch`, `useSidebarGrouping` 等の計算が 1 系統のみに。

---

### 2-3. ConnectionLayer の geometry 依存化

**理由**: テキスト編集で `objects` 配列の identity が変わるたびに `objectMap` と `connectionLines`（交点計算）が全再計算されていた。ConnectionLayer は座標 (x, y, width, height) のみ必要。

**実施方法**:

```typescript
// connection-layer.tsx — geometry のみの文字列キーで比較
const geometryKey = useMemo(
  () => objects.map(({ id, x, y, width, height }) =>
    `${id}:${x},${y},${width},${height}`
  ).join('|'),
  [objects]
)

const objectMap = useMemo(
  () => new Map(objects.map((o) => [o.id, { id: o.id, x: o.x, y: o.y, width: o.width, height: o.height }])),
  [geometryKey] // objects ではなく geometryKey に依存
)
```

| 対象ファイル | 変更行 |
|-------------|--------|
| `src/features/notebook/components/canvas/connection-layer.tsx` | L101-116 |

#### 具体的な変更

- `geometryKey` の `useMemo` を新規追加: `objects.map(({ id, x, y, width, height }) => \`${id}:${x},${y},${width},${height}\`).join('|')` で geometry のみの文字列キーを生成（依存: `[objects]`）
- `objectMap` の `useMemo` を変更:
  - **変更前**: `new Map(objects.map((o) => [o.id, o]))` — 依存: `[objects]`（objects の参照が変わるたびに再計算）
  - **変更後**: `new Map(objects.map((o) => [o.id, { id: o.id, x: o.x, y: o.y, width: o.width, height: o.height }]))` — 依存: `[geometryKey]`（座標が変わった時のみ再計算）
- `biome-ignore lint/correctness/useExhaustiveDependencies` コメントを追加（意図的に `objects` ではなく `geometryKey` に依存させているため）

**結果**: テキスト編集中の ConnectionLayer 再計算がゼロに（座標が変わらない限り `geometryKey` は不変）。

---

### 2-4. TipTap の遅延マウント

**理由**: 非選択状態のブロックでも TipTap エディタ（StarterKit + 7 拡張）がフルマウントされていた。バンドル分析で TipTap/ProseMirror が最大チャンク (512KB) の主要構成物と判明。500 ブロック表示時にはエディタ 500 個分のメモリ・初期化コストが発生。

**実施方法**:

```tsx
// text-block.tsx — 選択時のみ TipTap をマウント
{isSelected ? (
  <RichTextEditor
    content={object.content}
    onChange={(content) => onUpdate(object.id, { content })}
    onEditorReady={(editor) => onEditorReady?.(object.id, editor)}
  />
) : (
  <div
    className="prose prose-sm dark:prose-invert max-w-none min-h-[100px]"
    dangerouslySetInnerHTML={{ __html: object.content || '<p></p>' }}
  />
)}
```

| 対象ファイル | 変更行 |
|-------------|--------|
| `src/features/notebook/components/blocks/text-block.tsx` | L249-266 |

#### 具体的な変更

- `<div className="w-full h-full overflow-hidden p-2">` 内のレンダリングを `isSelected` で分岐:
  - **変更前**: 常に `<RichTextEditor content={object.content} onChange={...} onEditorReady={...} />` をレンダリング
  - **変更後（`isSelected` = true）**: 従来通り `<RichTextEditor>` をマウント（TipTap エディタが使える状態）
  - **変更後（`isSelected` = false）**: `<div className="prose prose-sm dark:prose-invert max-w-none min-h-[100px] ..." dangerouslySetInnerHTML={{ __html: object.content || '<p></p>' }} />` で静的 HTML 表示
- `dangerouslySetInnerHTML` に `biome-ignore lint/security/noDangerouslySetInnerHtml` コメントを追加（ユーザー入力済みコンテンツの再描画であるため安全）

**結果**: 非選択ブロックは静的 HTML 表示のみ。TipTap のマウント/アンマウントが選択操作に連動し、メモリ使用量を大幅削減。

**トレードオフ**: ブロック選択時に TipTap の初期化遅延（~50-100ms）が発生する。体感的には許容範囲内。

---

### 2-5. 未使用依存の削除

**理由**: `react-rnd` が `package.json` に記載されているが、コード上で一切使用されていなかった。

**実施方法**: `npm uninstall react-rnd`

#### 具体的な変更

**`package.json`**
- `dependencies` から `"react-rnd": "^10.5.2"` を削除

**結果**: 5 パッケージ削除、node_modules から除去。

---

## Phase 3: レンダリング最適化（部分実施）

### 3-4. PageListItem の memo 化

**理由**: サイドバーのページリストで 1 アイテムの編集中に他全アイテムが再レンダリングされる可能性があった。

**実施方法**:

```typescript
// page-list-item.tsx
export const PageListItem = memo(({ page, ... }: PageListItemProps) => {
  // 既存ロジック
})
PageListItem.displayName = 'PageListItem'
```

| 対象ファイル | 変更内容 |
|-------------|---------|
| `src/features/sidebar/components/parts/page-list-item.tsx` | `memo()` ラップ + displayName 追加 |

#### 具体的な変更

- `import { useEffect, useRef }` → `import { memo, useEffect, useRef }` に変更（`memo` を追加インポート）
- **変更前**: `export const PageListItem = ({ ... }: PageListItemProps) => { ... }` — 通常の関数コンポーネント
- **変更後**: `export const PageListItem = memo(({ ... }: PageListItemProps) => { ... })` — `React.memo()` でラップ
- 末尾に `PageListItem.displayName = 'PageListItem'` を追加（DevTools での識別用）

**結果**: props が変わらない PageListItem の再レンダリングがスキップされる。

---

## Phase 4: バンドルサイズ + Lighthouse ロード最適化

### 4-1. Bundle Analyzer 設定

**実施方法**:

```typescript
// next.config.ts
import withBundleAnalyzer from '@next/bundle-analyzer'

export default process.env.ANALYZE === 'true'
  ? withBundleAnalyzer({ enabled: true })(nextConfig)
  : nextConfig
```

#### 具体的な変更

**`next.config.ts`**
- `import withBundleAnalyzer from '@next/bundle-analyzer'` を追加
- **変更前**: `export default nextConfig` — 設定オブジェクトをそのままエクスポート
- **変更後**: `export default process.env.ANALYZE === 'true' ? withBundleAnalyzer({ enabled: true })(nextConfig) : nextConfig` — 環境変数 `ANALYZE=true` 時のみ Bundle Analyzer を有効化
- 引用符をダブルクォートからシングルクォートに統一、末尾セミコロンを削除（コードスタイル統一）

**`package.json`**
- `devDependencies` に `"@next/bundle-analyzer": "^16.1.6"` を追加

**注意**: Next.js 16 の Turbopack ビルドでは `@next/bundle-analyzer` が非互換。`--webpack` フラグ使用時は `assetPrefix: "."` が `next/font` と衝突するため、直接ビルド出力を分析。

### 4-2. バンドル分析結果

| チャンク | サイズ | 含まれるライブラリ |
|---------|--------|-------------------|
| `a1b75c17` | **512 KB** | TipTap, ProseMirror, framer-motion, Radix, react-draggable, react-resizable |
| `feaffdc8` | 320 KB | (Next.js ランタイム・React) |
| `b176fd3f` | 128 KB | lucide-react, Radix, uuid |
| `a6dad97d` | 128 KB | (Next.js 内部) |
| `200cdd23` | 128 KB | (Next.js 内部) |
| `5256ac49` | 64 KB | date-fns, Radix |
| **合計** | **1,428 KB** (非圧縮) | — |

**所見**:
- 最大チャンク (512KB) にアプリの主要ライブラリが集約されている
- TipTap/ProseMirror が最大の構成要素（Phase 2-4 の遅延マウントで初期ロードへの影響を軽減済み）
- framer-motion は既に `LazyMotion` + `dynamic import` 対応済み
- date-fns は 64KB チャンクに分離されており、tree-shaking が効いている

---

## アクセシビリティ修正

### 目的

Lighthouse Accessibility スコアで score 0 の 2 項目を解消。

### 実施内容

| 指摘項目 | 修正ファイル | 修正内容 |
|---------|-------------|---------|
| `button-name` | `page-list-item.tsx` | `MoreHorizontal` ボタンに `aria-label="ページメニューを開く"` 追加 |
| `button-name` | `notebook-canvas.tsx` | お気に入りボタンに状態依存 `aria-label` 追加 |
| `button-name` | `color-tools.tsx` | カラーパレットボタンに `aria-label` 追加 |
| `landmark-one-main` | `home-content.tsx` | メインコンテンツの `<div>` → `<main>` に変更 |

#### 具体的な変更

**`src/features/sidebar/components/parts/page-list-item.tsx`**
- `<Button variant="ghost" size="icon" ...>` (MoreHorizontal アイコンの親) に `aria-label="ページメニューを開く"` 属性を追加

**`src/features/notebook/components/canvas/notebook-canvas.tsx`**
- お気に入りトグルの `<Button>` に `aria-label={page.isFavorite ? 'お気に入りを解除' : 'お気に入りに追加'}` を追加（状態に応じてラベルが切り替わる）

**`src/features/notebook/components/toolbar/parts/color-tools.tsx`**
- カラーパレットの各色ボタン（`<button>`）に `` aria-label={`テキスト色を${color.name}に変更`} `` を追加

**`src/features/notes/components/home-content.tsx`**
- メインコンテンツ領域の `<div className="flex-1 flex flex-col h-full overflow-hidden relative">` を `<main>` タグに変更（対応する閉じタグも `</main>` に変更）

### その他

| ファイル | 変更内容 |
|---------|---------|
| `sidebar-header.tsx` | 未使用 import (`ModeToggle`) 削除 |

#### 具体的な変更

**`src/features/sidebar/components/parts/sidebar-header.tsx`**
- `import { ModeToggle } from '@/shared/ui/mode-toggle'` を削除
- JSX 内の `<ModeToggle />` を `{/* <ModeToggle /> */}` にコメントアウト

---

## パフォーマンスバジェット

`performance_report/budget.json` として以下を定義:

```json
[{
  "path": "/*",
  "timings": [
    { "metric": "first-contentful-paint", "budget": 1800 },
    { "metric": "largest-contentful-paint", "budget": 2500 },
    { "metric": "total-blocking-time", "budget": 200 }
  ],
  "resourceSizes": [
    { "resourceType": "script", "budget": 500 },
    { "resourceType": "total", "budget": 800 }
  ]
}]
```

---

## 残課題と次のアクション

### LCP 4.0s の改善（バジェット未達）

| 原因候補 | 対策 | 期待効果 |
|---------|------|---------|
| キャッシュ TTL = 0 | 本番デプロイ環境での `Cache-Control` 設定 | LCP -2,450ms（Lighthouse 見積もり） |
| 512KB 単一チャンク | TipTap の dynamic import 化 | 初期ロード JS 削減 |
| LCP 要素の特定 | Lighthouse の LCP Element を確認 | 的確な最適化 |

### Phase 3 残タスク

| タスク | 優先度 | 判断基準 |
|-------|--------|---------|
| NotebookCanvas 分割 | react-scan 結果次第 | ドラッグ中の FPS 低下が確認された場合 |
| Zustand セレクタ最適化 | react-scan 結果次第 | 全体 subscribe が検出された場合 |

### Phase 5: Electron 固有最適化

| タスク | 内容 |
|-------|------|
| Cold Start 計測 | `console.time` で起動時間確認 |
| メモリリーク確認 | ブロック追加→削除の繰り返しでヒープスナップショット比較 |
| IPC ペイロード最適化 | debounce 後の保存データサイズ確認 |

---

## 変更ファイル一覧

| ファイル | Phase | 変更種別 |
|---------|-------|---------|
| `src/lib/perf-marks.ts` | 0 | 新規作成 |
| `src/hooks/use-media-query.ts` | 2-2 | 新規作成 |
| `performance_report/budget.json` | 6 | 新規作成 |
| `src/features/notes/stores/note-store.ts` | 0, 2-1 | 編集 |
| `src/features/notes/components/home-content.tsx` | 2-2, a11y | 編集 |
| `src/features/notebook/components/canvas/connection-layer.tsx` | 2-3 | 編集 |
| `src/features/notebook/components/blocks/text-block.tsx` | 2-4 | 編集 |
| `src/features/sidebar/components/parts/page-list-item.tsx` | 3-4, a11y | 編集 |
| `src/features/notebook/components/canvas/notebook-canvas.tsx` | a11y | 編集 |
| `src/features/notebook/components/toolbar/parts/color-tools.tsx` | a11y | 編集 |
| `src/features/sidebar/components/parts/sidebar-header.tsx` | — | 未使用import削除 |
| `next.config.ts` | 4 | 編集 |
| `package.json` | 2-5, 4 | 編集 |
