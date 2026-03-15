# パフォーマンス最適化プラン — React Profiler & Lighthouse

## 概要

React Profiler と Lighthouse を活用し、Magic Memo アプリのパフォーマンスを体系的に計測・改善する。Phase 0〜6 の段階的アプローチで、体感改善 → レンダリング最適化 → ロード最適化 → Electron最適化 の順に進める。

## 背景・動機

- 局所的な最適化（`memo`, `useMemo`, `useCallback`, `dynamic import`）は既に施されている
- しかし体系的な計測・改善サイクルは未実施で、定量的な効果検証ができていない
- Codexレビューにより、Lighthouseより先に「入力・保存・再描画のホットパス」を潰すべきと判明
- Electron + `output: "export"` の特性上、Lighthouseが拾える問題と実際の体感劣化がズレる

## 技術スタック

- Next.js 16 (App Router, `output: "export"`)
- Electron 39
- React 19 / TypeScript / Tailwind CSS v4
- TipTap v3 / Zustand / framer-motion

---

## 実装方針

```
Phase 0: 計測基盤の固定化（条件統一）
    ↓
Phase 1: ベースライン計測（Web / Electron 2トラック）
    ↓
Phase 2: ホットパス最適化（最優先の体感改善）
    ↓
Phase 3: React Profiler でレンダリング最適化
    ↓
Phase 4: バンドルサイズ + Lighthouse ロード最適化
    ↓
Phase 5: Electron 固有の最適化
    ↓
Phase 6: 継続的モニタリング体制の構築
```

**原則**: 計測 → 問題特定 → 修正 → 再計測 のサイクルを各Phaseで回す

---

## タスク分解

### Phase 0: 計測基盤の固定化

- [ ] テストデータセット作成（Small: 10ブロック/5接続、Medium: 100/50、Large: 500/200）
- [ ] 操作シナリオ定義（A: ページ切替、B: ブロック操作、C: テキスト編集、D: 接続操作）
- [ ] 端末条件固定（CPU 4x slowdown、1280x800、warm/cold分離）
- [ ] 体感指標バジェット設定:
  - タイピング: 95p commit < 16ms
  - ドラッグ: 55fps以上
  - ページ切替: < 150ms
  - Electron cold start: < 2s
- [ ] 計測マーカー埋め込み（`src/lib/perf-marks.ts` 新規作成）

### Phase 1: ベースライン計測

- [ ] Webトラック: `npm run build && npx serve out` → Lighthouse CLI実行
- [ ] Electronトラック: Chrome Performance/Memory で録画、起動時間計測
- [ ] React Profiler: production相当でシナリオA〜D録画（「Record why each component rendered」有効化）
- [ ] `@next/bundle-analyzer` 導入 → バンドル構成可視化
- [ ] 全結果を `performance_report/` に保存

### Phase 2: ホットパス最適化（最優先）

- [ ] **保存のdebounce化** — `note-store.ts:148-156` の subscribe を 300ms debounce
  - 現状: キー入力1文字 → store更新 → pages全体更新 → saveNotes（IPC）
  - 対象: `note-store.ts`, `text-block.tsx:251`, `rich-text-editor.tsx:69`
- [ ] **サイドバー重複マウント解消** — `home-content.tsx:119,122` で DesktopSidebar/MobileDrawer が常時マウント
  - 対策: `useMediaQuery` で条件分岐し片方のみ描画
- [ ] **ConnectionLayer の geometry のみ依存化** — `connection-layer.tsx:101`
  - 本文編集でも objects 配列 identity が変わり全再計算される問題を解消
- [ ] **TipTap 遅延マウント検討** — `text-block.tsx:251-256`
  - 非選択ブロックは静的HTML表示、選択時のみTipTapマウント
- [ ] **react-rnd 削除** — コード上で未使用の依存
- [ ] 再計測して改善確認

### Phase 3: React Profiler でレンダリング最適化

- [ ] Chrome Performance Panel + React Profiler の併用体制構築
- [ ] NotebookCanvas: 4 hook統合による再レンダリング影響確認 → 子コンポーネント分割検討
- [ ] TextBlock: memo化済みだがprops安定性を確認（ブロックA操作中にB再レンダリングなし）
- [ ] PageListItem: memo化追加検討
- [ ] Zustand セレクタ最適化（全体subscribe vs 個別subscribe）
- [ ] 再計測して体感指標バジェット達成確認

