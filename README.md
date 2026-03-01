# Magic Memo

macOS 向けのデスクトップメモアプリケーション。Electron + Next.js で構築されています。

## 技術スタック

- **フロントエンド**: Next.js 16 + React 19 + TypeScript
- **デスクトップ**: Electron 39
- **スタイリング**: Tailwind CSS 4 + shadcn/ui
- **エディタ**: Tiptap (リッチテキスト)
- **リント/フォーマット**: Biome

## 開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

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
├── electron/              # Electron メインプロセス
│   ├── main.ts            # エントリーポイント
│   ├── preload.ts         # プリロードスクリプト
│   ├── handlers/          # IPC ハンドラー
│   ├── ipc/               # IPC 型定義
│   ├── store/             # データ永続化
│   ├── utils/             # ユーティリティ
│   └── window/            # ウィンドウ管理
├── src/
│   ├── app/               # Next.js App Router
│   ├── features/          # 機能別モジュール
│   │   ├── notebook/      # ノートブックキャンバス + エディタ
│   │   │   ├── components/  # UI コンポーネント
│   │   │   ├── extensions/  # Tiptap 拡張機能
│   │   │   └── hooks/       # カスタムフック
│   │   ├── notes/         # ノート管理
│   │   └── sidebar/       # サイドバー
│   │       ├── components/  # Desktop/Mobile 対応
│   │       └── hooks/       # 編集・検索・グループ化・ショートカット
│   ├── shared/            # 共有コンポーネント
│   ├── lib/               # ユーティリティ
│   └── types/             # 型定義
├── public/                # 静的ファイル
└── assets/                # アプリアイコン等
```

> 📚 詳細なアーキテクチャは [src/ARCHITECTURE.md](./src/ARCHITECTURE.md) を参照
>
> 📖 設計思想・こだわりは [KODAWARI.md](./KODAWARI.md) を参照
>
> 🤖 Claude Code 開発者向け情報は [CLAUDE.md](./CLAUDE.md) を参照

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
| `C` | コネクトモード切替 |

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
