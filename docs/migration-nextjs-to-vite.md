# Next.js → React + Vite 移行計画

## ステータス
**Draft** — 2026-03-01 作成

## 背景・動機

Magic Memo は Next.js (App Router) を採用しているが、以下の理由から React + Vite への移行を検討する。

### 現状の課題
- Next.js の主要機能（SSR/RSC、ファイルベースルーティング、API Routes、Middleware）をほぼ使用していない
- アプリ全体が SPA（単一ページ）で、全コンポーネントが `'use client'`
- `output: "export"` で静的出力しており、Next.js を「ビルドツール」としてのみ使用
- Electron 統合で `next/image` 無効化、`assetPrefix: "."` 等の回避策が必要

### 移行のメリット
- **ビルド速度**: Vite の方が dev 起動・HMR ともに高速
- **バンドルサイズ**: Next.js ランタイムが不要になり軽量化
- **設定のシンプルさ**: SSR 前提の回避策（`'use client'`、`ssr: false`）が不要
- **Electron 統合**: electron-vite 等の成熟したエコシステムが利用可能

---

## 影響範囲サマリー

| 分類 | ファイル数 | 作業内容 |
|------|----------|---------|
| 新規作成 | 3 | `index.html`, `src/main.tsx`, `vite.config.ts` |
| 書き換え | 4 | `package.json`, `tsconfig.json`, `electron/window/main-window.ts`, `src/app/error.tsx` → Error Boundary |
| 削除 | 4 | `next.config.ts`, `next-env.d.ts`, `src/app/layout.tsx`, `src/app/page.tsx` |
| 機械的修正 | 28 | `'use client'` ディレクティブの一括削除 |
| 変更なし | ~25 | features/、shared/、lib/、types/、electron/ の大部分 |

---

## Phase 1: Vite セットアップ（新規作成）

### 1.1 依存関係の入れ替え

```bash
# Next.js 関連を削除
npm uninstall next

# Vite 関連をインストール
npm install -D vite @vitejs/plugin-react
```

> **注意**: `react`, `react-dom`, `tailwindcss`, `@tailwindcss/postcss` 等はそのまま維持。

### 1.2 `vite.config.ts` を新規作成

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Electron 本番ビルド時に相対パスでアセットを読み込む
  base: './',
  build: {
    outDir: 'dist-web',
  },
})
```

### 1.3 `index.html` をプロジェクトルートに新規作成

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Magic Memo</title>
    <link rel="icon" href="/favicon.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### 1.4 `src/main.tsx` を新規作成

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ThemeProvider } from '@/shared/ui/theme-provider'
import { App } from '@/app'
import '@/app/globals.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

### 1.5 `src/app/index.tsx` を新規作成（旧 layout + page の統合）

```tsx
import { ErrorBoundary } from '@/app/error-boundary'
import { HomeContent } from '@/features/notes/components/home-content'

export const App = () => {
  return (
    <ErrorBoundary>
      <HomeContent />
    </ErrorBoundary>
  )
}
```

---

## Phase 2: Next.js 固有コードの置き換え

### 2.1 `src/app/layout.tsx` → 削除

`layout.tsx` の役割は Phase 1 で作成した `index.html` + `src/main.tsx` に移行済み。

**フォントの移行**:

`next/font/google` の代替として、CSS で直接読み込む。

```css
/* src/app/globals.css の先頭に追加 */
@import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap');
```

> **補足**: Electron オフライン対応が必要な場合は `@fontsource/geist` パッケージを使用する。
> ```bash
> npm install @fontsource/geist @fontsource/geist-mono
> ```
> ```tsx
> // src/main.tsx
> import '@fontsource/geist/variable.css'
> import '@fontsource/geist-mono/variable.css'
> ```

### 2.2 `src/app/page.tsx` → 削除

`HomeContent` を直接 `src/app/index.tsx` から呼び出すため不要。

### 2.3 `src/app/error.tsx` → `src/app/error-boundary.tsx` に書き換え

Next.js の App Router Error Boundary から React 標準の Error Boundary に変更。

```tsx
import { Component, type ReactNode } from 'react'

import { Button } from '@/shared/shadcn/button'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-xl font-semibold text-foreground">
              エラーが発生しました
            </h2>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message}
            </p>
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
              variant="outline"
            >
              再試行
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
```

### 2.4 `home-content.tsx` の `next/dynamic` → `React.lazy`

```diff
- import dynamic from 'next/dynamic'
+ import { lazy, Suspense } from 'react'

- const MotionPageWrapper = dynamic(
-   () => import('./motion-page-wrapper').then((mod) => ({ default: mod.MotionPageWrapper })),
-   { ssr: false },
- )
+ const MotionPageWrapper = lazy(() =>
+   import('./motion-page-wrapper').then((mod) => ({ default: mod.MotionPageWrapper })),
+ )
```

レンダリング箇所を `Suspense` で囲む:

```tsx
<Suspense fallback={null}>
  <MotionPageWrapper ... />
