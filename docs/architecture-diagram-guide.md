# システムアーキテクチャ図 — 編集ガイド ⇒ 一旦はないよ理解したわ

作成日: 2026-02-28

このドキュメントは、Magic Memo のシステムアーキテクチャ図（draw.io）に対する
アイコン選定・色定義・説明文の編集方針をまとめたものです。

---

## 1. 図の概要

- **C4 レベル**: L3（Component）、L2 をグループ枠として使用
- **構成**: 5 層の水平レイヤー + 右側に型システム（SSoT）
- **目的**: Electron アプリのデータフロー（UI → 状態管理 → IPC → ストレージ）を可視化

### レイヤー構成

| レイヤー | 名称 | 枠色 |
|---------|------|------|
| Layer 1 | フロントエンド (React / Next.js) | 青 `#1565C0` |
| Layer 2 | プラットフォーム抽象化層 | 青 `#1565C0` |
| Layer 3 | プリロードブリッジ (Electron) | 紫 `#6A1B9A` |
| Layer 4 | メインプロセス (Electron) | 紫 `#6A1B9A` |
| Layer 5 | データストレージ | グレー `#999999` |
| 右側 | 型システム (SSoT) | グレー点線 `#999999` |

---

## 2. Google Fonts アイコン選定一覧

AWS アイコンは AWS 非利用サービスでの使用が規約違反のため、
Google Fonts (Material Symbols) で代用する。

| # | コンポーネント | Google Fonts アイコン | 選定理由 |
|---|--------------|----------------------|---------|
| 1 | Next.js App Router | `deployed_code` | デプロイ済みコードの箱型アイコン。アプリケーション全体の基盤・エントリーポイントとしての役割を表現 |
| 2 | Notebook Canvas | `dashboard_customize` | カスタマイズ可能なダッシュボード。ブロックを自由に配置・編集するキャンバスの性質を表現 |
| 3 | Zustand ストア | `memory` | RAM チップの形。揮発性のインメモリ状態管理で高速にデータを保持・アクセスする性質を表現 |
| 4 | AppSidebar | `view_sidebar` | サイドバーそのもの。アプリ全体のナビゲーションを統括する管理画面的な役割が直感的に伝わる |
| 5 | 共有UI (shadcn/ui) | `widgets` | 複数の図形が組み合わさったウィジェット群。テンプレートベースの UI コンポーネント集合を表現 |
| 6 | Platform Adapter 層 | `hub` | 放射状に接続が伸びる中継点。Web/Desktop 間の差異を吸収する抽象化レイヤー・ルーティングハブを表現 |
| 7 | contextBridge | `shield` | 盾の形。contextIsolation/sandbox による Renderer↔Main 間のセキュリティ境界を表現 |
| 8 | IPC ハンドラー | `bolt` | 雷マーク。イベント（IPC メッセージ）が到着したら即座に発火する、イベント駆動型の処理モデルを表現 |
| 9 | バリデーション (Zod) | `fact_check` | チェックマーク付きドキュメント。定義済みスキーマへの準拠を検査するバリデーション処理を表現 |
| 10 | main-window | `desktop_windows` | デスクトップウィンドウ。BrowserWindow が UI コンテンツをユーザーに届ける最終的な配信口を表現 |
| 11 | menu.ts | `settings` | 歯車マーク。メニュー・トレイ・ウィンドウ操作などシステムレベルの管理・設定を統括する役割を表現 |
| 12 | electron-store | `database` | 円柱型の DB アイコン。JSON ベースの Key-Value 形式で永続化される構造化データストアを表現 |
| 13 | localStorage | `storage` | ストレージデバイスの形。シンプルな Key-Value ストレージとして、`database`（構造化永続ストア）との役割差を明確に区別 |
| 14 | 型定義 | `data_object` | `{ }` の記号。全レイヤーから参照されるデータ構造・型定義パッケージであることを表現 |

---

## 3. カラーコード定義

### アイコン背景色（コンポーネントの所属を示す）

| 分類 | 背景色 | 線・枠色 | アイコン色 | 用途 |
|------|--------|---------|-----------|------|
| 共有レイヤー | `#DBEAFE` | `#2563EB` | `#1D4ED8` | Web/Desktop 共通のコア・共通 UI |
| Web 固有 | `#DCFCE7` | `#16A34A` | `#15803D` | Next.js、ブラウザ API |
| Desktop 固有 | `#EDE9FE` | `#7C3AED` | `#6D28D9` | Electron、IPC、Native API |
| 外部システム | `#FFF7ED` | `#EA580C` | `#C2410C` | 外部 API・サードパーティ |

> Tailwind CSS の色スケールベース（blue/green/violet/orange の 100/600/700）で統一。

### 色の2軸表現

| 軸 | 表現手段 | 伝えていること |
|---|---------|-------------|
| レイヤー枠 | 枠の色と配置 | データフローの階層（UI → 状態管理 → IPC → ストレージ） |
| アイコン背景色 | 背景色 | そのコンポーネントが共有 / Web 固有 / Desktop 固有のどれか |

