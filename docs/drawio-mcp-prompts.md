# draw.io MCP で Magic Memo の図を生成するプロンプト集

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

---

## 1. システムアーキテクチャ図

```
open_drawio_xml で Magic Memo アプリのシステムアーキテクチャ図を作成してください。

■ 全体構成
左から右へのフローで、以下の3層構成を色分けされた矩形グループで表現してください。

■ Renderer Process（青系 #dae8fc）
- Next.js App Router（thin routing layer）
- React 19 コンポーネント群
  - NotebookCanvas（キャンバスUI）
  - AppSidebar（ナビゲーション）
  - RichTextEditor（TipTap エディタ）
- Zustand Store（状態管理）
  - subscribeWithSelector で自動保存

■ IPC Bridge（中央、灰色系 #f5f5f5、点線枠）
- preload.ts（contextBridge）
- セキュリティ設定を注記：contextIsolation: true / nodeIntegration: false / sandbox: true
- 双方向矢印で Renderer ⇔ Main を接続

■ Main Process（緑系 #d5e8d4）
- Electron 39（Node.js ランタイム）
- IPC Handlers
  - data-handlers.ts（CRUD）
  - ai-handlers.ts（AI生成）
- electron-store（JSON永続化）
- ネイティブメニュー（Cmd+M 等）

■ 外部サービス（右端、オレンジ系 #fff2cc）
- Gemini API（Google Generative AI）
  - ai-handlers → Gemini API を点線矢印で接続
  - ラベル：「事実 → 抽象化 → 転用」

■ レイアウト指示
- 各グループは角丸矩形で囲む
- コネクタは直角線（orthogonal）
- フォントサイズ：グループタイトル 14pt 太字、コンポーネント名 11pt
- 全体サイズ：横 1200px × 縦 600px 程度
```

---

## 2. レイヤードアーキテクチャ図（依存関係）

```
open_drawio_xml で Magic Memo の依存関係を示すレイヤードアーキテクチャ図を作成してください。

■ 構成（上から下への5層スタック）
依存方向は上→下の一方向のみ。各層を横長の矩形で表現し、下向き矢印で接続。

第1層: app/（Next.js App Router）— 色: #e1d5e7（薄紫）
  - page.tsx, layout.tsx
  - 「薄いルーティング層」と注記

第2層: features/（機能モジュール）— 色: #dae8fc（薄青）
  - notebook/（キャンバス＋エディタ）
  - notes/（データ永続化＋CRUD）
  - sidebar/（ナビゲーション＋ページ一覧）
  - 3つのサブモジュールを横並びで配置

第3層: shared/（共有UI）— 色: #d5e8d4（薄緑）
  - shadcn/ui コンポーネント群
  - ThemeProvider, ModeToggle

第4層: lib/（アダプター＋ユーティリティ）— 色: #fff2cc（薄黄）
  - platform-events.ts（Platform Adapter）
  - note-storage.ts（Storage Adapter）
  - utils.ts

第5層: types/（型定義 SSoT）— 色: #f8cecc（薄赤）
  - note.d.ts
  - electron.d.ts
  - 「.d.ts で Electron/React 間の型共有」と注記

■ レイアウト指示
- 中央揃え、各層の幅は 800px 統一
- 層間の矢印に「依存」とラベル
- 右側に「依存方向: 上 → 下（一方向）」の注記を追加
- 全体サイズ：横 900px × 縦 700px
```

---

## 3. データフロー図

```
open_drawio_xml で Magic Memo のデータフロー図を作成してください。

■ フロー（左から右）

[ユーザー操作]（umlActor）
  ↓ クリック / 入力
[React コンポーネント]（角丸矩形、青 #dae8fc）
  - NotebookCanvas
  - TextBlock
  - RichTextEditor
  ↓ アクション呼び出し
[Zustand Store]（円柱型、緑 #d5e8d4）
  - pages[], activePageId
  - addPage(), updatePage(), deletePage()
  ↓ subscribe（自動検知）
[Storage Adapter]（菱形、黄 #fff2cc）
  - 分岐：Electron 環境？
  ↓ Yes                    ↓ No
[IPC → electron-store]   [localStorage]
（緑 #d5e8d4）           （灰 #f5f5f5）
  ↓                        ↓
[JSON ファイル]           [ブラウザ Storage]
（データストア記号）      （データストア記号）

■ 追加フロー（AI 機能）
[ユーザー]→[React]→[IPC]→[ai-handlers]→[Gemini API]→[結果をキャンバスに表示]
- このフローは下段に配置し、点線で分離

■ レイアウト指示
- 全体は左→右のフロー
- 矢印にはデータ名をラベル付け（例: NotePage[], config）
- 分岐は菱形で表現
- 全体サイズ：横 1200px × 縦 500px
```