</Suspense>
```

### 2.5 `'use client'` ディレクティブの一括削除（28ファイル）

Vite ではすべてクライアントコンポーネントなのでディレクティブ不要。

```bash
# 対象ファイルから 'use client' 行を一括削除
grep -rl "'use client'" src/ | xargs sed -i '' "/^'use client'/d"
```

**対象ファイル一覧**:

<details>
<summary>28ファイル（クリックで展開）</summary>

- `src/app/error.tsx`
- `src/features/sidebar/components/app-sidebar.tsx`
- `src/features/sidebar/components/mobile-drawer.tsx`
- `src/features/sidebar/components/parts/page-list-item.tsx`
- `src/features/sidebar/components/parts/trash-section.tsx`
- `src/features/sidebar/components/parts/sidebar-header.tsx`
- `src/features/sidebar/components/desktop-sidebar.tsx`
- `src/features/notes/components/home-content.tsx`
- `src/features/notes/components/motion-page-wrapper.tsx`
- `src/features/notebook/components/blocks/rich-text-editor.tsx`
- `src/features/notebook/components/blocks/text-block.tsx`
- `src/features/notebook/components/toolbar/parts/text-formatting-tools.tsx`
- `src/features/notebook/components/toolbar/parts/text-align-tools.tsx`
- `src/features/notebook/components/toolbar/parts/canvas-mode-tools.tsx`
- `src/features/notebook/components/toolbar/parts/delete-button.tsx`
- `src/features/notebook/components/toolbar/parts/list-tools.tsx`
- `src/features/notebook/components/toolbar/parts/color-tools.tsx`
- `src/features/notebook/components/toolbar/ribbon-toolbar.tsx`
- `src/features/notebook/components/canvas/connection-layer.tsx`
- `src/features/notebook/components/canvas/notebook-canvas.tsx`
- `src/features/notebook/components/canvas/canvas-background.tsx`
- `src/shared/ui/theme-provider.tsx`
- `src/shared/ui/mode-toggle.tsx`
- `src/shared/shadcn/sheet.tsx`
- `src/shared/shadcn/scroll-area.tsx`
- `src/shared/shadcn/separator.tsx`
- `src/shared/shadcn/dropdown-menu.tsx`
- `src/shared/shadcn/context-menu.tsx`

</details>

---

## Phase 3: 設定ファイルの更新

### 3.1 `tsconfig.json` の修正

```diff
  {
    "compilerOptions": {
-     "plugins": [
-       {
-         "name": "next"
-       }
-     ],
      "paths": {
        "@/*": ["./src/*"]
      }
    },
    "include": [
-     "next-env.d.ts",
-     ".next/types/**/*.ts",
-     ".next/dev/types/**/*.ts",
      "**/*.ts",
      "**/*.tsx"
    ],
    "exclude": ["node_modules", "electron"]
  }
```

### 3.2 `package.json` の scripts 更新

```diff
  {
    "scripts": {
-     "dev": "next dev",
-     "build": "next build",
-     "start": "next start",
+     "dev": "vite",
+     "build": "tsc -b && vite build",
+     "preview": "vite preview",
      "lint": "biome check ./src ./electron",
      "lint:fix": "biome check --write ./src ./electron",
      "format": "biome format --write ./src ./electron",
-     "electron:dev": "concurrently -k \"npm run dev\" \"wait-on http://localhost:3000 && tsc -p electron && tsc-alias -p electron/tsconfig.json && electron .\"",
-     "electron:build": "npm run build && tsc -p electron && tsc-alias -p electron/tsconfig.json && electron-builder"
+     "electron:dev": "concurrently -k \"npm run dev\" \"wait-on http://localhost:5173 && tsc -p electron && tsc-alias -p electron/tsconfig.json && electron .\"",
+     "electron:build": "npm run build && tsc -p electron && tsc-alias -p electron/tsconfig.json && electron-builder"
    }
  }
```

### 3.3 `postcss.config.mjs` → 変更なし

Tailwind CSS v4 + PostCSS の構成はそのまま動作する。

### 3.4 `components.json`（shadcn/ui）→ 変更なし

`"rsc": false` のままで問題なし。shadcn CLI でコンポーネント追加時もそのまま動作する。

---

## Phase 4: Electron 統合の調整

### 4.1 `electron/window/main-window.ts` の修正

```diff
  if (isDev) {
-   mainWindow.loadURL('http://localhost:3000')
+   mainWindow.loadURL('http://localhost:5173')
  } else {
-   mainWindow.loadFile(path.join(app.getAppPath(), 'out/index.html'))
+   mainWindow.loadFile(path.join(app.getAppPath(), 'dist-web/index.html'))
  }

  mainWindow.webContents.on('will-navigate', (event, url) => {
-   const isAllowed = isDev ? url.startsWith('http://localhost:3000') : url.startsWith('file://')
+   const isAllowed = isDev ? url.startsWith('http://localhost:5173') : url.startsWith('file://')
    if (!isAllowed) {
      event.preventDefault()
    }
  })
