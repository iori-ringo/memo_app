# Magic Memo パフォーマンス最適化 統合レポート

> **実施日**: 2026-03-14 〜 2026-03-15
> **対象アプリ**: Magic Memo (Next.js 16 + Electron 39)
> **計測ツール**: React Profiler / Lighthouse / ReactScan

---

## エグゼクティブサマリー

3つの計測ツールを用いて体系的にパフォーマンス改善を実施。**レンダリング効率58%改善、Lighthouseスコア20pt向上、転送サイズ67%削減**を達成した。

| 領域 | 主要改善指標 | Before | After | 改善率 |
|------|------------|--------|-------|--------|
| React Profiler | 最大コミット時間 | 38.7ms | **16.2ms** | **-58%** |
| Lighthouse | Performance スコア | 67 | **87** | **+20pt** |
| ReactScan | メモ化候補数 | 82 | **76** | **-7%** |
| Lighthouse | 総転送サイズ | 1,315 KiB | **429 KiB** | **-67%** |

---

## 1. ReactScan によるパフォーマンス分析

### 1.1 初期計測結果（メモ化前）

ReactScan による自動プロファイリングで、深刻なレンダリング非効率を検出。

| 項目 | 値 |
|------|-----|
| スコア | **46/100 (F)** |
| 検出コンポーネント数 | 91 |
| 総レンダー回数 | 2,240 |
| 不要レンダー回数 | **1,672 (74.6%)** |
| レンダー密度 | 39.8 renders/sec |
| メモ化候補 | **82 コンポーネント** |

### 1.2 問題コンポーネント Top 10（メモ化前）

| # | コンポーネント | 総レンダー | 不要レンダー | 不要率 | 平均時間(ms) | 総消費時間(ms) |
|---|--------------|----------:|------------:|------:|------------:|-------------:|
| 1 | `SegmentViewNode` | 110 | 42 | 38.2% | 1.18 | 130.0 |
| 2 | `PageGroup` | 100 | 40 | 40.0% | 0.12 | 12.5 |
| 3 | `MenuProvider` | 90 | 66 | 73.3% | 0.50 | 44.7 |
| 4 | `ErrorBoundary` | 44 | 42 | 95.5% | 2.99 | 131.5 |
| 5 | `Presence` | 47 | 38 | 80.9% | 0.00 | 0.1 |
| 6 | `Menu` | 45 | 33 | 73.3% | 0.60 | 26.8 |
| 7 | `Popper` | 45 | 33 | 73.3% | 0.57 | 25.6 |
| 8 | `DropdownMenu` | 31 | 26 | 83.9% | 0.51 | 15.9 |
| 9 | `ContextMenu` | 28 | 24 | 85.7% | 0.67 | 18.8 |
| 10 | `DropdownMenuProvider` | 31 | 26 | 83.9% | 0.58 | 17.9 |

### 1.3 メモ化適用後の変化

| 項目 | Before | After | 変化 |
|------|--------|-------|------|
| 検出コンポーネント数 | 91 | **85** | -6 |
| メモ化候補 | 82 | **76** | -6 |
| 総コミット回数 | 25 | **42** | +17（計測操作の差異） |

メモ化適用後、以前は個別名で検出されていたツールバー系コンポーネント（`TextAlignTools`, `ColorTools`, `ListTools`, `CanvasModeTools`, `DeleteButton`）が ReactScan のレンダーログから**消失**。`React.memo` により親の再レンダーが伝播しなくなったことを示す。

---

## 2. React Profiler によるレンダリング効率改善

### 2.1 計測条件

| 項目 | 値 |
|------|-----|
| 計測ツール | React DevTools Profiler (Ranked View) |
| 対象操作 | テキストブロックの作成・リサイズ・ドラッグ |
| 60fps目標フレーム時間 | 16.67ms |

### 2.2 改善結果サマリー

