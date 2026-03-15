# NO3: React Profiler レンダリング効率レポート

## 計測概要

| 項目 | 値 |
|------|-----|
| 計測日 | 2026-03-14 |
| 計測ツール | React DevTools Profiler (Ranked View) |
| 対象操作 | テキストブロックの作成・リサイズ・ドラッグ |
| 総コミット数 | 324 |
| 最大コミット時間 | 38.7ms |
| 記録されたレンダリング回数 | 12回（15.5ms〜38.7ms） |
| 60fps目標フレーム時間 | 16.67ms |

---

## コンポーネント別レンダリング時間

### Ranked View（コミット#1 / 全324コミット）

| # | コンポーネント | 時間 | Memo適用 | 必要性 |
|---|-------------|------|---------|-------|
| 1 | PageListItem (Memo) | 1.8ms | Yes | **不要** |
| 2 | AppSidebar | 1.6ms | No | **不要** |
| 3 | NotebookCanvas | 1.6ms | No | 妥当 |
| 4 | HomeContent | 1.6ms | No | **不要** |
| 5 | TextFormattingTools | 1.5ms | No | **不要** |
| 6 | RibbonToolbar | 1.0ms | No | **不要** |
| 7 | Button (ForwardRef) | 0.9ms | No | **不要** |
| 8 | TextBlock (Memo) | 0.9ms | Yes | 妥当 |
| 9 | SidebarHeader | 0.7ms | No | **不要** |
| 10 | Resizable | 0.7ms | No | 妥当 |
| 11 | CanvasBackground | 0.6ms | No | 要検討 |
| 12 | motion.div (ForwardRef) | 0.6ms | No | 要検討 |
| 13 | ContextMenuTrigger (ForwardRef) | 0.4ms | No | **不要** |
| 14 | DesktopSidebar | 0.4ms | No | **不要** |
| 15 | TextAlignTools | 0.4ms | No | **不要** |
| 16 | ListTools | 0.4ms | No | **不要** |
| 17 | ColorTools | 0.3ms | No | **不要** |
| 18 | Draggable | 0.3ms | No | 妥当 |
| 19 | ConnectionLayer (Memo) | 0.3ms | Yes | **不要** |
| 20 | AnimatePresence | 0.3ms | No | 要検討 |
| 21 | CanvasModeTools | 0.2ms | No | **不要** |
| 22 | DeleteButton | 0.2ms | No | **不要** |
| 23 | Bold/Italic/Strikethrough 等 | 各0.1ms | No | **不要** |
| 24 | DraggableCore | 0.1ms | No | 妥当 |
| 25 | ResizeHandle | 0.1ms | No | 妥当 |

### レンダリングタイムライン（"Rendered at:" パネル）

| タイムスタンプ | コミット時間 | 16.67ms超過 |
|-------------|-----------|------------|
| 1.7s | 38.7ms | Yes（2.3倍） |
| 4.9s | 27.0ms | Yes（1.6倍） |
| 6.3s | 19.2ms | Yes（1.2倍） |
| 7.4s | 15.5ms | No |
| 9.8s | 25.2ms | Yes（1.5倍） |
| 10.7s | 17.6ms | Yes（1.1倍） |
| 12.6s | 21.5ms | Yes（1.3倍） |
| 12.8s | 31.8ms | Yes（1.9倍） |
| 16.5s | 26.0ms | Yes（1.6倍） |
| 17.3s | 26.3ms | Yes（1.6倍） |
| 20.9s | 25.8ms | Yes（1.5倍） |

**12回中10回が16.67ms（60fps）を超過** — インタラクション中にジャンクが発生している。

---

## 不要レンダリングの分析

### 問題1: サイドバー全体の再レンダリング（重大度: 高）

**影響コンポーネント:**
- `AppSidebar` (1.6ms)
- `PageListItem (Memo)` (1.8ms)
- `SidebarHeader` (0.7ms)
- `DesktopSidebar` (0.4ms)
- `PageGroup` (0.3ms)