```

### 4.2 `electron-builder` 設定の修正（`package.json`）

```diff
  "build": {
    "files": [
-     "out/**/*",
+     "dist-web/**/*",
      "electron/dist/**/*",
      "package.json"
    ]
  }
```

---

## Phase 5: 不要ファイルの削除

| ファイル | 理由 |
|---------|------|
| `next.config.ts` | Vite に置き換え済み |
| `next-env.d.ts` | Next.js 自動生成ファイル |
| `src/app/layout.tsx` | `index.html` + `main.tsx` に統合 |
| `src/app/page.tsx` | `src/app/index.tsx` に統合 |
| `src/app/error.tsx` | `error-boundary.tsx` に置き換え |
| `.next/` ディレクトリ | Next.js キャッシュ（`.gitignore` 済みなら不要） |
| `out/` ディレクトリ | 旧ビルド出力 |

---

## Phase 6: 動作確認チェックリスト

### Web 開発サーバー
- [ ] `npm run dev` で Vite 開発サーバーが起動する
- [ ] `http://localhost:5173` でアプリが表示される
- [ ] HMR（Hot Module Replacement）が動作する
- [ ] Tailwind CSS のスタイルが正しく適用される
- [ ] ダークモード切替が動作する
- [ ] Tiptap エディタが正常に動作する（テキスト入力、書式設定）
- [ ] キャンバス操作（ドラッグ、リサイズ、接続線）が動作する
- [ ] 手書き機能が動作する
- [ ] サイドバーのページ一覧・検索・グループ化が動作する
- [ ] localStorage へのデータ保存・読み込みが動作する

### Electron 開発モード
- [ ] `npm run electron:dev` で Electron アプリが起動する
- [ ] Vite 開発サーバーの待機→Electron 起動が正しく連携する
- [ ] electron-store へのデータ保存・読み込みが動作する
- [ ] IPC 通信（load-pages, save-pages 等）が動作する
- [ ] DevTools が開く

### Electron 本番ビルド
- [ ] `npm run electron:build` が成功する
- [ ] `dist-web/index.html` が生成される
- [ ] DMG インストーラーが生成される
- [ ] インストール後のアプリが正常に動作する

---

## ディレクトリ構成の変化

```diff
  memo_app/
+ ├── index.html                    # Vite エントリポイント（新規）
+ ├── vite.config.ts                # Vite 設定（新規）
- ├── next.config.ts                # 削除
- ├── next-env.d.ts                 # 削除
  ├── postcss.config.mjs            # 変更なし
  ├── tsconfig.json                 # 修正（Next.js plugin 削除）
  ├── package.json                  # 修正（scripts + 依存関係）
  ├── src/
+ │   ├── main.tsx                  # React エントリポイント（新規）
  │   ├── app/
- │   │   ├── layout.tsx            # 削除
- │   │   ├── page.tsx              # 削除
- │   │   ├── error.tsx             # 削除
+ │   │   ├── index.tsx             # App コンポーネント（新規）
+ │   │   ├── error-boundary.tsx    # Error Boundary（新規）
  │   │   └── globals.css           # フォント読み込み追加
  │   ├── features/                 # 変更なし（'use client' 削除のみ）
  │   ├── shared/                   # 変更なし（'use client' 削除のみ）
  │   ├── lib/                      # 変更なし
  │   └── types/                    # 変更なし
  └── electron/
      └── window/
          └── main-window.ts        # URL・パス修正
```

---

## リスクと緩和策

| リスク | 影響度 | 緩和策 |
|-------|-------|-------|
| Tailwind v4 + Vite の互換性問題 | 低 | Tailwind v4 は Vite をファーストクラスでサポート |
| shadcn/ui CLI が Vite 構成を認識しない | 低 | `components.json` の `css` パスが正しければ動作する |
| Electron HMR が不安定になる | 中 | `electron-vite` パッケージの導入を検討 |
| `@/` パスエイリアスの解決差異 | 低 | `vite.config.ts` の `resolve.alias` で対応済み |
| Google Fonts のオフライン読み込み | 中 | `@fontsource` パッケージで対応可能 |

---

## 将来的な検討事項

### electron-vite の採用
Vite移行後、`electron-vite` パッケージの採用を検討する価値がある。
- Electron の Main / Preload / Renderer すべてを Vite でビルド
- 現在の `tsc -p electron && tsc-alias` の手順が不要になる
- HMR がより安定する

### テストフレームワークの導入
Vite エコシステムに合わせて `Vitest` を導入する好機でもある。
- Vite の設定を共有でき、追加設定が最小限
- Jest 互換の API

---

## 参考リンク

- [Vite 公式ドキュメント](https://vite.dev/)
- [electron-vite](https://electron-vite.org/)
- [Tailwind CSS v4 + Vite](https://tailwindcss.com/docs/installation/using-vite)
- [shadcn/ui + Vite](https://ui.shadcn.com/docs/installation/vite)