---

## 4. シーケンス図（IPC 通信）

```
open_drawio_mermaid で Magic Memo の IPC 通信シーケンス図を作成してください。

sequenceDiagram
    actor User as ユーザー
    participant RC as React Component
    participant ZS as Zustand Store
    participant PA as Platform Adapter
    participant PL as preload.ts<br>(contextBridge)
    participant MH as Main Process<br>(IPC Handlers)
    participant ES as electron-store
    participant GA as Gemini API

    Note over RC,ES: ■ ノート保存フロー
    User->>RC: テキスト入力
    RC->>ZS: updatePage(id, changes)
    ZS-->>PA: subscribe 自動検知
    PA->>PL: window.electronAPI.savePages(pages)
    PL->>MH: ipcRenderer.invoke('save-pages')
    MH->>ES: pagesStore.set('pages', pages)
    ES-->>MH: 保存完了
    MH-->>PL: void
    PL-->>PA: Promise resolved

    Note over RC,GA: ■ AI 抽象化フロー
    User->>RC: 抽象化をリクエスト
    RC->>PL: window.electronAPI.generateAbstraction(fact)
    PL->>MH: ipcRenderer.invoke('generate-abstraction')
    MH->>GA: callGemini(prompt)
    GA-->>MH: 抽象化テキスト
    MH-->>PL: result
    PL-->>RC: 結果表示
    RC->>User: キャンバスに挿入
```

---

## 5. コンポーネント構成図（Canvas Hook Composition）

```
open_drawio_xml で Magic Memo の Canvas Hook Composition 図を作成してください。

■ 中央（大きな角丸矩形、青 #dae8fc）
NotebookCanvas（メインコンポーネント）

■ 4つのカスタムフック（NotebookCanvas の周囲に配置）

左上: useCanvasLayout（黄 #fff2cc）
  - titleHeight 計算
  - centerPosition 計算
  - diversionPosition 計算
  - セクション境界ドラッグ

右上: useCanvasOperations（緑 #d5e8d4）
  - handleAddBlock()
  - handleUpdateObject()
  - handleDeleteObject()
  - handleDeleteConnection()
  - toggleFavorite()

左下: useCanvasSelection（紫 #e1d5e7）
  - selectedObjectId
  - selectedConnectionId
  - activeEditor (TipTap)
  - blur / focus 管理

右下: useCanvasShortcuts（赤 #f8cecc）
  - Pen モード (P)
  - Connect モード (C)
  - Eraser モード (Shift+E)
  - Cmd+D 削除
  - 書式ショートカット

■ 子コンポーネント（NotebookCanvas の下に配置）
- CanvasBackground（セクション表示）
- TextBlock[]（ドラッグ＆リサイズ）
- ConnectionLayer（接続線描画）
- Toolbar（ツールバー）

■ レイアウト指示
- NotebookCanvas を中央に大きく配置
- 4フックは四隅に配置し、双方向矢印で接続
- 子コンポーネントは下部に横並び、下向き矢印で接続
- 各フックの中にメソッド名を箇条書き
- 「関心の分離」という注記を右上に追加
- 全体サイズ：横 1000px × 縦 800px
```

---

## 6. コンセプト図（事実 → 抽象化 → 転用）

