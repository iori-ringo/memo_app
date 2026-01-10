---
trigger: always_on
---

# Repository Guidelines

## Project Structure & Modules

- `src/app/`: Next.js App Router (pages, layout, global styles).
- `src/components/`: UI components (`shadcn/` for shadcn UI atoms, `ui/` for local components).
- `src/hooks/`: React hooks (name as `useXxx.ts`).
- `public/`: Static assets served at `/`.
- Config: `next.config.ts`, `tsconfig.json` (path alias `@/*` → `src/*`), `postcss.config.mjs` (Tailwind v4), `biome.json` (lint/format).

## Build, Test, and Development

- `npm run dev`: Start local dev server with Turbopack at `http://localhost:3000`.
- `npm run build`: Production build (`.next/`).
- `npm run start`: Start the production server (after `build`).
- `npm run lint`: Run Next + Biome lint rules.

Example:

```
npm run dev
# edit files in src/app/page.tsx, hot-reloads
```

## Coding Style & Naming

- Language: TypeScript, strict mode enabled.
- Formatting: Biome (tabs, width 2, single quotes, trailing commas, semicolons as needed). VS Code is configured to format and organize imports on save.
- Components: `PascalCase` filenames in `src/components`, exported React components in `.tsx`.
- Hooks: `camelCase` files named `useXxx.ts` in `src/hooks`.
- Imports: Prefer path aliases (e.g., `import { X } from '@/components/ui'`).
- Styling: Tailwind CSS v4 via `src/app/globals.css`.

## Testing Guidelines

- No test suite is configured yet. If adding tests, consider Vitest for unit tests and Playwright for E2E. Place tests near source files (`file.test.ts`), and add a `test` script in `package.json`.

## Commit & Pull Requests

- Commits: Keep them small and focused. If possible, follow Conventional Commits (`feat:`, `fix:`, `chore:`) for clarity and changelog generation.
- PRs: Include a concise description, screenshots/GIFs for UI changes, and link related issues. Ensure `npm run lint` passes and the app builds (`npm run build`).
- Branching: Use short, descriptive names (e.g., `feat/search-bar`, `fix/breadcrumb-a11y`).

## Notes & Tips

- File-based routing lives in `src/app` (e.g., `src/app/movies/page.tsx` → `/movies`).
- shadcn UI components are under `src/components/shadcn`; prefer extending locally in `src/components/ui`.
- If adding utilities, create `src/lib/` and import via `@/lib/...` to match existing aliases.

## 一般的な開発ルール

- コードフォーマットとリンティングには Biome を使用する
- TypeScript を厳密に使用 - `any`型は避ける（Biome で警告が出る）
- コンポーネントのスタイリングは Shadcn UI と Tailwind CSS で行う
- すべてのフォームは React Hook Form で実装する
- **Next.js Server Components を積極的に使用する（デフォルト・最重要）**
- より良いパフォーマンスのために Suspense とストリーミングを活用する
- Link は `@/core/paths` を使用してください（`paths.xxx.getHref()` 形式）
- 計画中で指示がない限りは、計画以外のコードの追加や編集は行わないで欲しい。
- コンポーネント作成、編集後は`npm run electron:dev`から実際のブラウザでの動作を確認し、依頼・計画通りの編集が行えているかを確認してください。

## コードフォーマット

- インデントスタイル: タブ
- インデント幅: 2
- インポートの整理: 有効
- 変更をコミットする前に`npm run lint`を実行する（Biome を使用）
- フォーマットの自動修正には`npm run lint:fix`を使用する
- コードフォーマットのみ適用する場合は`npm run format`を使用する

## コンポーネント開発ルール

- コンポーネントには`const`宣言を使用する（`function`ではない）
- React.FC 型注釈は使用しない
- **デフォルトで Server Components を使用する**（最重要）
- Client Components が必要な場合のみ `'use client'` ディレクティブを追加する
- すべてのコンポーネントに明示的に Props 型を定義する
- スタイリングは Shadcn UI と Tailwind CSS のみで行う
- すべてのフォーム実装に React Hook Form を使用する

### Server Component の基本方針

**すべてのコンポーネントはデフォルトで Server Component として実装します。**

#### Server Component を使用する場合

