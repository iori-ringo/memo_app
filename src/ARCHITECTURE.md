# アーキテクチャガイド

このドキュメントはプロジェクトのディレクトリ構造と依存関係ルールを定義します。

## ディレクトリ構造

```
src/
├── app/                   # Next.js App Router（ルーティングのみ）
├── features/              # 機能ベースのモジュール
│   ├── notes/             # ノート管理機能
│   ├── notebook/          # ノートブックキャンバス機能
│   ├── editor/            # リッチテキストエディタ機能
│   └── sidebar/           # サイドバー機能
├── shared/                # 共有コンポーネント
│   ├── ui/                # Shadcn UI コンポーネント
│   └── common/            # 共通コンポーネント（テーマなど）
├── lib/                   # ユーティリティ関数
└── types/                 # グローバル型定義

electron/
├── main.ts                # メインプロセス
├── preload.ts             # プリロードスクリプト
└── ipc/                   # IPC関連
    └── types.ts           # IPCチャンネル名と型
```

## 依存関係ルール

### 依存方向図

```
app/ → features/*
        ↓
features/notes → features/notebook
              → features/editor
              → features/sidebar
        ↓
features/* → shared/ → lib/ → types/
```

### 許可される依存方向

| 依存元 | 依存先 | 許可 |
|-------|-------|------|
| `app/` | `features/*` | ✅ |
| `features/notes` | `features/notebook` | ✅ |
| `features/notes` | `features/editor` | ✅ |
| `features/notes` | `features/sidebar` | ✅ |
| `features/*` | `shared/` | ✅ |
| `features/*` | `lib/` | ✅ |
| `features/*` | `types/` | ✅ |
| `shared/` | `lib/` | ✅ |
| `shared/` | `types/` | ✅ |

### 禁止される依存方向

| 依存元 | 依存先 | 理由 |
|-------|-------|------|
| `features/notebook` | `features/notes` | 循環依存 |
| `features/editor` | `features/notes` | 循環依存 |
| `features/sidebar` | `features/notes` | 循環依存 |
| `shared/` | `features/*` | 共有レイヤーから機能レイヤーへの依存 |
| `lib/` | `features/*` | ユーティリティから機能レイヤーへの依存 |

## Feature間でデータを共有する場合

Feature間でデータを共有する必要がある場合は、以下の方法を使用してください：

1. **Props経由**: 親コンポーネントからPropsとして渡す
2. **コンテキスト**: Reactコンテキストを使用して状態を共有
3. **コールバック**: 関数をPropsとして渡してイベントを通知

**直接importは禁止です。**

## ファイル命名規則

| ファイル種別 | 命名規則 | 例 |
|------------|---------|---|
| コンポーネント | `kebab-case.tsx` | `home-content.tsx` |
| フック | `use-xxx.ts` | `use-notes.ts` |
| サービス | `kebab-case.ts` | `note-storage.ts` |
| 型定義 | `types.ts` または `*.d.ts` | `types.ts` |

## IPC通信

Electron IPC通信では、`electron/ipc/types.ts`で定義された`IPC_CHANNELS`定数を使用してください。

```typescript
import { IPC_CHANNELS } from './ipc/types'

// ✅ 正しい
ipcMain.handle(IPC_CHANNELS.LOAD_PAGES, async () => { ... })

// ❌ 避ける
ipcMain.handle('load-pages', async () => { ... })
```