| 指標 | Before | After | 改善率 |
|------|--------|-------|--------|
| 最大コミット時間 | 38.7ms | **16.2ms** | **-58%** |
| 初回コミット時間 | 38.7ms | **7.8ms** | **-80%** |
| 16.67ms超過回数 | 10/12 (83%) | **1/7 (14%)** | |
| コミット時間レンジ | 15.5–38.7ms | **5.8–16.2ms** | |

### 2.3 コミット時間タイムライン比較

#### Before（12回中10回が60fps超過）

| タイムスタンプ | コミット時間 | 超過倍率 |
|:---:|---:|:---:|
| 1.7s | 38.7ms | 2.3倍 |
| 4.9s | 27.0ms | 1.6倍 |
| 6.3s | 19.2ms | 1.2倍 |
| 7.4s | 15.5ms | - |
| 9.8s | 25.2ms | 1.5倍 |
| 10.7s | 17.6ms | 1.1倍 |
| 12.6s | 21.5ms | 1.3倍 |
| 12.8s | 31.8ms | 1.9倍 |
| 16.5s | 26.0ms | 1.6倍 |
| 17.3s | 26.3ms | 1.6倍 |
| 20.9s | 25.8ms | 1.5倍 |

#### After（7回中6回が60fps以内）

| タイムスタンプ | コミット時間 | 超過 |
|:---:|---:|:---:|
| 2.7s | **7.8ms** | No |
| 4.7s | **16.2ms** | 境界 |
| 6.1s | **7.0ms** | No |
| 8.1s | **6.8ms** | No |
| 9.7s | **9.1ms** | No |
| 10.6s | **5.9ms** | No |
| 11.4s | **5.8ms** | No |

### 2.4 コンポーネント別レンダリング時間の変化

| # | コンポーネント | Before | After | 変化 |
|---|--------------|-------:|------:|-----:|
| 1 | NotebookCanvas | 1.6ms | **0.7ms** | **-56%** |
| 2 | AppSidebar | 1.6ms | **0.6ms** | **-63%** |
| 3 | HomeContent | 1.6ms | **0.5ms** | **-69%** |
| 4 | SidebarHeader | 0.7ms | **0.2ms** | **-71%** |
| 5 | DesktopSidebar | 0.4ms | **<0.1ms** | **-95%** |
| 6 | CanvasBackground | 0.6ms | **0.3ms** | -50% |
| 7 | ConnectionLayer (Memo) | 0.3ms | **0.2ms** | -33% |
| 8 | TextBlock (Memo) | 0.9ms | **0.8ms** | -11% |
| 9 | Draggable | 0.3ms | **0.1ms** | -67% |

### 2.5 完全に排除された不要レンダリング

以下のコンポーネントは改善後のProfilerランキングに**一切表示されなくなった**（排除合計: 約9.5ms/コミット）。

| コンポーネント | Before時間 | 排除の仕組み |
|--------------|----------:|-------------|
| **PageListItem (Memo)** | 1.8ms | `pagesMetaEqual` + 構造的共有でmemoが正常機能 |
| **RibbonToolbar** | 1.0ms | `React.memo` ラップ + props安定化 |
| **TextFormattingTools** | 1.5ms | 親RibbonToolbarのmemoで伝播遮断 |
| **TextAlignTools** | 0.4ms | 同上 |
| **ListTools** | 0.4ms | 同上 |
| **ColorTools** | 0.3ms | 同上 |
| **CanvasModeTools** | 0.2ms | 同上 |
| **DeleteButton** | 0.2ms | 同上 |
| **ContextMenuTrigger** | 0.4ms | サイドバー分離 + PageListItem memo |
| **Bold/Italic/Strikethrough等** | 各0.1ms×多数 | RibbonToolbar memo |

### 2.6 実施した改善内容と効果

#### Step 1: ストアセレクタの粒度細分化（推定-4.8ms → 実測: サイドバー完全排除）