- データ取得（`features/*/services/` の関数を直接呼び出し）
- データベースアクセス
- バックエンド API の呼び出し
- 認証情報の取得
- 環境変数へのアクセス
- 大きな依存関係の使用（クライアントバンドルに含めない）

#### Client Component が必要な場合

以下の場合のみ `'use client'` ディレクティブを追加：

- インタラクション（`onClick`, `onChange` などのイベントハンドラ）
- 状態管理（`useState`, `useReducer`）
- ライフサイクルフック（`useEffect`, `useLayoutEffect`）
- ブラウザ専用 API（`window`, `localStorage` など）
- カスタムフック（`use-xxx.ts`）の使用
- サードパーティライブラリ（Recharts など）の使用

#### データ取得のパターン

```typescript
// ✅ 正しい: Server Component でデータ取得
// app/(tow_column)/projects/page.tsx
import { getProjects } from '@/features/project-list/services/get-projects'

export default async function ProjectsPage() {
 const projects = await getProjects()
 return <ProjectListSection projects={projects} />
}

// ✅ 正しい: Suspense でラップ
import { Suspense } from 'react'
import { ProjectListSkeleton } from '@/features/project-list/components/project-list-skeleton'

export default function ProjectsPage() {
 return (
  <Suspense fallback={<ProjectListSkeleton />}>
   <ProjectListContent />
  </Suspense>
 )
}

// ❌ 避ける: Client Component でデータ取得
'use client'
export const ProjectsPage = () => {
 const [projects, setProjects] = useState([])
 useEffect(() => {
  fetch('/api/projects').then(...) // 避ける
 }, [])
}
```

## チャート実装方針（標準ルール）

- サーバー/クライアント分離: デフォルトは Server Component（データ準備・合計計算など）→ Client Component（Recharts とインタラクション）。
- Suspense + Skeleton: 各チャートに Skeleton を用意し、ページ側では Suspense の fallback に Skeleton を指定する。
- ディレクトリ/ファイル構成:
  - 単体チャート: `src/app/(...)/_components/<chart-name>/index.tsx`（Server）/ `client.tsx`（Client）/ `skeleton.tsx`（Skeleton）
  - バリエーション（例: フォロワー層の円グラフ）: `segment.tsx`（Server）/ `segment-client.tsx`（Client）/ `segment-skeleton.tsx`（Skeleton）
- 型と命名: すべての Props は明示的な型。`const ComponentName = (props: Props) => {}` を使用し、React.FC は使用しない。
- UI 構成: shadcn の `Card` + `ChartContainer` を基本に、色は ChartConfig で `--color-<key>` 変数を設定して Recharts に適用する。
- コードスタイル: Biome に従い、`import type` を使用して型インポートを明示する。インポート順序も整える。
- ページでの使用例:
  - `import { FooChart } from '@/app/(...)/_components/foo-chart'`
  - `<Suspense fallback={<FooChartSkeleton />}> <FooChart /> </Suspense>`

## コンポーネント利用

- form の field は基本的に form-field を利用してください。
- 極力 component で利用してください
- 再利用可能なものは component 化してください

## ディレクトリ構造ルール

### `/src/app/` - App Router

Next.js App Router のルーティングとページコンポーネントを配置します。

#### 基本構造

- **ページコンポーネント**: `page.tsx` - 各ルートのページコンポーネント（デフォルトで Server Component）
- **レイアウトコンポーネント**: `layout.tsx` - レイアウト定義（デフォルトで Server Component）
- **API ルート**: `route.ts` - API エンドポイント（Route Handler）
- **動的ルート**: `[param]` フォルダ形式を使用（例: `[project_id]/page.tsx`）

#### 実装方針

- **デフォルトで Server Component**: すべての `page.tsx` と `layout.tsx` は Server Component として実装
- **データ取得**: Server Component 内で直接 `features/*/services/` の関数を呼び出してデータを取得
- **Suspense の活用**: 非同期データ取得を行う場合は Suspense でラップし、適切な fallback を設定
- **Client Component の最小化**: インタラクションが必要な場合のみ Client Component を使用し、`features/*/components/` に配置

### `/src/shared/` - 共有コンポーネントとユーティリティ

プロジェクト全体で共有されるコンポーネント、レイアウト、API クライアントを配置します。

