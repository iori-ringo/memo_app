# Refactoring Plan

## ゴール
- Electron（main/preload）とNext.js（renderer）の責務境界を明確化し、ビルド・配布を安定化する。
- メモ/ノートのドメインモデルを中心に UI とロジックを分離し、テスト可能性と可読性を高める。
- ビルド生成物をリポジトリから排除し、CI で lint/テスト/ビルドが再現可能な状態を作る。

## フェーズと具体タスク

### 1. ガードレール整備（最優先）
- lint/format 設定を有効化し、エラーが出ない状態に固定（`eslint.config.mjs`/`prettier`/`tsconfig` の整合性確認）。
- 型エラーをゼロにする（`tsconfig.json` の `paths`/`jsx`/`moduleResolution` などを現状に合わせて調整）。
- `.gitignore` の再確認（`dist/` 等の生成物除外が効いているかを git status で確認）。
- npm scripts の整理: `dev`/`build:web`/`build:electron`/`lint`/`test` などが動作するかを確認し、README に反映。

### 2. ビルド・配布ラインの整理
- electron-builder 設定（`dist/builder-effective-config.yaml` 等）をリポジトリ外に移すか、最小限の設定ファイルに集約。
- main/preload のビルド出力先を `electron/dist/` に固定し、Next の `.next`/`out` と混ざらないようにする。
- `dist/` 生成物を履歴から完全に除去（`git filter-repo` 実施後、`git push --force` でクリーン化）。
- CI（ある場合）でのキャッシュ/アーティファクト設定を更新し、ビルド手順を README に記載。

### 3. ドメイン層の切り出し
- 型定義の集約: `src/types/note.ts`/`src/types/memo.ts` を中心に、共通のドメイン型を `src/types/` にまとめる。
- ドメインサービス層: メモ/ノート操作（保存、検索、同期など）のロジックを UI から分離し `src/lib/services/`（新設）へ配置。
- 定数・設定値を `src/lib/constants.ts` に集約し、UI でハードコーディングされている値を置き換える。
- 外部 API/ストレージ I/O（`src/lib/ai-client.ts` など）をアダプターとして整理し、テストダブルを差し替えやすくする。

### 4. UI/状態管理の整理（Notebook/Editor 周り）
- Notebook 系フック（`use-canvas-layout.ts` / `use-canvas-selection.ts` / `use-canvas-operations.ts`）の責務を分割・命名見直し。
- Notebook キャンバスの描画層とデータ操作層を分け、コンポーネントは「表示のみ」に寄せる。
- リッチテキストエディタやフォームコンポーネントの props を型安全にし、バリデーションを一箇所に集約。
- テーマ/ダークモード切替などのクロスカット機能を `components/theme-provider.tsx` 等で一元管理。

### 5. エラーハンドリング・ログ
- Electron main/preload での IPC ハンドラに try/catch を追加し、ユーザ向けエラーメッセージとログを分離。
- UI 側での失敗通知をトースト/ダイアログに統一し、共通の `useToast` や `Alert` コンポーネントを用意。
- 重要イベント（保存失敗、同期失敗、AI 呼び出しエラーなど）をコンソールだけでなくファイル/リモートログに送れる拡張ポイントを確保。

### 6. パフォーマンス/UX 改善
- 重い処理（キャンバス再計算、AI コール）のメモ化やスロットリングを導入し、不要な再レンダーを削減。
- 画像・大きなアセットの遅延読み込み、コードスプリットを検討。
- キーボードショートカット、Undo/Redo の仕様を決めて、状態管理で一貫させる。

### 7. テストとドキュメント
- ユニットテスト: ドメインサービス・ユーティリティを優先して追加。
- コンポーネント/フックのスモークテストを最小限でも用意し、Notebook 操作のクリティカルパスをカバー。
- README 更新: 開発手順、ビルド・配布手順、環境変数、スクリプト一覧、トラブルシュート（dist が入らないように注意点を明記）。

## 推奨ブランチの刻み方
- `chore/lint-config-fix`（フェーズ1）
- `chore/build-pipeline-cleanup`（フェーズ2）
- `refactor/domain-services`（フェーズ3）
- `refactor/notebook-hooks`（フェーズ4）
- `chore/error-logging`（フェーズ5）
- `perf/notebook-ux`（フェーズ6）
- `docs/update-readme`（フェーズ7）

■どっかで、スマホの画面も作りたい。
これは、HTM、CSSのみで静的な画面で出力してもらいながら、それの修正を行なっていくのがいい気がする