### Phase 4: バンドルサイズ + Lighthouse ロード最適化

- [ ] bundle-analyzer結果から大チャンク特定（TipTap, framer-motion, date-fns, lucide-react, radix-ui）
- [ ] tree-shaking確認（date-fns個別import、lucide-react個別import）
- [ ] フォント最適化（`layout.tsx` — `display: 'swap'` 確認、不要ウェイト除外）
- [ ] CLS確認（サイドバー開閉、テーマ切替）
- [ ] Lighthouse再計測（`npx serve out` で配信。`next start`は`output: "export"`と非互換）

### Phase 5: Electron 固有の最適化

- [ ] Cold Start最適化（`electron/main.ts` — require→import化、遅延ロード）
- [ ] IPC通信効率（`data-handlers.ts` — debounce効果確認、ペイロードサイズ確認）
- [ ] メモリリーク確認（TipTap多数マウント時のヒープスナップショット、イベントリスナー増加確認）
- [ ] Preloadスクリプト最適化（`preload.ts` — API最小化）

### Phase 6: 継続的モニタリング

- [ ] パフォーマンスバジェット設定（`performance_report/budget.json`）
- [ ] 体感指標バジェットの継続監視
- [ ] 全Phase改善率のまとめ

---

## 対象ファイル一覧

| ファイル | Phase | 内容 |
|---------|-------|------|
| `src/features/notes/stores/note-store.ts` | 2, 3 | 保存debounce化、セレクタ最適化 |
| `src/features/notes/components/home-content.tsx` | 2 | サイドバー重複マウント解消 |
| `src/features/notebook/components/canvas/connection-layer.tsx` | 2, 3 | geometry依存化 |
| `src/features/notebook/components/blocks/text-block.tsx` | 2, 3 | TipTap遅延マウント、props安定性 |
| `src/features/notebook/components/blocks/rich-text-editor.tsx` | 2 | onChange頻度確認 |
| `src/features/notebook/components/canvas/notebook-canvas.tsx` | 3 | レンダリング最適化 |
| `src/features/sidebar/components/parts/page-list-item.tsx` | 3 | memo化検討 |
| `src/features/sidebar/components/app-sidebar.tsx` | 3 | 依存値変更頻度確認 |
| `next.config.ts` | 4 | bundle-analyzer設定 |
| `src/app/layout.tsx` | 4 | フォント最適化 |
| `package.json` | 2, 4 | react-rnd削除、bundle-analyzer追加 |
| `electron/main.ts` | 5 | cold start最適化 |
| `electron/handlers/data-handlers.ts` | 5 | IPC効率確認 |
| `electron/preload.ts` | 5 | preload最適化 |
| 新規: `src/lib/perf-marks.ts` | 0 | 計測ユーティリティ |

---

## 懸念点・検討事項

- **TipTap遅延マウントのUX影響**: 選択時の初期化遅延がユーザーに感じられる可能性。Large（500ブロック）でのメモリ削減効果とのトレードオフ
- **useMediaQueryのSSR互換性**: `output: "export"`の静的ビルドでは初回レンダリング時にwindowが存在しない可能性。hydration mismatch対策が必要
- **objectGeometryのメモ化粒度**: `objects.map()`で毎回新配列を作る場合、shallow comparisonでは差分検出できない。カスタムequality関数または構造的共有が必要
- **Lighthouseスコアの限界**: Electronの`file://`ロードはLighthouseで計測できないため、Web/Electronの2トラック体制が必須
- **React Profiler のdevモードオーバーヘッド**: production相当のビルドで計測しないと実態と乖離する

## 参考リンク

- [React Performance Optimization 2025](https://www.growin.com/blog/react-performance-optimization-2025/)
- [Next.js Performance Tuning: Practical Fixes](https://www.qed42.com/insights/next-js-performance-tuning-practical-fixes-for-better-lighthouse-scores)
- [Electron Performance Documentation](https://www.electronjs.org/docs/latest/tutorial/performance)
- [React Developer Tools Profiler](https://zenn.dev/kingdom0927/articles/fef1f7358a476c)