#### ディレクトリ構造

- **`ui/`** - ローカルで作成した再利用可能な UI コンポーネント
  - `buttons/` - ボタンコンポーネント（例: `add-link-button.tsx`）
  - その他の UI コンポーネント（例: `date-picker.tsx`, `paginate.tsx`, `title.tsx`）
  - 基本的に Server Component として実装（必要に応じて Client Component も可）

- **`shadcn/`** - Shadcn UI のコンポーネント
  - Shadcn UI からインストールしたコンポーネント（例: `button.tsx`, `card.tsx`, `pagination.tsx`）
  - 直接編集せず、必要に応じて `ui/` で拡張

- **`layouts/`** - レイアウトコンポーネント
  - サイドバー、ヘッダーなどのレイアウト要素（例: `sidebar.tsx`）

- **`api/`** - API クライアント関連
  - `core/` - API コア機能（例: `http.ts` - HTTP クライアントの設定）

#### 注意点

- `shared/` のコンポーネントは複数の機能で使用される汎用的なもの
- 機能固有のコンポーネントは `features/*/components/` に配置
- 基本的に Server Component として実装

### `/src/core/` - コア機能

アプリケーション全体で使用されるコア機能を配置します。

- **`paths.ts`** - ルーティングパスの定義
  - すべてのリンク生成に使用するパス定義
  - `paths.xxx.getHref()` 形式で使用（例: `paths.projects.new.getHref()`）
  - **重要**: ハードコードされたパス文字列は使用せず、必ず `paths` から取得

### `/src/lib/` - ユーティリティ関数

汎用的なユーティリティ関数を配置します。

- **`utils.ts`** - 共通ユーティリティ関数
  - 例: `cn()` - Tailwind CSS クラス名のマージ関数
  - 複数のユーティリティがある場合は適切に分割

### `/src/types/` - グローバルな型定義

プロジェクト全体で使用される型定義を配置します。

- 機能固有でない型定義（例: `api-error.ts`, `paging.ts`, `auth.d.ts`）
- 機能固有の型は `features/*/types.ts` に配置
- 型定義ファイルは `kebab-case.ts` で命名

### `/src/api-client/` - API クライアント

API クライアントの設定やカスタマイズを配置します。

- **`custom-fetch.ts`** - カスタム fetch 関数の設定
- Orval などで生成された API クライアントもここに配置

### `/src/features` - 各機能ごとのフォルダ

機能ごとにフォルダを分割し、各機能に関連するコンポーネント、フック、サービス、型定義を集約します。

#### 1階層目（機能フォルダ）

機能ごとにフォルダを作成します（例: `auth`, `dashboard`, `project-list`, `project-detail`）。

#### 2階層目以降の標準構造

各機能フォルダ内には以下のディレクトリとファイルを配置します：

- **`components/`** - その機能専用のコンポーネント
  - 基本的に Server Component として実装（デフォルト）
  - インタラクションが必要な場合のみ Client Component（`'use client'` ディレクティブを使用）
  - コンポーネントは `PascalCase` で命名（例: `ProjectCard.tsx`, `SearchFilter.tsx`）
  - 必要に応じて `index.ts` を作成してエクスポートを集約

- **`hooks/`** - その機能専用の React フック
  - Client Component で使用するカスタムフック
  - ファイル名は `use-xxx.ts` 形式（例: `use-schedule-calendar.ts`）
  - Server Component では使用しない（Server Component では直接データ取得関数を呼び出す）

- **`services/`** - その機能の外部連携やビジネスロジック
  - API 呼び出し、データ取得、認証処理など
  - Server Component から直接呼び出される非同期関数
  - ファイル名は `kebab-case.ts`（例: `get-current-account.ts`, `auth.ts`）
  - **注意**: 命名は `services/`（複数形）で統一する（`service/` は使用しない）

- **`types.ts`** - その機能専用の型定義
  - 機能固有の型やインターフェースを定義
  - 複数の型を定義する場合は単一の `types.ts` に集約
  - 必要に応じて `types/` ディレクトリに分割することも可能

- **`index.ts`**（オプション）- エクスポートの集約
  - 機能フォルダ外から使用する際のエントリーポイント
  - コンポーネントやサービスを再エクスポート

