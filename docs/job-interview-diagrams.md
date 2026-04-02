# 面接用 draw.io MCP 図解プロンプト集

> Magic Memo の技術力を面接で効果的に伝えるための図解プロンプト集。
> 記事「[システム構成図の書き方](https://zenn.dev/maman/articles/a797a98ac548e9)」のベストプラクティスに基づき、
> **目的別の図解選択**・**段階的な詳細化**・**一貫した表記法** を意識して設計。

## 前提条件

draw.io MCP サーバーをセットアップ済みであること。

```json
// .claude/mcp_servers.json
{
  "mcpServers": {
    "drawio": {
      "command": "npx",
      "args": ["@drawio/mcp"]
    }
  }
}
```

### 色コード凡例（全図共通）

| 色名 | コード | 用途 |
|------|--------|------|
| 薄青 | `#dae8fc` | Renderer / UI層 |
| 薄緑 | `#d5e8d4` | Main Process / サーバー側 |
| 薄黄 | `#fff2cc` | 外部サービス / アダプター層 |
| 薄紫 | `#e1d5e7` | アプリケーション層 / ルーティング |
| 薄赤 | `#f8cecc` | 型定義 / セキュリティ境界 |
| 灰色 | `#f5f5f5` | IPC Bridge / 境界線 |

---

## 1. ハイレベル・システム概要図（経営陣・非技術者向け）

> **目的**: 面接の冒頭で「何を作ったか」を30秒で伝える。
> 記事推奨: 「全体像を把握するための高レベルなアーキテクチャ図」「ビジネス目標との関連性を示すハイレベルな図解」

```
open_drawio_xml で Magic Memo アプリのハイレベル概要図を作成してください。
技術者でない面接官にも伝わるシンプルな図です。

■ 全体構成（左→右フロー、3つの大きなブロック）

ブロック1: ユーザー（左端）
- umlActor アイコン
- ラベル：「ユーザー」
- 補足：「macOS デスクトップアプリ」

ブロック2: Magic Memo アプリ（中央、大きな角丸矩形、青 #dae8fc）
- タイトル：「Magic Memo」太字 16pt
- 3つのサブ要素を縦に配置：
  1. 「📝 見開きノート型キャンバス」— 自由配置でメモを整理
  2. 「🔗 ブロック間の接続線」— アイデアの関係を可視化
  3. 「✏️ 手書き＋リッチテキスト」— 多彩な入力手段
- 下部に小さく：「Electron + Next.js + React 19」

ブロック3: AI アシスト（右端、角丸矩形、黄 #fff2cc）
- アイコン：AI/ロボットのシルエット
- ラベル：「Gemini AI」
- 補足テキスト：「事実から抽象化・転用を自動生成」

■ フロー矢印
- ユーザー → Magic Memo：「メモを記録」
- Magic Memo → AI：「事実テキストを送信」
- AI → Magic Memo：「抽象化・転用を返却」（点線矢印）
- Magic Memo → ユーザー：「思考の深化をサポート」

■ 下部に「事実 → 抽象化 → 転用」のフレームワーク図
- 3つの矢印でつながった3ステップを水平に配置
- 事実（青 #dae8fc）→ 抽象化（緑 #d5e8d4）→ 転用（黄 #fff2cc）
- 各ステップに一行の説明テキスト

■ レイアウト指示
- 全体サイズ：横 1000px × 縦 500px
- コネクタは曲線（curved）
- フォント：タイトル 16pt 太字、本文 11pt
- 背景色：白
```

---

## 2. セキュリティアーキテクチャ図（技術面接・深掘り用）

> **目的**: Electron セキュリティの理解度を示す。面接で「セキュリティ面はどう考慮しましたか？」と聞かれた時に使う。
> 記事推奨: 「非機能要件も図解に明示的に組み込む」「セキュリティゾーンを色分けする」

```
open_drawio_xml で Magic Memo の Electron セキュリティアーキテクチャ図を作成してください。

■ 全体構成（3つのセキュリティゾーンを色分けした矩形で表現）

ゾーン1: Renderer Process（青 #dae8fc、左側）
- ラベル：「Renderer Process（信頼されないゾーン）」太字
- 赤い点線枠で「制限あり」を強調
- 内部要素：
  - Next.js App Router
  - React 19 コンポーネント
  - Zustand Store
- 制約の注記（赤字）：
  - 「nodeIntegration: false」
  - 「sandbox: true」
  - 「Node.js API アクセス不可」

ゾーン2: IPC Bridge（灰 #f5f5f5、中央、点線枠）
- ラベル：「preload.ts — contextBridge」
- 「contextIsolation: true」を太字で注記
- 内部に公開 API リストを枠で表示：
  - loadPages() / savePages()
  - loadConfig() / saveConfig()
  - generateAbstraction() / generateDiversion() / generateSummary()
  - onNewPage() / onToggleDark()
- 注記：「IPC_CHANNELS 定数でチャネル名を型安全に管理」
- 両側に双方向矢印：
  - 左：Renderer → Bridge「window.electronAPI 経由」
  - 右：Bridge → Main「ipcRenderer.invoke()」

ゾーン3: Main Process（緑 #d5e8d4、右側）
- ラベル：「Main Process（信頼されるゾーン）」太字
- 内部要素を縦に配置：
  1. 「入力バリデーション層」（赤 #f8cecc の枠）
     - isValidNotePage() — 型ガード
     - isValidPages() — 配列バリデーション
     - isValidAppConfig() — テーマのホワイトリスト検証
  2. 「IPC Handlers」
     - data-handlers.ts（CRUD）
     - ai-handlers.ts（AI生成）
  3. 「永続化層」
     - electron-store（pages-store, config-store）

■ 下部に追加のセキュリティ対策セクション（横長の矩形）
- ナビゲーション制御：
  - Dev: localhost:3000 のみ許可
  - Prod: file:// プロトコルのみ
  - 外部URL: https:, mailto: のみ shell.openExternal()
- 「will-navigate イベントでブロック」と注記

■ レイアウト指示
- 左→右のフロー
- 各ゾーンは角丸矩形、影付き
- セキュリティ境界を赤い点線で強調
- バリデーション層は赤系の背景で目立たせる
- 全体サイズ：横 1200px × 縦 700px
- フォント：ゾーンタイトル 14pt 太字、要素名 11pt、注記 9pt イタリック
```

---

## 3. デザインパターン一覧図（技術面接・設計力アピール）

> **目的**: 採用した設計パターンを一覧で示し、「なぜその設計にしたか」を論理的に説明する。
> 記事推奨: 「コンポーネント間のインターフェースを定義する」「依存関係を矢印で表現する」

```
open_drawio_xml で Magic Memo で採用しているデザインパターンの一覧図を作成してください。

■ 全体構成（カード型レイアウト、2列 × 3行のグリッド）

カード1: Platform Adapter パターン（青 #dae8fc）
┌─────────────────────────────┐
│ Platform Adapter             │
│ src/lib/platform-events.ts   │
├─────────────────────────────┤
│ [Component]                  │
│     ↓ 呼び出し               │
│ [platformEvents]             │
│     ├→ Electron: IPC 経由    │
│     └→ Web: no-op fallback   │
├─────────────────────────────┤
│ 目的: 環境差異を吸収し        │
│ コンポーネントを環境非依存に   │
└─────────────────────────────┘

カード2: Storage Adapter パターン（緑 #d5e8d4）
┌─────────────────────────────┐
│ Storage Adapter              │
│ services/note-storage.ts     │
├─────────────────────────────┤
│ [Zustand subscribe]          │
│     ↓ 自動検知               │
│ [saveNotes()]                │
│     ├→ electron-store (IPC)  │
│     └→ localStorage          │
├─────────────────────────────┤
│ 目的: 永続化先を実行環境で    │
│ 自動切替。呼び出し側は意識不要 │
└─────────────────────────────┘

カード3: Hook Composition パターン（紫 #e1d5e7）
┌─────────────────────────────┐
│ Hook Composition             │
│ hooks/use-canvas-*.ts        │
├─────────────────────────────┤
│ [NotebookCanvas]             │
│   ├ useCanvasLayout          │
│   ├ useCanvasOperations      │
│   ├ useCanvasSelection       │
│   └ useCanvasShortcuts       │
├─────────────────────────────┤
│ 目的: 関心の分離。             │
│ 1ファイル=1責務で保守性向上    │
└─────────────────────────────┘

カード4: useRef Latest Value パターン（黄 #fff2cc）
┌─────────────────────────────┐
│ useRef Latest Value          │
│ Vercel React Best Practice   │
├─────────────────────────────┤
│ [useEffect mount時]          │
│   └ addEventListener (1回)   │
│ [stateRef.current]           │
│   └ 常に最新の state を参照   │
├─────────────────────────────┤
│ 目的: イベントリスナーの再登録 │
│ を防止し、パフォーマンス最適化 │
└─────────────────────────────┘

カード5: subscribeWithSelector パターン（赤 #f8cecc）
┌─────────────────────────────┐
│ subscribeWithSelector        │
│ Zustand middleware           │
├─────────────────────────────┤
│ [store.subscribe]            │
│   ├ (s) => s.pages → save   │
│   └ (s) => s.activePageId   │
│       → saveConfig           │
│ [useNoteStore(selector)]     │
│   → 個別 selector で再描画最小│
├─────────────────────────────┤
│ 目的: 状態変化を粒度で分離。  │
│ 自動保存と再描画最適化を両立  │
└─────────────────────────────┘

カード6: 型の SSoT（Single Source of Truth）（灰 #f5f5f5）
┌─────────────────────────────┐
│ Type SSoT                    │
│ src/types/*.d.ts             │
├─────────────────────────────┤
│ [note.d.ts]                  │
│   └ NotePage, CanvasObject   │
│ [electron.d.ts]              │
│   └ ElectronAPI              │
│ 両プロセスが同じ型を共有      │
│ .d.ts で rootDir 競合を回避   │
├─────────────────────────────┤
│ 目的: 型の二重定義を防ぎ、     │
│ Electron/React 間の整合性保証  │
└─────────────────────────────┘

■ レイアウト指示
- 2列 × 3行のグリッド配置
- 各カードは角丸矩形、影付き
- カード内は上部にパターン名（太字 13pt）、中央にミニ図解、下部に目的説明
- カード間に余白 30px
- 全体サイズ：横 1100px × 縦 900px
- フォント：パターン名 13pt 太字、コード 10pt monospace、説明 10pt
```

---

## 4. 状態管理フロー図（技術面接・React 設計の深掘り）

> **目的**: Zustand による状態管理の全体フローを示し、「なぜ Redux ではなく Zustand か」を説明する。
> 記事推奨: 「データの入力元、処理過程、出力先などを示す」「データの変換や処理を明確に示す」

```
open_drawio_xml で Magic Memo の Zustand 状態管理フロー図を作成してください。

■ 全体構成（左→右のデータフロー）

ステージ1: イベント発生（左端）
- 3つの入力元を縦に配置：
  1. [ユーザー操作]（umlActor）— テキスト入力、ドラッグ、ダブルクリック
  2. [プラットフォーム]（六角形、灰 #f5f5f5）— Cmd+M（新規ページ）、Cmd+D（ダーク切替）
  3. [AI レスポンス]（六角形、黄 #fff2cc）— Gemini API の結果返却

ステージ2: アクション層（中左）
- 大きな角丸矩形（青 #dae8fc）
- タイトル：「Zustand Actions」
- 内部にアクション一覧：
  - hydrate() — 初回データ読み込み（StrictMode 二重実行ガード付き）
  - addPage() — ページ追加
  - updatePage(id, updates) — ページ更新
  - softDeletePage(id) — ソフト削除（2週間後に自動クリーンアップ）
  - restorePage(id) — ゴミ箱から復元
  - setActivePageId(id) — アクティブページ切替

ステージ3: State（中央の円柱型、緑 #d5e8d4）
- タイトル：「NoteState」
- 内部に state フィールド：
  - pages: NotePage[]
  - activePageId: string | null
  - isHydrated: boolean

ステージ4: subscribe（自動検知）（中右、菱形の分岐、黄 #fff2cc）
- 2つの selector を表示：
  - (s) => s.pages → ページデータ変更を検知
  - (s) => s.activePageId → アクティブページ変更を検知

ステージ5: 永続化（右端、2つの出力先）
- 出力先1:（緑 #d5e8d4）
  - [electron-store]（Electron 環境）
  - saveNotes(pages) → IPC → pagesStore.set()
- 出力先2:（灰 #f5f5f5）
  - [localStorage]（Web 環境）
  - JSON.stringify → setItem()

■ 上部にリアクティブ再描画フロー（青の点線矢印）
State → [useNoteStore(selector)] → [React コンポーネント再描画]
- 注記：「個別 selector で必要なコンポーネントのみ再描画」

■ レイアウト指示
- 左→右のフロー、5ステージ
- ステージ間は太い矢印でデータ名をラベル付け
- 菱形分岐で Electron/Web の分岐を明示
- subscribe からの矢印は波線（変更通知を表現）
- 全体サイズ：横 1300px × 縦 600px
- フォント：タイトル 13pt 太字、state フィールド 11pt monospace
```

---

## 5. 依存関係レイヤー図（面接序盤・アーキテクチャ全体像）

> **目的**: `app → features → shared → lib → types` の一方向依存を示し、整理されたコード構造をアピール。
> 記事推奨: 「レイヤー構造を表現する」「抽象度を適切に保つ」

```
open_drawio_xml で Magic Memo の Feature-Based Module 構造の依存関係図を作成してください。

■ 構成（上→下の5層スタック + 右側に Electron 層）

【左側メイン：Next.js / React 側】

第1層: app/（薄紫 #e1d5e7）
- 幅 700px
- 内部：page.tsx, layout.tsx, error.tsx
- 注記バッジ：「薄いルーティング層 — ロジックを持たない」

第2層: features/（薄青 #dae8fc）
- 幅 700px
- 3つのサブモジュールを横並びで配置、各モジュールは独立した角丸矩形：

  notebook/（左）
  ├ components/
  │ ├ canvas/ (NotebookCanvas, CanvasBackground, ConnectionLayer)
  │ ├ blocks/ (TextBlock, RichTextEditor, HandwritingLayer)
  │ └ toolbar/ (RibbonToolbar + 6つの parts)
  ├ hooks/ (useCanvasLayout, Operations, Selection, Shortcuts)
  ├ extensions/ (fontSize TipTap拡張)
  └ constants.ts (DEFAULT_LAYOUT, Z_INDEX, SECTION_TYPES)

  notes/（中央）
  ├ components/ (HomeContent, MotionPageWrapper)
  ├ hooks/ (useNotes, useTrash)
  ├ stores/ (note-store.ts — Zustand SSoT)
  └ services/ (note-storage.ts — Storage Adapter)

  sidebar/（右）
  ├ components/ (AppSidebar, DesktopSidebar, MobilDrawer + parts)
  └ hooks/ (useEditing, useGrouping, useSearch, useShortcuts)

- 各モジュール間に「×」印（直接参照なし）を表示
- 注記：「機能モジュールは自己完結 — 相互依存なし」

第3層: shared/（薄緑 #d5e8d4）
- 幅 700px
- 2グループ：
  - shadcn/：Button, Card, ContextMenu, DropdownMenu, Input, Sheet, ScrollArea ...
  - ui/：ModeToggle, ThemeProvider

第4層: lib/（薄黄 #fff2cc）
- 幅 700px
- platform-events.ts（Platform Adapter）
- theme.ts（テーマユーティリティ）
- utils.ts（cn() 他）

第5層: types/（薄赤 #f8cecc）
- 幅 700px
- note.d.ts（NotePage, CanvasObject, Connection, AppConfig）
- electron.d.ts（ElectronAPI, Window 拡張）
- 注記：「.d.ts で Electron/React 両方から参照可能」

【右側サブ：Electron 側】（緑 #d5e8d4、独立した縦長矩形）
- 幅 250px、第1層〜第5層と同じ高さ
- 内部：
  - main.ts（エントリポイント）
  - preload.ts（contextBridge）
  - handlers/（data, ai）
  - store/（pages-store, config-store）
  - window/（main-window, menu）
  - ipc/types.ts
  - utils/validators.ts
- types/ 層との接続：点線矢印「型を共有（SSoT）」

■ 層間の矢印
- 各層間に下向き矢印「依存」
- 右側に大きなブラケット付き注記：「依存方向: 上 → 下（一方向のみ）」

■ レイアウト指示
- 中央揃え、各層間の間隔 20px
- features/ 内の3モジュールは均等幅
- Electron 側は右に 50px オフセット
- 全体サイズ：横 1050px × 縦 900px
- フォント：層タイトル 14pt 太字、ファイル名 10pt monospace
```

---

## 6. 開発ワークフロー図（面接・チーム開発力アピール）

> **目的**: 開発フロー・CI/CD・コード品質の仕組みを示し、チーム開発への意識をアピール。
> 記事推奨: 「CI/CDパイプラインと連携し、自動的に更新する仕組みを検討する」

```
open_drawio_xml で Magic Memo の開発ワークフロー図を作成してください。

■ 全体構成（左→右のフロー、4つのステージ）

ステージ1: ローカル開発（青 #dae8fc）
- 大きな角丸矩形
- タイトル：「Local Development」
- 2つの開発モード：
  - [npm run electron:dev]
    - concurrently で並列起動
    - Next.js dev server (localhost:3000)
    - wait-on → tsc (electron) → tsc-alias → electron .
  - [npm run dev]
    - Next.js のみ（Web プレビュー）
    - Electron なしで UI 開発可能
- 下部に開発ツール：
  - Biome (lint + format 統合)
  - TypeScript 5 (strict mode)

ステージ2: コード品質チェック（黄 #fff2cc）
- 大きな角丸矩形
- タイトル：「Quality Gate」
- 縦に3つのチェック項目：
  1. [biome check ./src ./electron] — Lint
  2. [tsc -p electron] — Electron 型チェック
  3. [npm run build] — Next.js ビルド + 型チェック
- 各項目に ✓ アイコン

ステージ3: CI/CD パイプライン（緑 #d5e8d4）
- 大きな角丸矩形
- タイトル：「GitHub Actions CI」
- トリガー条件：
  - push to main
  - PR to main
- ジョブ内容（フローチャート形式）：
  1. checkout → setup Node 20 → npm ci (cache)
  2. Biome lint
  3. tsc -p electron
  4. npm run build

ステージ4: ビルド・配布（紫 #e1d5e7）
- 大きな角丸矩形
- タイトル：「Build & Distribution」
- [npm run electron:build]
  - next build → tsc → tsc-alias → electron-builder
  - 成果物：.dmg（macOS）
- DMG アイコンを配置

■ ステージ間の矢印
- ステージ1 → 2：「git commit」
- ステージ2 → 3：「git push / PR」
- ステージ3 → 4：「merge to main」

■ 下部に技術選定のハイライト
横長バーで以下を表示（緑背景 #d5e8d4）：
- 「Biome = ESLint + Prettier 統合（高速・設定簡潔）」
- 「concurrently + wait-on = Electron + Next.js の並列開発」
- 「electron-builder = クロスプラットフォーム対応」

■ レイアウト指示
- 左→右の4ステージフロー
- 各ステージは同じ幅（250px）
- コネクタは直角線（orthogonal）
- 全体サイズ：横 1200px × 縦 650px
- フォント：ステージタイトル 13pt 太字、内容 10pt
```

---

## 7. IPC 通信シーケンス図（技術面接・Electron 深掘り）

> **目的**: Electron IPC の双方向通信と型安全性を具体的に示す。
> 記事推奨: 「データの流れや依存関係を矢印で表現する」

```
open_drawio_mermaid で Magic Memo の IPC 通信シーケンス図を作成してください。
3つの代表的なフロー（データ読込、データ保存、AI 生成）を1図にまとめます。

sequenceDiagram
    actor User as ユーザー
    participant RC as React Component<br>(HomeContent)
    participant ZS as Zustand Store<br>(note-store.ts)
    participant SA as Storage Adapter<br>(note-storage.ts)
    participant PL as preload.ts<br>(contextBridge)
    participant VL as Validators<br>(validators.ts)
    participant MH as IPC Handlers<br>(data-handlers.ts)
    participant ES as electron-store<br>(pages-store)
    participant AI as ai-handlers.ts
    participant GA as Gemini API

    Note over RC,ES: ■ 1. 初回データ読込（hydrate）
    RC->>ZS: hydrate()
    Note right of ZS: isHydrated ガード<br>（StrictMode 二重実行防止）
    ZS->>SA: loadNotes()
    SA->>PL: window.electronAPI.loadPages()
    PL->>MH: ipcRenderer.invoke('load-pages')
    MH->>ES: pagesStore.get('pages')
    ES-->>MH: NotePage[]
    MH-->>PL: NotePage[]
    PL-->>SA: NotePage[]
    SA-->>ZS: { pages, config }
    ZS->>ZS: set({ pages, activePageId, isHydrated: true })
    ZS->>ZS: cleanupOldTrash()

    Note over RC,ES: ■ 2. ノート保存（自動）
    User->>RC: テキスト入力 / ブロック移動
    RC->>ZS: updatePage(id, { objects })
    ZS->>ZS: set({ pages: [...updated] })
    Note right of ZS: subscribe 自動検知<br>(s) => s.pages
    ZS-->>SA: saveNotes(pages)
    SA->>PL: window.electronAPI.savePages(pages)
    PL->>VL: isValidPages(pages)
    Note right of VL: 型ガードで検証<br>不正データは reject
    VL-->>MH: validated NotePage[]
    MH->>ES: pagesStore.set('pages', pages)
    ES-->>MH: true

    Note over RC,GA: ■ 3. AI 抽象化生成
    User->>RC: 「抽象化」ボタンクリック
    RC->>PL: window.electronAPI.generateAbstraction(fact)
    PL->>AI: ipcRenderer.invoke('generate-abstraction')
    AI->>GA: GoogleGenerativeAI.generateContent(prompt)
    GA-->>AI: 抽象化テキスト
    AI-->>PL: result string
    PL-->>RC: 抽象化テキスト
    RC->>ZS: updatePage(id, { objects: [...newBlock] })
    Note right of ZS: subscribe で自動保存も発火
```

---

## 8. 技術選定の意思決定マトリクス（面接・判断力アピール）

> **目的**: 「なぜその技術を選んだか」をトレードオフ付きで説明する。
> 記事推奨: 「過去の設計決定の理由を理解し、将来の意思決定に活かせる」

```
open_drawio_xml で Magic Memo の技術選定マトリクスを作成してください。
各カテゴリの採用技術と比較候補、選定理由をテーブル形式で示します。

■ メインテーブル（7行 × 5列）

| カテゴリ | 採用技術 | 比較候補 | 選定理由 | トレードオフ |
|---------|---------|---------|---------|------------|
| フレームワーク | Electron + Next.js | Tauri, Flutter | Web技術の資産活用・エコシステムの成熟度 | バイナリサイズ大（Tauri比）|
| 状態管理 | Zustand | Redux, Jotai, Context API | 軽量・subscribeWithSelector で粒度制御・自動保存が容易 | 大規模チームでの規約が Redux より弱い |
| エディタ | TipTap (ProseMirror) | Slate, Draft.js, Lexical | ヘッドレス設計・豊富な拡張・React 19 対応 | 学習コスト中（ProseMirror 理解必要）|
| ストレージ | electron-store | SQLite, IndexedDB | JSON永続化・セットアップ不要・小中規模に最適 | 大規模データには不向き |
| UIライブラリ | shadcn/ui + Radix | MUI, Chakra UI, Ant Design | コピー式でロックインなし・Tailwind 統合・軽量 | コンポーネント追加が手動 |
| コード品質 | Biome | ESLint + Prettier | Lint + Format 統合・Rust製で高速・設定簡潔 | エコシステムが ESLint より小さい |
| アニメーション | Framer Motion (LazyMotion) | React Spring, CSS | 宣言的API・LazyMotion でバンドル最適化 | ライブラリサイズ（lazy load で軽減）|

■ レイアウト指示
- 採用技術列は太字＋緑背景（#d5e8d4）でハイライト
- トレードオフ列は薄赤背景（#f8cecc）で注意を引く
- 各行の高さを均一に
- テーブル幅：1100px
- フォントサイズ：ヘッダー 12pt 太字、本文 10pt
- ヘッダー行は濃い灰色背景（#d9d9d9）
```

---

## 9. Canvas Hook Composition 詳細図（技術面接・React 設計力）

> **目的**: NotebookCanvas の Hook Composition パターンを詳細に示し、関心の分離を説明する。
> 記事推奨: 「コンポーネントの粒度を適切に保つ」「再利用可能なコンポーネントを明確にする」

```
open_drawio_xml で Magic Memo の Canvas Hook Composition 詳細図を作成してください。
各フックの責務と内部のデータフローを詳しく示します。

■ 中央（大きな角丸矩形、青 #dae8fc、幅 300px × 高さ 200px）
NotebookCanvas（メインコンポーネント）
- props: page, onUpdate
- 内部状態: isPenMode, isConnectMode, isObjectEraserMode
- containerRef（DOM参照）

■ 4つのカスタムフック（放射状に配置）

左上: useCanvasLayout（黄 #fff2cc、200px × 250px）
  入力: page, onUpdate
  State:
  - titleHeight（デフォルト: 10%）
  - centerPosition（デフォルト: 50%）
  - diversionPosition（デフォルト: 75%）
  メソッド:
  - handleBoundaryChange(boundary, value)
  出力 → NotebookCanvas:
  - titleHeight, centerPosition, diversionPosition
  注記: 「ノートの3セクション境界を管理。ドラッグで調整可能」

右上: useCanvasOperations（緑 #d5e8d4、200px × 250px）
  入力: page, onUpdate, containerRef
  メソッド:
  - handleAddBlock(eOrX, valY?)
    - ダブルクリック or プログラム呼び出し
    - Y座標からセクション自動判定
  - handleUpdateObject(objectId, updates)
  - handleDeleteObject(objectId)
    - カスケード: 関連 Connection も削除
  - handleDeleteConnection(connectionId)
  - handleUpdateStrokes(strokes)
  - toggleFavorite()
  注記: 「CRUD + カスケード削除」

左下: useCanvasSelection（紫 #e1d5e7、200px × 250px）
  State:
  - selectedObjectId: string | null
  - selectedConnectionId: string | null
  - activeEditor: TipTap Editor | null
  メソッド:
  - handleBlockClick(id)
  - handleConnectionClick(connectionId)
  - handleBackgroundClick()
  - handleEditorReady(objectId, editor)
  注記: 「排他選択: Object と Connection は同時選択不可」

右下: useCanvasShortcuts（赤 #f8cecc、200px × 280px）
  入力: selectedObjectId, selectedConnectionId, isPenMode,
        isConnectMode, activeEditor, 全操作ハンドラ
  パターン: 「useRef Latest Value」
  - stateRef に全 state/handler を格納
  - useEffect([], []) で1回だけ addEventListener
  キーバインド:
  - Cmd+D: 削除
  - Cmd+N: 新規ブロック（カーソル位置）
  - Cmd+P: Pen モード
  - Cmd+E: Eraser モード
  - P/C: モード切替（非入力時）
  - Escape: 全解除
  - Cmd+±: フォントサイズ
  - Cmd+1/2/3: リスト
  注記: 「イベントリスナーは mount 時に1回だけ登録」

■ 子コンポーネント（下部に横並び、青 #dae8fc 薄め）
5つの子を配置：
1. CanvasBackground — セクション色分け表示、境界線ドラッグハンドル
2. TextBlock[] — react-rnd でドラッグ＆リサイズ、TipTap エディタ内蔵
3. ConnectionLayer — SVG で接続線描画
4. HandwritingLayer — Canvas API で手書きストローク
5. RibbonToolbar — 書式・モード切替ツール

■ データフロー矢印
- NotebookCanvas → 各フック：実線矢印「props 渡し」
- 各フック → NotebookCanvas：点線矢印「戻り値」
- NotebookCanvas → 子コンポーネント：実線矢印「props + handlers」
- useCanvasShortcuts → useCanvasOperations：灰色点線「handler 参照」

■ レイアウト指示
- NotebookCanvas を中央に配置
- 4フックを四隅に放射状配置、双方向矢印
- 子コンポーネントは下部に横並び
- 各フックの中にメソッド名を左揃えで列挙
- Z-INDEX 情報を右下に小さいテーブルで配置：
  BACKGROUND: 0, CONTENT_LAYER: 10, BOUNDARY: 15,
  TEXT_BLOCK_SELECTED: 20, CONNECTION_LAYER: 30, MODE_INDICATOR: 50
- 全体サイズ：横 1200px × 縦 1000px
- フォント：コンポーネント名 13pt 太字、メソッド 10pt monospace、注記 9pt
```

---

## 10. 面接ストーリーマップ（発表順序ガイド）

> **目的**: 面接での図解の使用順序を示すメタ図。どの場面でどの図を使うかの指針。
> 記事推奨: 「目的に応じた適切な図解の選択」「段階的な詳細化」

```
open_drawio_xml で面接での図解使用順序を示すストーリーマップを作成してください。

■ 構成（横方向のタイムライン）

フェーズ1:「概要説明」（0〜3分、青 #dae8fc）
┌─────────────────────────────────┐
│ 使用図: ① ハイレベル概要図        │
│ 話すこと:                        │
│ - 何を作ったか（メモアプリ）       │
│ - 独自性（事実→抽象化→転用）      │
│ - 技術スタック概要                │
│ 対象: 全面接官                    │
└─────────────────────────────────┘

フェーズ2:「アーキテクチャ」（3〜8分、緑 #d5e8d4）
┌─────────────────────────────────┐
│ 使用図: ⑤ 依存関係レイヤー図      │
│ 話すこと:                        │
│ - 一方向依存の設計原則            │
│ - Feature-Based Module 構造      │
│ - 型の SSoT（.d.ts 戦略）        │
│ 対象: テックリード・アーキテクト   │
└─────────────────────────────────┘

フェーズ3:「設計判断」（8〜15分、黄 #fff2cc）
┌─────────────────────────────────┐
│ 使用図: ⑧ 技術選定マトリクス      │
│       + ③ デザインパターン一覧     │
│ 話すこと:                        │
│ - 技術選定のトレードオフ           │
│ - Adapter パターンの採用理由       │
│ - Hook Composition の設計意図     │
│ 対象: シニアエンジニア             │
└─────────────────────────────────┘

フェーズ4:「技術深掘り」（15〜25分、紫 #e1d5e7）
┌─────────────────────────────────┐
│ 使用図: ② セキュリティ図          │
│       + ④ 状態管理フロー図        │
│       + ⑨ Canvas Hook 詳細図     │
│       + ⑦ IPC シーケンス図        │
│ 話すこと:                        │
│ - Electron セキュリティの3原則    │
│ - Zustand subscribeWithSelector  │
│ - useRef Latest Value パターン   │
│ - IPC の型安全バリデーション       │
│ 対象: 技術面接官                  │
└─────────────────────────────────┘

フェーズ5:「品質・プロセス」（25〜30分、赤 #f8cecc）
┌─────────────────────────────────┐
│ 使用図: ⑥ 開発ワークフロー図      │
│ 話すこと:                        │
│ - CI/CD パイプライン              │
│ - Biome 統合による品質管理        │
│ - 今後の改善計画                  │
│ 対象: エンジニアリングマネージャー │
└─────────────────────────────────┘

■ レイアウト指示
- 横方向のタイムライン（左→右）
- 各フェーズは同幅の角丸矩形（200px × 300px）
- フェーズ間を太い矢印で接続
- 上部にタイムラインバー（0分→30分）
- 下部に「Tips: 面接官の反応を見て深掘り度合いを調整」の注記
- 全体サイズ：横 1200px × 縦 450px
- フォント：フェーズ名 13pt 太字、内容 10pt
```

---

## プロンプト使用時の Tips

1. **面接の形式に合わせて選択する** — オンライン面接なら図を画面共有、対面なら印刷して持参
2. **すべてを見せる必要はない** — 面接官の興味に応じて2〜3枚をピックアップ
3. **ストーリーマップ（図10）を最初に確認** — 「概要→全体像→設計判断→深掘り→品質」の流れを意識
4. **図の生成後は必ず手動調整** — AI生成は80%の完成度。レイアウトや矢印の位置を整える
5. **色コードの凡例を統一** — 冒頭の凡例テーブルに従い、全図で一貫した配色を使う
6. **段階的な詳細化を意識** — 記事のベストプラクティス通り、高レベル→詳細の順で提示する