**合計無駄時間:** 約4.8ms / コミット

**原因:**
テキストブロックのドラッグ/リサイズ完了時に `updatePage()` が呼ばれ、Zustand ストアの `pages` 配列が新しい参照に置き換わる。`useNotes()` フックが `pages` 全体を購読しているため、`HomeContent` が再レンダリングされ、`sidebarProps` が再生成 → サイドバー全体に伝播する。

```
updatePage(id, { objects: [...] })
  → pages 配列の参照変更
    → useNotes() の pages セレクタがトリガー
      → HomeContent 再レンダリング
        → sidebarProps 再計算（pages が依存配列に含まれる）
          → DesktopSidebar → AppSidebar → SidebarHeader → PageListItem
```

**`PageListItem` が `Memo` なのに再レンダリングされる理由:**
`sidebarProps` 内の `pages` 配列が新参照になるため、Memo の浅い比較で差分ありと判定される。ページ内の `objects` が変更されただけでも `pages.map(...)` で全ページオブジェクトが新規作成される。

---

### 問題2: ツールバー全体の再レンダリング（重大度: 高）

**影響コンポーネント:**
- `TextFormattingTools` (1.5ms)
- `RibbonToolbar` (1.0ms)
- `TextAlignTools` (0.4ms)
- `ListTools` (0.4ms)
- `ColorTools` (0.3ms)
- `CanvasModeTools` (0.2ms)
- `Bold`, `Italic`, `Strikethrough` 等各ボタン (各0.1ms × 多数)

**合計無駄時間:** 約4.5ms / コミット

**原因:**
`NotebookCanvas` が `page` オブジェクト全体を prop で受け取っており、`page` 内の `objects` 配列が変更されると `page` 自体の参照が変わる。`RibbonToolbar` は `React.memo` でラップされていないため、親の再レンダリングがそのまま伝播する。

```
NotebookCanvas({ page, onUpdate })  ← page が新参照
  → RibbonToolbar (memo なし) → 再レンダリング
    → TextFormattingTools → Bold, Italic, Strikethrough...
    → TextAlignTools → TextAlignStart, TextAlignCenter, TextAlignEnd
    → ListTools → List, ListOrdered
    → ColorTools
```

**ドラッグ/リサイズ時にツールバーの状態は一切変わらないため、すべて不要なレンダリング。**

---

### 問題3: Memo が無効化されているコンポーネント（重大度: 中）

| コンポーネント | 問題の原因 |
|-------------|---------|
| `PageListItem (Memo)` | `pages` 配列の新参照により親 prop が変化 |
| `ConnectionLayer (Memo)` | `objects` prop が毎回新しい配列参照 |
| `TextBlock (Memo)` | `onUpdate`, `onSelect` コールバックの参照不安定性 |

**Memo のバイパス条件:**
React.memo は浅い比較（shallow equality）を行うため、以下の場合にバイパスされる：
1. prop に新しいオブジェクト/配列の参照が渡される
2. prop にインラインで生成されたコールバック関数が渡される
3. 親コンポーネントのレンダリング時に prop の値が `useCallback` / `useMemo` で安定化されていない

---

### 問題4: 324コミットの異常な多さ（重大度: 中）

テキストブロック操作で324回のレンダリングコミットは過剰。

**内訳推定:**
- ドラッグ中: `handleDrag` → `setCurrentPos` でローカル state のみ更新（フレーム単位で発火）
- リサイズ中: `handleResize` → `setCurrentSize` + `setCurrentPos` でローカル state のみ更新
- 停止時: `handleDragStop` / `handleResizeStop` → `onUpdate()` でストア更新 → 全体カスケード

ドラッグ/リサイズ中のローカル state 更新自体は TextBlock 内に閉じているため比較的軽量だが、毎フレーム発火するため総コミット数が膨れ上がっている。

---

## 状態伝播フロー図