```
open_drawio_xml で Magic Memo のコンセプト図を作成してください。
アプリの根底にあるメモ術「事実 → 抽象化 → 転用」のフレームワークを図示します。

■ 上段：メモ術の思考フロー（左→右）
[事実 (Fact)]（角丸矩形、青 #dae8fc）
  - 「具体的な出来事・データを記録」
  → 矢印ラベル：「本質を抽出」
[抽象化 (Abstraction)]（角丸矩形、緑 #d5e8d4）
  - 「法則・パターン・洞察を導出」
  → 矢印ラベル：「別分野に応用」
[転用 (Diversion)]（角丸矩形、オレンジ #fff2cc）
  - 「具体的なアクション・応用先を発想」

■ 下段：キャンバスUI の対応（ノート見開きイメージ）
見開きノートを模した矩形を描画：

左ページ（青系）:
┌─────────────────┐
│   タイトル        │ ← titleHeight
├─────────────────┤
│                   │
│   事実 (Fact)     │
│   テキストブロック  │
│                   │
└─────────────────┘

右ページ（上下分割）:
┌─────────────────┐
│ 抽象化            │ ← 緑系
│ (Abstraction)     │
├─────────────────┤ ← diversionPosition
│ 転用              │ ← オレンジ系
│ (Diversion)       │
└─────────────────┘

■ 上段と下段を点線矢印で対応付け
- 事実 → 左ページ
- 抽象化 → 右上
- 転用 → 右下

■ 右側に Gemini AI アイコンを配置
- 事実ブロック → AI → 抽象化ブロック の補助フロー

■ レイアウト指示
- 上段は中央揃え、左→右フロー
- 下段のノートイメージは中央に大きく配置
- 全体サイズ：横 1000px × 縦 700px
- 日本語ラベルと英語ラベルを併記
```

---

## 7. 技術選定マトリクス

```
open_drawio_xml で Magic Memo の技術選定比較表を作成してください。

■ テーブル形式（5行 × 4列）

| カテゴリ | 採用技術 | 比較候補 | 選定理由 |
|---------|---------|---------|---------|
| 状態管理 | Zustand | Redux, Context API | 軽量・subscribeWithSelector で自動保存が容易 |
| エディタ | TipTap | Slate, Draft.js | ヘッドレス設計・拡張性・React 19 対応 |
| ストレージ | electron-store | SQLite, IndexedDB | JSON永続化・セットアップ不要・小中規模に最適 |
| UIライブラリ | shadcn/ui | MUI, Chakra UI | コピー&ペースト式・Tailwind統合・ロックインなし |
| コード品質 | Biome | ESLint + Prettier | Lint + Format 統合・高速・設定が簡潔 |

■ レイアウト指示
- 採用技術列は太字＋緑背景（#d5e8d4）でハイライト
- 各行に小さなアイコンまたは絵文字を追加
- テーブル幅：1000px
- フォントサイズ：ヘッダー 13pt 太字、本文 11pt
```

---

## プロンプト使用時の Tips

1. **ツール名を必ず明示する** — `open_drawio_xml` or `open_drawio_mermaid` を先頭に書く
2. **色コードを指定する** — 曖昧な「青系」より `#dae8fc` のような具体値で一貫性を保つ
3. **サイズとレイアウト方向を指定する** — 横 × 縦のピクセル指定と「左→右」「上→下」の明示
4. **生成後に draw.io で微調整する** — AI生成は80%の完成度。残りは手動で仕上げる
5. **PNG埋め込みで管理する** — `draw.io CLI --embed-diagram` でXMLをPNGに埋め込むとSSoTになる

## 参考記事

- [システム構成図の書き方 - 効果的な設計と可視化のために](https://zenn.dev/maman/articles/a797a98ac548e9)
- [draw.io MCPを使ってClaude Codeで持続可能なシステム構成図を書いてみる](https://zenn.dev/dk_/articles/20eea9572f33c6)
- [draw.io MCP × Agent SkillsでAI図作成の品質を上げる](https://zenn.dev/nogu66/articles/drawio-mcp-agent-skills-visualization)
- [AWS 構成図をプロンプトひとつで作れる！Claude Code + draw.io MCP サーバーを試してみた](https://dev.classmethod.jp/articles/aws-architecture-diagram-claude-code-drawio-mcp/)
- [draw.io公式MCPサーバーをClaude Codeで使う](https://blog.serverworks.co.jp/drawio-mcp-claude-code)
- [@drawio/mcp - npm](https://www.npmjs.com/package/@drawio/mcp)