**問題**: `useNotes()` が `pages` 配列全体を購読 → オブジェクト座標変更でもサイドバーが再レンダリング

**対策**:
- `note-store.ts` に `selectActivePage`（キャンバス専用）、`selectPagesMeta`（サイドバー専用）セレクタを追加
- `use-sidebar-notes.ts` を新規作成（サイドバー専用フック）
- `pagesMetaEqual` カスタム等価比較で `objects`/`connections` の変更を無視

#### Step 2: ツールバーのMemo化（推定-4.5ms → 実測: ツールバー完全排除）

**問題**: `RibbonToolbar` に `React.memo` 未適用 → 親再レンダリングが全ボタンに伝播

**対策**:
- `ribbon-toolbar.tsx` を `React.memo` でラップ
- `notebook-canvas.tsx` で `hasSelection` を `useMemo` で安定化
- 他のprops（`onDelete`, `onToggleConnectMode`）は既に `useCallback` 済みで安定

#### Step 3: コールバック参照の安定化（推定-0.5ms+ → 実測: memo正常機能化）

**問題**: `ConnectionLayer (Memo)` と `PageListItem (Memo)` がprops参照不安定でmemoバイパス

**対策**:
- `use-canvas-operations.ts` を `useRef` + `useLatest` パターンで安定化
- `use-canvas-selection.ts` を同パターンで安定化
- `notebook-canvas.tsx` の `onBlockClick`, `handleDeleteSelection` をrefパターンで安定化

#### Step 4: HomeContentのコンポーネント分割（推定-1.6ms → 実測: -69%）

**問題**: `HomeContent` がサイドバーとキャンバスの両方を管理 → 一方の変更が他方に波及

**対策**:
- `SidebarContainer` コンポーネントを新規作成
- サイドバーの型を `NotePage` → `PageMeta` に軽量化（8ファイル変更）
- `HomeContent` をレイアウト + キャンバスのみに簡素化

### 2.7 改善効果: 事前試算 vs 実測

| 対策 | 事前試算 | 実測結果 |
|------|---------|---------|
| セレクタ粒度細分化 + コンポーネント分割 | -6.4ms | サイドバー**完全排除** |
| RibbonToolbar の Memo 化 | -4.5ms | ツールバー全体**完全排除** |
| コールバック ref パターン | -0.5ms+ | ConnectionLayer 0.3→0.2ms |
| **合計** | **-11.4ms** | **-22.5ms（最大コミット: 38.7→16.2ms）** |

> 実測の削減量（-22.5ms）が事前試算（-11.4ms）を**2倍近く上回った**。各最適化の複合効果により、コンポーネントツリー全体のレンダリングコストが連鎖的に減少したため。

---

## 3. Lighthouse によるUX改善

### 3.1 カテゴリ別スコアの変化

| カテゴリ | NO1 (dev) | NO2 (prod) | 変化 |
|---------|:---------:|:----------:|:----:|
| **Performance** | 67 | **87** | **+20** |
| **Accessibility** | 92 | **92** | 維持 |
| **Best Practices** | 78 | **100** | **+22** |
| **SEO** | 100 | **100** | 維持 |

### 3.2 Core Web Vitals の変化

| 指標 | NO1 | NO2 | 改善量 | 改善率 | バジェット | 達成 |
|------|----:|----:|-------:|------:|----------:|:----:|
| **FCP** | 2.5s | **1.4s** | -1.1s | **-44%** | <1,800ms | 達成 |
| **LCP** | 9.2s | **4.0s** | -5.2s | **-57%** | <2,500ms | 未達 |
| **Speed Index** | 4.5s | **2.6s** | -1.9s | **-42%** | — | — |
| **TTI** | 9.3s | **4.1s** | -5.2s | **-56%** | — | — |
| **TBT** | 188ms | **90ms** | -98ms | **-52%** | <200ms | 達成 |
| **CLS** | 0 | **0** | — | — | 0 | 達成 |

