# ADR-0001: フロントエンドフレームワークに Next.js を採用

## ステータス
Accepted

## 日付
2026-03-01

## コンテキスト

Magic Memo は「事実 → 抽象化 → 転用」メソッドに基づくキャンバスベースのメモアプリである。
プロダクト開発を以下の段階的なアプローチで進める方針をとった。

### 開発フェーズの全体像

```
Phase 1（現在）: プロダクト検証フェーズ
  - Electron + ローカル保存でデスクトップアプリとして構築
  - 「このメモ手法が本当に有用か」を自分自身で検証する
  - 最小限の構成で素早くプロトタイプを作る

Phase 2（検証後）: Web 版リリース
  - DB（Supabase 等）+ 認証（Clerk 等）を導入
  - Web 版として公開し、他ユーザーにも使ってもらう
  - Next.js の SSR / API Routes を本格活用する

Phase 3（拡張）: ノート共有・ソーシャル機能
  - /share/[noteId] による公開ノートページ
  - SSR + generateMetadata で OGP プレビュー対応
  - AI 機能の Web 版対応（Server Actions / Route Handlers）
```

### Phase 1 における課題

Phase 1 はローカルベースの SPA であり、フレームワークとしての要件は以下の通り。

- React + TypeScript でキャンバスベースの UI を構築できること
- Tailwind CSS + shadcn/ui が利用できること
- Electron と統合できること（静的出力 or dev サーバー経由）

この要件だけを見れば **Vite + React でも十分に満たせる**。
しかし、Phase 2 以降を見据えた時、フレームワーク選定の判断が変わる。

---

## 決定

フロントエンドフレームワークとして **Next.js（App Router）** を採用する。

Phase 1 では `output: "export"` による静的出力で Electron と統合し、
Phase 2 以降で SSR / API Routes / Server Actions 等の機能を段階的に有効化する。

---

## 根拠

### 1. Phase 2 への移行コストの最小化

Phase 2 では以下の作業が発生する。

| 作業 | Next.js を使用している場合 | Vite から移行する場合 |
|------|------------------------|-------------------|
| SSR の有効化 | `output: "export"` を削除するだけ | Next.js への移行作業が発生 |
| API Routes の追加 | `src/app/api/` にファイルを置くだけ | フレームワーク移行 + API 設計 |
| `generateMetadata` の利用 | 既に `Metadata` 型を使用中 | Next.js 導入後にページ構成を再設計 |
| Server Actions | `'use server'` を追加するだけ | フレームワーク移行が前提 |
| デプロイ（Vercel） | ゼロコンフィグ | Vercel Adapter の設定が必要 |

Next.js → Next.js 本格活用は**設定変更と機能追加**で済むが、
Vite → Next.js は**フレームワーク移行**という本質的に異なる作業になる。

差分は半日〜1日程度と小さいが、**わざわざ往復する合理的な理由がない**。

### 2. 開発者の習熟度

- インターンで Next.js を使用した実務経験がある
- App Router / Server Components / API Routes の実装パターンに慣れている
- トラブルシューティングの知見が蓄積されている

フレームワークへの習熟度は開発速度に直結するため、
特に個人開発においては「慣れている技術を選ぶ」ことの価値が大きい。

### 3. Phase 1 でも最低限の恩恵がある

Next.js 固有機能の活用度は現時点では低いが、ゼロではない。

| 機能 | 現在の利用状況 |
|------|-------------|
| `next/font/google` | Geist フォントの最適化読み込みに使用 |
| `Metadata` API | title / description / favicon の設定に使用 |
| `next/dynamic` | Framer Motion の動的インポートに使用 |
| 開発サーバー（`next dev`） | Electron 開発時の HMR に使用 |

### 4. エコシステムとの親和性

- **shadcn/ui**: Next.js をファーストクラスでサポート。CLI の `npx shadcn@latest add` がそのまま動作する
- **Vercel**: Phase 2 でのデプロイ先として最有力。Next.js ならゼロコンフィグ
- **next-themes**: テーマ管理に使用中。Next.js との統合が最もスムーズ

---

## 現フェーズでの制約と対応

Next.js を採用しつつ、Phase 1 では以下の制約が存在する。

| 制約 | 原因 | 対応 |
|------|------|------|
| SSR が使えない | Electron は静的ファイルを読み込む | `output: "export"` で SSG 出力 |
| 全コンポーネントが `'use client'` | SSR 不要のため Server Components の恩恵なし | Phase 2 で段階的に Server Components 化 |
| `next/image` が使えない | 静的出力では画像最適化サーバーがない | `unoptimized: true` で無効化 |
| API Routes が使えない | ローカルアプリのためサーバーがない | Electron IPC で代替 |

これらは Phase 2 で SSR / サーバーデプロイに移行した時点で自然に解消される。

---

## 却下した選択肢

| 選択肢 | 却下理由 |
|--------|---------|
| **Vite + React** | Phase 1 単体では最適だが、Phase 2 で Next.js への移行が発生する。往復のコストは小さいが、合理的な理由がない |
| **Remix** | SSR フレームワークとして有力だが、Electron との統合実績が Next.js より少ない。開発者の習熟度も低い |
| **Astro** | コンテンツサイト向き。キャンバスベースのインタラクティブアプリには不向き |
| **SvelteKit** | React エコシステム（Tiptap, shadcn/ui, Framer Motion 等）が使えなくなる |

---

## Phase 移行時の変更計画

### Phase 1 → Phase 2 で必要な変更

```diff
  next.config.ts:
-   output: "export"
-   assetPrefix: "."
-   images: { unoptimized: true }
+   // SSR モードに移行（デフォルト設定）
+   images: { remotePatterns: [...] }

  src/app/:
+   api/                          # API Routes 追加
+     auth/[...nextauth]/route.ts # 認証エンドポイント
+     notes/route.ts              # ノート CRUD API
+     ai/route.ts                 # AI 機能プロキシ
+   share/[noteId]/page.tsx       # 公開ノートページ（SSR）
+   dashboard/page.tsx            # ダッシュボード
+   settings/page.tsx             # 設定画面

  src/features/notes/services/:
-   note-storage.ts               # localStorage / electron-store
+   note-storage.ts               # DB クライアント（Supabase 等）に置き換え
```

### Electron 版との共存

Phase 2 以降も Electron 版は維持する。Web 版と Electron 版の切り替えは
既存の Platform Adapter パターン（`note-storage.ts`）を拡張して対応する。

```
Web 版:    Next.js SSR → DB → ブラウザ
Electron:  Next.js export → electron-store → ローカル
```

---

## 影響

- **開発体験**: Phase 1 では `'use client'` の記述が必須など、若干の冗長性がある
- **ビルド速度**: Vite と比較して dev 起動・HMR がやや遅い（許容範囲）
- **バンドルサイズ**: Next.js ランタイムが含まれるが、デスクトップアプリでは実質的な影響は軽微
- **Phase 2 移行**: SSR 有効化 + DB 導入 + 認証導入が主な作業。フレームワーク移行は不要

---

## 関連

- `docs/migration-nextjs-to-vite.md` — Vite 移行計画（Phase 2 に進まない場合の代替案として保持）
- `CLAUDE.md` — アーキテクチャ原則・クロスプラットフォーム設計指針
- `ai-docs/WHY-Zustand.md` — 状態管理の技術選定（関連する ADR）