#### 実装方針（Server Component 優先）

- **デフォルトは Server Component**: すべてのコンポーネントは Server Component として実装する
- **Client Component は必要最小限**: インタラクション（onClick、useState、useEffect など）が必要な場合のみ `'use client'` ディレクティブを追加
- **データ取得は Server Component で**: `services/` の関数を Server Component から直接呼び出してデータを取得
- **Suspense の活用**: 非同期データ取得を行うコンポーネントは Suspense でラップし、適切な fallback を設定

#### 命名規則の統一

- ディレクトリ名: `kebab-case`（例: `project-list`, `project-detail`）
- サービスディレクトリ: 必ず `services/`（複数形）を使用
- コンポーネントファイル: `PascalCase.tsx`（例: `ProjectCard.tsx`）
- フックファイル: `use-xxx.ts`（例: `use-schedule-calendar.ts`）
- サービスファイル: `kebab-case.ts`（例: `get-current-account.ts`）

#### 構造例

```
src/features/
├── auth/
│   ├── components/
│   │   └── required-auth.tsx        # Server Component
│   ├── services/
│   │   ├── auth.ts                  # 認証サービス
│   │   └── get-current-account.ts   # 現在のアカウント取得
│   └── index.ts                     # エクスポート集約
├── project-list/
│   ├── components/
│   │   ├── project-card.tsx         # Server Component
│   │   ├── project-list-section.tsx # Server Component
│   │   ├── search-filter.tsx        # Client Component（インタラクション）
│   │   └── index.ts                 # エクスポート集約
│   ├── services/
│   │   └── get-projects.ts          # プロジェクト一覧取得
│   └── types.ts                     # 型定義
└── dashboard/
    ├── components/
    │   ├── analytics-section.tsx    # Server Component
    │   ├── charts-section.tsx        # Client Component（Recharts使用）
    │   └── index.ts                 # エクスポート集約
    ├── hooks/
    │   ├── use-schedule-calendar.ts # カレンダー用フック
    │   └── use-schedule-events.ts   # イベント用フック
    └── services/
        └── get-dashboard-data.ts    # ダッシュボードデータ取得
```

## テストコマンド

- リント: `npm run lint` - Biome を使用してコードの問題をチェック
- リント修正: `npm run lint:fix` - Biome で自動修正可能な問題を修正
- フォーマット: `npm run format` - Biome でコードをフォーマット

## 状態管理

- React の組み込み状態管理を使用する（useState、useContext）
- グローバル認証状態には AuthContext を使用する
- 可能な限りクライアントサイドの状態を最小限にする

## パフォーマンスガイドライン

- デフォルトで Server Components を使用する
- Suspense で適切なローディング状態を実装する
- 大きなデータセットを取得する際はレスポンスをストリーミングする
- Next.js Image コンポーネントで画像を最適化する
- HTML `<img>` タグの代わりに Next.js の `<Image />` コンポーネントを必ず使用する

## セキュリティガイドライン

- 秘密情報や API キーを決してハードコーディングしない
- すべての設定に環境変数を使用する
- すべてのユーザー入力を検証する
- レンダリング前にデータをサニタイズする
- すべての外部リクエストに HTTPS を使用する

## 最終ルール - 新しいルールの追加プロセス

ユーザーから今回限りではなく常に対応が必要だと思われる指示を受けた場合:

1. 「これを標準のルールにしますか？」と質問する
2. YES の回答を得た場合、CLAUDE.md に追加ルールとして記載する
3. 以降は標準ルールとして常に適用する

このプロセスにより、プロジェクトのルールを継続的に改善していきます。

## テスト

検証は下記のコマンドを実行してください。

```
npm run build
npm run lint
```

## 他の部分のコーディングに関して

- 今回のMACOS用のデスクトップアプリのメモアプリのベストプラクティスを探索し、それに従ったコードの作成、編集、修正をお願いします。
- そして、この探索したベストプラクティスはこの.agent/rules/code-guide.mdの「## MACOS用のデスクトップアプリのメモアプリのベストプラクティス」に項目として追記して欲しい。

## MACOS用のデスクトップアプリのメモアプリのベストプラクティス

npm rnu typecheck は実行不要です。
