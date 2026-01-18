# Magic Memo

macOS 向けのデスクトップメモアプリケーション。Electron + Next.js で構築されています。

## 技術スタック

- **フロントエンド**: Next.js 16 + React 19 + TypeScript
- **デスクトップ**: Electron 39
- **スタイリング**: Tailwind CSS 4 + shadcn/ui
- **エディタ**: Tiptap (リッチテキスト)
- **AI機能**: Google Gemini API
- **リント/フォーマット**: Biome

## 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local` ファイルを作成し、以下を設定:

```bash
cp .env.example .env.local
# エディタで .env.local を開き、APIキーを設定
```

### 3. 開発サーバーの起動

```bash
# Electron + Next.js 開発サーバー
npm run electron:dev
```

## コマンド一覧

| コマンド | 説明 |
|---------|-----|
| `npm run electron:dev` | 開発サーバー起動（Electron + Next.js） |
| `npm run electron:build` | 本番ビルド（dmg生成） |
| `npm run dev` | Next.js 開発サーバーのみ |
| `npm run build` | Next.js ビルドのみ |
| `npm run lint` | Biome によるリント |
| `npm run lint:fix` | リントエラーの自動修正 |
| `npm run format` | コードフォーマット |

## ディレクトリ構造

```
memo_app/
├── electron/           # Electron メインプロセス
│   ├── main.ts         # エントリーポイント
│   ├── preload.ts      # プリロードスクリプト
│   └── ipc/            # IPC 型定義
├── src/
│   ├── app/            # Next.js App Router
│   ├── features/       # 機能別モジュール
│   │   ├── editor/     # リッチテキストエディタ
│   │   ├── notebook/   # ノートブックキャンバス
│   │   ├── notes/      # ノート管理
│   │   └── sidebar/    # サイドバー
│   ├── shared/         # 共有コンポーネント
│   ├── lib/            # ユーティリティ
│   └── types/          # 型定義
├── public/             # 静的ファイル
└── assets/             # アプリアイコン等
```

## ショートカットキー


### グローバル

| コマンド | 機能 |
|---------|-----|
| `Cmd+M` | 新規ページ作成 |
| `Cmd+D` | 選択項目の削除 |

### キャンバス操作

| コマンド | 機能 |
|---------|-----|
| `Cmd+N` | 新規テキストブロック追加 |
| `Cmd+P` | ペンモード切替 |
| `Cmd+E` | 消しゴムモード切替 |

### エディタ操作（テキスト編集中）

| コマンド | 機能 |
|---------|-----|
| `Cmd+B` | 太字 |
| `Cmd+I` | 斜体 |
| `Cmd+U` | 下線 |
| `Cmd+O` | 取り消し線 |
| `Cmd+1` | 番号なしリスト |
| `Cmd+2` | 番号付きリスト |
| `Cmd+3` | タスクリスト |
| `Cmd+L` | 左揃え |
| `Cmd+G` | 中央揃え |
| `Cmd+R` | 右揃え |
| `Cmd +` | フォント拡大 |
| `Cmd -` | フォント縮小 |

## トラブルシューティング

### Electron が起動しない

```bash
# Next.js のビルドを確認
npm run build

# electron/dist を再生成
npx tsc -p electron
```

### ポート 3000 が使用中

```bash
# 使用中のプロセスを確認
lsof -i :3000

# プロセスを終了
kill -9 <PID>
```

## ライセンス

Private - All rights reserved