```
┌─────────────────────────────────────────────────────────────────────┐
│                    TextBlock drag/resize stop                       │
│                              │                                      │
│                    onUpdate(object.id, {x, y})                      │
│                              │                                      │
│              handleUpdateObject (notebook-canvas.tsx)                │
│                              │                                      │
│               onUpdate(page.id, { objects: [...] })                 │
│                              │                                      │
│             useNoteStore.updatePage() ← pages 配列が新参照に         │
└──────────────────────────────┼──────────────────────────────────────┘
                               │
              ┌────────────────┴────────────────┐
              │                                 │
    ┌─────────▼──────────┐           ┌──────────▼──────────┐
    │   useNotes().pages  │           │  pages subscribe    │
    │   セレクタ発火       │           │  (自動保存 debounce) │
    └─────────┬──────────┘           └─────────────────────┘
              │
    ┌─────────▼──────────┐
    │    HomeContent      │ ← 再レンダリング (1.6ms)
    │    再レンダリング     │
    └──┬──────────────┬───┘
       │              │
┌──────▼────┐  ┌──────▼──────────────┐
│ Sidebar   │  │ NotebookCanvas      │ ← 再レンダリング (1.6ms)
│ 系全体    │  │ 再レンダリング        │
│ (4.8ms)   │  └──┬───────┬──────┬───┘
│ ❌ 不要   │     │       │      │
└───────────┘     │       │      │
          ┌───────▼──┐ ┌──▼───┐ ┌▼────────────┐
          │ Toolbar  │ │ Text │ │ Connection  │
          │ 系全体   │ │Block │ │ Layer       │
          │ (4.5ms)  │ │(妥当)│ │ (0.3ms)     │
          │ ❌ 不要  │ └──────┘ │ ❌ Memo無効  │
          └──────────┘          └─────────────┘
```

---

## 改善提案

### 優先度: 高

#### 提案1: ストアセレクタの粒度を細分化

**現状:**
```typescript
// useNotes.ts - pages 全体を購読
const pages = useNoteStore((s) => s.pages)
```

**改善案:**
```typescript
// サイドバー用: ページのメタデータのみ購読（objects/connections を除外）
const pagesMeta = useNoteStore((s) =>
  s.pages.map(({ id, title, tags, createdAt, updatedAt, deletedAt, isFavorite }) =>
    ({ id, title, tags, createdAt, updatedAt, deletedAt, isFavorite })
  )
)

// キャンバス用: アクティブページのみ購読
const activePage = useNoteStore((s) => {
  const id = s.activePageId
  return id ? s.pages.find((p) => p.id === id && !p.deletedAt) : undefined
})
```

**効果:** サイドバーがオブジェクト変更で再レンダリングされなくなる（約4.8ms削減）

---

#### 提案2: RibbonToolbar を React.memo でラップ

**現状:**
```typescript
// ribbon-toolbar.tsx - memo なし
export const RibbonToolbar = ({ editor, isConnectMode, ... }) => { ... }
```

**改善案:**
```typescript
export const RibbonToolbar = memo(({ editor, isConnectMode, ... }) => { ... })
RibbonToolbar.displayName = 'RibbonToolbar'
```

加えて、`NotebookCanvas` 側で `RibbonToolbar` に渡す props を `useCallback` / `useMemo` で安定化する。

**効果:** ドラッグ/リサイズ時のツールバー再レンダリングを排除（約4.5ms削減）

---

#### 提案3: NotebookCanvas 内の prop 分離

**現状:**
```typescript
<ConnectionLayer
  connections={page.connections}  // ← page 変更で毎回新参照
  objects={page.objects}          // ← page 変更で毎回新参照
  ...
/>
```

**改善案:**
```typescript
const connections = useMemo(() => page.connections, [page.connections])
const objects = useMemo(() => page.objects, [page.objects])

// または、page から必要なデータのみ抽出して渡す
const objectPositions = useMemo(
  () => page.objects.map(({ id, x, y, width, height }) => ({ id, x, y, width, height })),
  [page.objects]
)
```