### 3.3 リソースサイズの変化

| 指標 | NO1 | NO2 | 改善量 | 改善率 |
|------|----:|----:|------:|------:|
| **総転送サイズ** | 1,315 KiB | **429 KiB** | -886 KiB | **-67%** |
| **メインスレッド処理** | 1.8s | **1.2s** | -0.6s | **-33%** |
| **スクリプト合計** | — | **352 KiB** | — | バジェット達成 |

### 3.4 実施した改善内容

#### 3.4.1 ホットパス最適化

| # | 対策 | 効果 |
|---|------|------|
| 1 | **保存のdebounce化** (300ms) | 100文字連続入力で保存呼び出し ~100回 → **1回** |
| 2 | **サイドバー重複マウント解消** (`useMediaQuery`) | サイドバー関連コンポーネントのマウント数**半減** |
| 3 | **ConnectionLayer geometry依存化** | テキスト編集中の交点再計算を**ゼロ**に |
| 4 | **TipTap遅延マウント** | 非選択ブロックのエディタマウント**排除** |
| 5 | **未使用依存削除** (`react-rnd`) | 5パッケージ削除 |

#### 3.4.2 バンドル最適化

| # | 対策 | 内容 |
|---|------|------|
| 1 | `@next/bundle-analyzer` 導入 | バンドル構成の可視化・継続監視 |
| 2 | 本番ビルド適用 | JS未圧縮 → 圧縮済み |
| 3 | Tree-shaking確認 | date-fns個別import → 64KBチャンクに分離成功 |

#### 3.4.3 アクセシビリティ修正

| 指摘項目 | 修正内容 |
|---------|---------|
| `button-name` | ページメニュー・お気に入り・カラーパレットボタンに `aria-label` 追加 |
| `landmark-one-main` | メインコンテンツの `<div>` → `<main>` タグに変更 |

#### 3.4.4 パフォーマンスバジェット設定

`performance_report/budget.json` として定量的な品質基準を定義:

| 指標 | バジェット値 |
|------|----------:|
| FCP | < 1,800ms |
| LCP | < 2,500ms |
| TBT | < 200ms |
| スクリプト合計 | < 500 KiB |
| リソース合計 | < 800 KiB |

---

## 4. 変更ファイル一覧

### 新規作成ファイル

| ファイル | 目的 |
|---------|------|
| `src/lib/perf-marks.ts` | パフォーマンス計測ユーティリティ（SSR安全） |
| `src/hooks/use-media-query.ts` | メディアクエリ監視フック |
| `src/features/notes/hooks/use-sidebar-notes.ts` | サイドバー専用フック（PageMeta購読） |
| `src/features/sidebar/components/sidebar-container.tsx` | サイドバー独立コンテナ |
| `performance_report/budget.json` | パフォーマンスバジェット定義 |

### 編集ファイル（21ファイル）