> 同じレイヤー枠内に異なるアイコン色が混在するのは正しい表現。
> 例: Layer 4（紫枠）内のバリデーション（Zod）は青アイコン = 共有ロジック。

### 各コンポーネントのアイコン色割り当て

#### 🟦 青（共有レイヤー）
- Zustand ストア / 共有UI (shadcn/ui) / Platform Adapter 層 / バリデーション (Zod) / 型定義

#### 🟩 緑（Web 固有）
- Next.js App Router / localStorage

#### 🟪 紫（Desktop 固有）
- contextBridge / IPC ハンドラー / main-window / menu.ts / electron-store

#### Notebook Canvas / AppSidebar について
- 現在は青（共有）。Desktop でも共有する設計のため。
- Web 専用にする場合は緑に変更する。

---

## 4. 説明文の編集方針

### 原則

- **L3 の粒度**: 「何をするか（責務）」を 1〜2 行で記述する
- **書くべきもの**: 名前（1 行目）、責務の要約、技術スタック（括弧書き）
- **書かないもの**: フック名、コンポーネント名、関数名、ファイル名（= L4 の詳細）

### 修正一覧

| # | コンポーネント | 修正前 | 修正後 |
|---|--------------|--------|--------|
| 1 | Next.js App Router | `layout.tsx` / `page.tsx` | Web アプリの基盤・ルーティング制御 [Next.js App Router] |
| 2 | Notebook Canvas | ラベル: `Canvas` / `TextBlock` | ラベル: **Notebook Canvas** / 説明文: ブロックの配置・選択・並べ替え・テキスト編集を提供するエディタ領域。Connect / Pen / Eraser モードの切り替え |
| 3 | Zustand ストア | `useNotes` / `useNotesWithStorage` | ページ・ノートの状態を一元管理するインメモリストア [Zustand] |
| 4 | AppSidebar | `検索 / ページグルーピング` / `PageListItem / NoteListItem` | 検索・ページグルーピング・ナビゲーションを提供するサイドバー |
| 5 | 共有UI (shadcn/ui) | `Button \| Card \| Sheet \| ...` の全コンポーネント列挙 | 両環境で共有するテンプレートベースの UI コンポーネント群 [shadcn/ui / Tailwind CSS / Radix UI] |
| 6 | note-storage.ts | ラベルのみ（説明文なし） | データ永続化の抽象化インターフェース |
| 7 | platform-events.ts | ラベルのみ（説明文なし） | プラットフォーム間イベント通知の抽象化 |
| 8 | データハンドラー | `ページ / 設定 / ノート` | ページ・設定データの読み書きとバリデーション |
| 9 | ウィンドウ管理 | `BrowserWindow / Tray` | ウィンドウの生成とメニュー・ショートカットの定義 |
| 10 | 型定義 | 全型名の列挙（`Page \| NoteBlock \| ...`） | 以下の折衷案を採用（後述） |

### 型定義の記述（例外的に詳細を残す）

型定義は他のコンポーネントと異なり「全レイヤーが参照する契約」であるため、
ファイル名 + 役割の記述を残す。

```
note.d.ts — ドメインモデル定義
ipc/types.ts — IPC 通信の型契約
validators.ts — 入出力スキーマ定義
```

### contextBridge の補足テキスト

`contextIsolation: true | sandbox: true` はアーキテクチャ上の制約・方針であり、
L4 の実装詳細ではないため、contextBridge のボックス内にそのまま残す。

---

## 5. 凡例（Legend）の定義

### 矢印

| スタイル | 意味 |
|---------|------|
| 実線 → | データフロー |
| 紫点線 → | イベントフロー |
| グレー細点線 → | 型共有 |
| 黒破線 → | Web 直接アクセス |

### 境界線色

| 色 | 意味 |
|---|------|
| 🟦 青 `#1565C0` | 共有レイヤー (Web / Desktop 共通) |
| 🟪 紫 `#6A1B9A` | Desktop 固有 (Electron) |
| 🟩 緑 | Web 固有 (Next.js / ブラウザ API) |

### 技術スタック（凡例フッター）

```
TypeScript | Next.js (App Router) | Electron | Zustand | shadcn/ui | Tailwind CSS
```

---

## 6. 設計上の補足事項

### データ保存の現状

- 全ページデータを丸ごと上書き保存（差分保存ではない）
- デバウンスなし（状態変更のたびに即座に保存）
- electron-store の `atomicWrite: true`（デフォルト）により書き込み中のデータ破損は防止
- ゴミ箱機能（論理削除 + 14 日間の自動クリーンアップ）あり

### Web / Desktop の環境切り替え

- `window.electronAPI` の有無で自動判定
- Web 環境: localStorage で永続化
- Desktop 環境: IPC → electron-store（JSON ファイル）で永続化
- `platform-events.ts` は Web 環境で no-op 関数を返す（エラーにならない）