**効果:** ConnectionLayer の Memo が正しく機能（約0.3ms削減 + 子コンポーネントの再レンダリング防止）

---

### 優先度: 中

#### 提案4: HomeContent のコンポーネント分割

`HomeContent` がサイドバーとキャンバスの両方を管理しているため、どちらかの変更が全体に波及する。

**改善案:**
```typescript
// サイドバーとキャンバスを独立したコンポーネントに分離し、
// それぞれが必要なストアのスライスのみを購読する
const SidebarContainer = () => {
  const pagesMeta = useNoteStore(selectPagesMeta)  // メタデータのみ
  ...
}

const CanvasContainer = () => {
  const activePage = useNoteStore(selectActivePage)  // アクティブページのみ
  ...
}
```

**効果:** サイドバーとキャンバスが完全に独立してレンダリングされる

---

#### 提案5: ドラッグ中のレンダリングスロットル

**現状:** ドラッグ中に毎フレーム `setCurrentPos` が発火

**改善案:**
```typescript
const handleDrag = useCallback((_e: DraggableEvent, data: DraggableData) => {
  // requestAnimationFrame でスロットル
  if (rafRef.current) cancelAnimationFrame(rafRef.current)
  rafRef.current = requestAnimationFrame(() => {
    setCurrentPos({ x: data.x, y: data.y })
  })
}, [])
```

**効果:** ドラッグ中のコミット数を削減し、フレームスキップを防止

---

### 優先度: 低

#### 提案6: CanvasBackground の Memo 化

`CanvasBackground` (0.6ms) は `titleHeight`, `centerPosition`, `diversionPosition` のみに依存。これらが変わらない限り再レンダリング不要。

---

## 改善効果の試算

| 対策 | 削減量（推定） | 累積効果 |
|------|-------------|---------|
| セレクタ粒度の細分化 | -4.8ms | 4.8ms |
| RibbonToolbar の Memo 化 | -4.5ms | 9.3ms |
| NotebookCanvas の prop 分離 | -0.5ms | 9.8ms |
| HomeContent のコンポーネント分割 | -1.6ms | 11.4ms |
| ドラッグスロットル | コミット数50%減 | — |

**現状:** 38.7ms（最大コミット） → **改善後推定:** 約27ms（約30%削減）

さらにコンポーネント分割（提案4）まで実施した場合: **約16ms（60fps目標達成圏内）**

---

## 改善実施後の計測結果（2026-03-14 16:28）

### 実施した改善内容

| # | 対策 | 対象ファイル |
|---|------|-----------|
| 1 | **ストアセレクタの粒度細分化 + コンポーネント分割** | note-store.ts, home-content.tsx, sidebar-container.tsx (新規), use-sidebar-notes.ts (新規) |
| 2 | **RibbonToolbar の React.memo 化** | ribbon-toolbar.tsx, notebook-canvas.tsx |
| 3 | **コールバック参照の安定化（ref パターン）** | use-canvas-operations.ts, use-canvas-selection.ts, notebook-canvas.tsx |
| 4 | **サイドバー型の軽量化（PageMeta）** | desktop-sidebar, mobile-drawer, app-sidebar, page-list-item 他 8ファイル |

### 改善後の計測概要

| 項目 | Before | After | 改善率 |
|------|--------|-------|-------|
| 最大コミット時間 | 38.7ms | **16.2ms** | **-58%** |
| 初回コミット時間 | 38.7ms | **7.8ms** | **-80%** |
| 16.67ms 超過回数 | 10/12 (83%) | **1/7 (14%)** | |
| コミット時間レンジ | 15.5–38.7ms | **5.8–16.2ms** | |
| 総コミット数 | 324 | 324 | 変化なし |

### 改善後のレンダリングタイムライン

