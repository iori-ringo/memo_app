# React レンダリングパフォーマンス最適化 — memo() ラップによる不要レンダー削減

## 概要

React Scan プロファイリングで判明した不要レンダー（74.6%）を、末端コンポーネントへの `React.memo()` 適用で削減する。

## 背景・動機

- React Scan スコア: **46/100 (F)**
- 2,240 レンダー中 **1,672 回 (74.6%) が不要レンダー**
- 主因: `React.memo` 未適用のコンポーネントが親の再レンダーに巻き込まれている
- 既存の最適化（`selectPagesMeta` + `pagesMetaEqual`、`useCallback`、`useLatest` pattern）は適切に機能中
- 末端コンポーネントの memo 化が不足している

## 実装方針

すべて同一パターンで統一:
1. `memo()` で既存コンポーネントをラップ
2. `displayName` を追加（DevTools での識別用）
3. カスタム比較関数は不要（shallow comparison で十分）

## タスク分解

### Phase 1: 高インパクト変更（8ファイル）

- [ ] **1-1. PageGroup の memo 化** ← 最大インパクト
  - ファイル: `src/features/sidebar/components/app-sidebar.tsx`
  - 理由: 100回レンダー/40%不要。5インスタンスが `pageItemProps` 参照変更のたびに全再レンダー

- [ ] **1-2. CanvasModeTools の memo 化**
  - ファイル: `src/features/notebook/components/toolbar/parts/canvas-mode-tools.tsx`
  - 理由: editor 非依存、`isConnectMode` (boolean) + `onToggleConnectMode` (useCallback済み) のみ

- [ ] **1-3. DeleteButton の memo 化**
  - ファイル: `src/features/notebook/components/toolbar/parts/delete-button.tsx`
  - 理由: editor 非依存、`hasSelection` (boolean/useMemo済み) + `onDelete` (useCallback済み) のみ

- [ ] **1-4. TextFormattingTools の memo 化**
  - ファイル: `src/features/notebook/components/toolbar/parts/text-formatting-tools.tsx`
  - 備考: `editor` の参照安定性に依存。editor が同一参照なら効果あり

- [ ] **1-5. TextAlignTools の memo 化**
  - ファイル: `src/features/notebook/components/toolbar/parts/text-align-tools.tsx`

- [ ] **1-6. ColorTools の memo 化**
  - ファイル: `src/features/notebook/components/toolbar/parts/color-tools.tsx`

- [ ] **1-7. ListTools の memo 化**
  - ファイル: `src/features/notebook/components/toolbar/parts/list-tools.tsx`

- [ ] **1-8. CanvasBackground の memo 化**
  - ファイル: `src/features/notebook/components/canvas/canvas-background.tsx`
  - 備考: 内部 state (`isDragging`) があるため props 同一時のみスキップ。`onBoundaryChange` が親で `useCallback` 済みか確認要

### 変更しないもの

| コンポーネント | 理由 |
|---|---|
| `PageListItem` | 既に `memo()` 済み |
| `RibbonToolbar` | 既に `memo()` 済み |
| `ConnectionLayer` | 既に `memo()` 済み |
| `SidebarHeader` | プロファイルデータに未出現、低優先度 |
| Next.js 内部 (`ErrorBoundary` 等) | 変更不可 |
| React Compiler 導入 | 別イニシアティブ |
| Zustand セレクタ変更 | 現状の設計で十分 |

## 検証方法

1. `npm run dev` でアプリ起動
2. `node .claude/skills/react-scan-pef/scripts/profile-devtools.mjs --url "http://...:3000" --duration 30 --interactions ./scenarios.json` で再計測
3. `node .claude/skills/react-scan-pef/scripts/generate-report.mjs` でレポート生成
4. **期待値**: 不要レンダー率 74.6% → 50%以下、スコア 46 → 65+

## 懸念点・検討事項

- `TextFormattingTools` は `editor` prop の参照安定性に依存 — editor が毎レンダーで新規生成される場合は効果なし
- `CanvasBackground` の `onBoundaryChange` が `useCallback` で安定化されているか要確認
- 過度な memo 化は避ける（メモリコスト vs レンダーコストのトレードオフ）

## 関連ドキュメント

- `ai-docs/20260314-パフォーマンス最適化-ReactProfiler-Lighthouse.md`
- `ai-docs/20260314-レンダリング効率改善-不要再レンダリング排除.md`
- `performance_report/` 配下のプロファイリングレポート
