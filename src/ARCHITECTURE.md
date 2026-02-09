# アーキテクチャガイド

このドキュメントはプロジェクトのディレクトリ構造と依存関係ルールを定義します。

## ディレクトリ構造

```
src/
├── app/                   # Next.js App Router（ルーティングのみ）
├── features/              # 機能ベースのモジュール
│   ├── notes/             # ノート管理機能（アプリシェル・状態管理・永続化）
│   │   ├── components/    # home-content.tsx（各featureを統合するシェル）
│   │   ├── hooks/         # use-notes.ts, use-trash.ts
│   │   ├── services/      # note-storage.ts（ストレージアダプタ）
│   │   └── stores/        # note-store.ts（Zustand ストア）
│   ├── notebook/          # キャンバス＋エディタ機能
│   │   ├── components/    # canvas/, blocks/, toolbar/
│   │   ├── hooks/         # use-canvas-*.ts（レイアウト・操作・選択・ショートカット）
│   │   ├── extensions/    # TipTap拡張（font-size.ts）
│   │   ├── types.ts       # キャンバス関連型定義
│   │   └── constants.ts   # 定数（色・モードなど）
│   └── sidebar/           # サイドバー機能
│       ├── components/    # app-sidebar, desktop-sidebar, mobile-drawer, parts/
│       └── hooks/         # use-sidebar-*.ts（編集・グルーピング・検索・ショートカット）
├── shared/                # 共有コンポーネント
│   ├── shadcn/            # Shadcn UI コンポーネント（button, card, input 等）
│   └── ui/                # カスタム共通コンポーネント（theme-provider, mode-toggle）
├── lib/                   # プラットフォームアダプタ・ユーティリティ
│   ├── platform-events.ts # Electron IPC抽象化（ブラウザではno-op）
│   └── utils.ts           # 汎用ユーティリティ
└── types/                 # グローバル型定義（.d.ts で Electron/Web 共有）
    ├── note.d.ts          # NotePage, AppConfig, ElectronAPI 等
    └── electron.d.ts      # Electron環境の型拡張

electron/
├── main.ts                # メインプロセス（エントリーポイント）
├── preload.ts             # プリロードスクリプト（contextBridge）
├── handlers/              # IPCハンドラ
│   ├── ai-handlers.ts     # Gemini API連携（抽象化・転用・要約生成）
│   └── data-handlers.ts   # ページ・設定の永続化
├── ipc/                   # IPC関連
│   └── types.ts           # IPCチャンネル名定数と型の再エクスポート
├── store/                 # electron-store 永続化層
│   ├── pages-store.ts     # ページデータストア
│   └── config-store.ts    # アプリ設定ストア
├── utils/                 # ユーティリティ
│   ├── logger.ts          # electron-log 設定
│   └── validators.ts      # IPC入力バリデーション
└── window/                # ウィンドウ・メニュー管理
    ├── main-window.ts     # BrowserWindow 生成・セキュリティ設定
    └── menu.ts            # アプリケーションメニュー定義
```

## 依存関係ルール

### 依存方向図

```
app/ → features/*
        ↓
features/notes → features/notebook
              → features/sidebar
        ↓
features/* → shared/ → lib/ → types/
```

> **注記**: `features/notes/components/home-content.tsx` がアプリシェル（組み立て層）として
> notebook と sidebar を統合している。notebook と sidebar は互いに独立。

### 許可される依存方向

| 依存元 | 依存先 | 許可 |
|-------|-------|------|
| `app/` | `features/*` | ✅ |
| `features/notes` | `features/notebook` | ✅ |
| `features/notes` | `features/sidebar` | ✅ |
| `features/*` | `shared/` | ✅ |
| `features/*` | `lib/` | ✅ |
| `features/*` | `types/` | ✅ |
| `shared/` | `lib/` | ✅ |
| `shared/` | `types/` | ✅ |

> **既知の例外**: `types/note.d.ts` が `features/notebook/types.ts` から
> キャンバス関連型（CanvasObject, Stroke 等）を再エクスポートしている。
> これは型定義の Single Source of Truth を notebook 側に集約するための意図的な設計。

### 禁止される依存方向

| 依存元 | 依存先 | 理由 |
|-------|-------|------|
| `features/notebook` | `features/notes` | 循環依存 |
| `features/sidebar` | `features/notes` | 循環依存 |
| `features/notebook` | `features/sidebar` | Feature間の直接依存 |
| `features/sidebar` | `features/notebook` | Feature間の直接依存 |
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