| タイムスタンプ | コミット時間 | 16.67ms超過 |
|-------------|-----------|------------|
| 2.7s | **7.8ms** | No |
| 4.7s | **16.2ms** | No（境界付近） |
| 6.1s | **7.0ms** | No |
| 8.1s | **6.8ms** | No |
| 9.7s | **9.1ms** | No |
| 10.6s | **5.9ms** | No |
| 11.4s | **5.8ms** | No |

**7回中6回が16.67ms以下** — ほぼジャンクフリーの状態を達成。

### 改善後のコンポーネント別レンダリング時間

#### Ranked View（コミット#1 / 全324コミット）

| # | コンポーネント | Before | After | 変化 |
|---|-------------|--------|-------|------|
| 1 | TextBlock (Memo) | 0.9ms | **0.8ms** | -0.1ms |
| 2 | NotebookCanvas | 1.6ms | **0.7ms** | **-56%** |
| 3 | AppSidebar | 1.6ms | **0.6ms** | **-63%** |
| 4 | Resizable | 0.7ms | **0.5ms** | -29% |
| 5 | HomeContent | 1.6ms | **0.5ms** | **-69%** |
| 6 | CanvasBackground | 0.6ms | **0.3ms** | -50% |
| 7 | SidebarHeader | 0.7ms | **0.2ms** | **-71%** |
| 8 | PageGroup | 0.3ms | **0.2ms** | -33% |
| 9 | ConnectionLayer (Memo) | 0.3ms | **0.2ms** | -33% |
| 10 | SidebarContainer | — | **0.1ms** | 新規 |
| 11 | DesktopSidebar | 0.4ms | **<0.1ms** | **-95%** |
| 12 | Draggable | 0.3ms | **0.1ms** | -67% |

### 完全に排除された不要レンダリング

以下のコンポーネントは改善後の Profiler ランキングに**一切表示されなくなった**。

| コンポーネント | Before | 排除の仕組み |
|-------------|--------|-----------|
| **PageListItem (Memo)** | 1.8ms | `pagesMetaEqual` + 構造的共有で memo が正しく機能 |
| **RibbonToolbar** | 1.0ms | `React.memo` ラップ + props 安定化 |
| **TextFormattingTools** | 1.5ms | 親の RibbonToolbar が memo で止まる |
| **TextAlignTools** | 0.4ms | 同上 |
| **ListTools** | 0.4ms | 同上 |
| **ColorTools** | 0.3ms | 同上 |
| **CanvasModeTools** | 0.2ms | 同上 |
| **DeleteButton** | 0.2ms | 同上 |
| **ContextMenuTrigger** | 0.4ms | サイドバー分離 + PageListItem memo |
| **Bold/Italic/Strikethrough 等** | 各0.1ms×多数 | RibbonToolbar memo |
| **DropdownMenu/Menu 系全般** | 各0.1–0.3ms×多数 | サイドバー分離 + memo |

**排除された合計レンダリング時間:** 約 **9.5ms / コミット**

### 改善後の状態伝播フロー図

```
┌──────────────────────────────────────────────────────────────────────────┐
│                    TextBlock drag/resize stop                            │
│                              │                                           │
│                    onUpdate(object.id, {x, y})                           │
│                              │                                           │
│           handleUpdateObject (ref パターンで安定化)                        │
│                              │                                           │
│               onUpdate(page.id, { objects: [...] })                      │
│                              │                                           │
│             useNoteStore.updatePage() ← pages 配列が新参照に              │
└──────────────────────────────┼───────────────────────────────────────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
┌─────────▼──────────┐ ┌──────▼──────────┐ ┌───────▼──────────────┐
│ selectActivePage   │ │ selectPagesMeta │ │  pages subscribe     │
│ (キャンバス用)      │ │ (サイドバー用)   │ │  (自動保存 debounce)  │
│ → 変更あり          │ │ → pagesMetaEqual│ │                      │
│                    │ │   で比較 → 等価  │ └──────────────────────┘
└────────┬───────────┘ │ → ❌ 再レンダリング│
         │             │   なし!          │
         │             └─────────────────┘
┌────────▼───────────┐
│  HomeContent       │ ← 再レンダリング (0.5ms, -69%)
│  (キャンバスのみ)    │
└────────┬───────────┘
         │
┌────────▼──────────────┐
│ NotebookCanvas (0.7ms)│
├───────┬──────┬────────┤
│       │      │        │
│ ┌─────▼──┐ ┌▼─────┐ ┌▼────────────┐
│ │Toolbar │ │Text  │ │Connection  │
│ │(memo)  │ │Block │ │Layer(memo) │
│ │❌止まる │ │(0.8ms│ │(0.2ms)     │
│ └────────┘ │ 妥当)│ └────────────┘
│            └──────┘
│
│  SidebarContainer (0.1ms) ← 独立購読、pagesMetaEqual で変化なし
│  └─ ❌ 再レンダリングなし
```