| ファイル | 変更内容 |
|---------|---------|
| `src/features/notes/stores/note-store.ts` | セレクタ追加、hydrate計測マーク、保存debounce |
| `src/features/notes/components/home-content.tsx` | コンポーネント分割、排他的マウント、`<main>`タグ |
| `src/features/notebook/components/canvas/notebook-canvas.tsx` | props安定化、refパターン、aria-label |
| `src/features/notebook/components/canvas/connection-layer.tsx` | geometry依存化 |
| `src/features/notebook/components/canvas/canvas-background.tsx` | memo化 |
| `src/features/notebook/components/blocks/text-block.tsx` | TipTap遅延マウント |
| `src/features/notebook/components/toolbar/ribbon-toolbar.tsx` | React.memoラップ |
| `src/features/notebook/components/toolbar/parts/canvas-mode-tools.tsx` | memo化 |
| `src/features/notebook/components/toolbar/parts/color-tools.tsx` | memo化、aria-label |
| `src/features/notebook/components/toolbar/parts/delete-button.tsx` | memo化 |
| `src/features/notebook/components/toolbar/parts/list-tools.tsx` | memo化 |
| `src/features/notebook/components/toolbar/parts/text-align-tools.tsx` | memo化 |
| `src/features/notebook/components/toolbar/parts/text-formatting-tools.tsx` | memo化 |
| `src/features/notebook/hooks/use-canvas-operations.ts` | refパターンで安定化 |
| `src/features/notebook/hooks/use-canvas-selection.ts` | refパターンで安定化 |
| `src/features/sidebar/components/app-sidebar.tsx` | PageMeta型対応 |
| `src/features/sidebar/components/desktop-sidebar.tsx` | PageMeta型対応 |
| `src/features/sidebar/components/mobile-drawer.tsx` | PageMeta型対応 |
| `src/features/sidebar/components/parts/page-list-item.tsx` | memo化、aria-label、PageMeta型 |
| `src/features/sidebar/components/parts/sidebar-header.tsx` | 未使用import削除 |
| `src/features/sidebar/components/parts/trash-section.tsx` | PageMeta型対応 |
| `src/features/sidebar/components/parts/page-item-menu.tsx` | PageMeta型対応 |
| `src/features/sidebar/hooks/use-sidebar-editing.ts` | PageMeta型対応 |
| `src/features/sidebar/hooks/use-sidebar-grouping.ts` | PageMeta型対応 |
| `src/features/sidebar/hooks/use-sidebar-search.ts` | PageMeta型対応 |
| `next.config.ts` | bundle-analyzer設定追加 |
| `package.json` | bundle-analyzer追加、react-rnd削除 |

---

## 5. 残課題

| 課題 | 現状 | 対策案 | 優先度 |
|------|------|--------|:------:|
| LCP 4.0s（バジェット2.5s未達） | キャッシュTTL=0、TipTapチャンク512KB | 本番デプロイでCache-Control設定、TipTap dynamic import | 高 |
| ReactScanスコア46/100 | Next.js内部コンポーネント（ErrorBoundary等）の不要レンダーが支配的 | アプリ側では制御不可、React Compiler検討 | 低 |
| 総コミット数324回 | ドラッグ中のローカルstate更新がフレーム単位で発火 | requestAnimationFrameスロットル | 低 |
| Electron固有最適化 | 未実施 | Cold Start計測、メモリリーク確認、IPCペイロード最適化 | 中 |

---

## 6. 改善の全体像

```
                    Before                              After
                    ──────                              ─────

  ReactScan         46/100 (F)                          46/100 (F)*
  不要レンダー率      74.6%                               ツールバー系完全排除
  メモ化候補          82件                                76件 (-7%)

  React Profiler
  最大コミット時間    38.7ms ████████████████████         16.2ms ████████  (-58%)
  初回コミット時間    38.7ms ████████████████████         7.8ms ████      (-80%)
  60fps超過率        83% (10/12)                         14% (1/7)
  排除された時間      —                                   9.5ms/コミット

  Lighthouse
  Performance        67 ██████▋                          87 ████████▋    (+20pt)
  Best Practices     78 ███████▊                         100 ██████████  (+22pt)
  FCP                2.5s ██████████                     1.4s █████▌     (-44%)
  LCP                9.2s ██████████                     4.0s ████▎      (-57%)
  TTI                9.3s ██████████                     4.1s ████▍      (-56%)
  TBT                188ms ██████████                    90ms █████      (-52%)
  転送サイズ          1,315 KiB ██████████               429 KiB ███▎    (-67%)

  * ReactScanスコアはNext.js内部コンポーネントの不要レンダーが支配的なため変化なし
    アプリ独自コンポーネントの改善はReact Profilerの結果に反映
```

---

*このレポートは React Profiler、Lighthouse、ReactScan の計測データを統合して作成されました。*