### 改善効果の試算 vs 実測

| 対策 | 事前試算 | 実測結果 |
|------|---------|---------|
| セレクタ粒度細分化 + コンポーネント分割 | -6.4ms | PageListItem, ContextMenu等 **完全排除** |
| RibbonToolbar の Memo 化 | -4.5ms | ツールバー全体 **完全排除** |
| コールバック ref パターン | -0.5ms+ | ConnectionLayer 0.3→0.2ms, TextBlock 0.9→0.8ms |
| **合計** | **-11.4ms** | **最大コミット: 38.7→16.2ms (-22.5ms)** |

実測の削減量（-22.5ms）が事前試算（-11.4ms）を大幅に上回った。
これは各最適化の複合効果により、コンポーネントツリー全体のレンダリングコストが減少したため。

### 残存課題

| 課題 | 詳細 | 優先度 |
|------|------|-------|
| 1回の16.2msコミット | 4.7s 時点で16.2ms。テキストブロック作成時の初回レンダリングと推定 | 低 |
| 総コミット数324回 | ドラッグ中のローカル state 更新は依然としてフレーム単位で発火 | 低 |
| AppSidebar 0.6ms | 初回レンダリング時のみ。操作中は `pagesMetaEqual` で抑止されている | 情報 |

---

## 付録: Profiler スクリーンショットから読み取った全コンポーネント一覧

<details>
<summary>全コンポーネント一覧（クリックで展開）</summary>

### 0.1ms 以下のコンポーネント

AnimatePresence, Book (ForwardRef), Bold (ForwardRef), Button (ForwardRef) ×多数,
CanvasModeTools, ContextMenu, ContextMenuContent, ContextMenuPortal,
ContextMenuProvider, DeleteButton, DraggableCore ×2, DropdownMenu ×2,
DropdownMenuContent (ForwardRef) ×2, DropdownMenuPortal ×2,
DropdownMenuProvider ×2, Ellipsis (ForwardRef), FileText (ForwardRef),
GripVertical (ForwardRef) ×2, Input (ForwardRef), Italic (ForwardRef),
Link2 (ForwardRef), List (ForwardRef), ListOrdered (ForwardRef),
LoadableComponent, MenuAnchor (ForwardRef) ×3, Menu ×3, MenuPortal ×3,
MenuPortalProvider, MenuProvider ×3, MotionPageWrapper,
Plus (ForwardRef), Popper ×2, PopperAnchor (ForwardRef) ×3,
PopperProvider ×3, Presence ×2, Primitive.button (ForwardRef) ×3,
Primitive.button.Slot (ForwardRef) ×2, Primitive.div (ForwardRef) ×多数,
Primitive.div.Slot (ForwardRef) ×2, Primitive.div.SlotClone (ForwardRef),
Primitive.span (ForwardRef), Primitive.span.Slot (ForwardRef),
ResizeHandle, Search (ForwardRef), Separator (ForwardRef) ×多数,
Square (ForwardRef), Star (ForwardRef), Strikethrough (ForwardRef),
TextAlignCenter (ForwardRef), TextAlignEnd (ForwardRef),
TextAlignStart (ForwardRef), Trash2 (ForwardRef)

</details>
