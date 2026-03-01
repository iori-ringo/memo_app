# メモアプリにおける Zustand 採用理由と設計手法

このメモアプリでは、アプリケーションのグローバルな状態管理（SSoT: Single Source of Truth）として **Zustand** を採用しています。
このドキュメントでは、なぜ `useState` や Context API 等から Zustand へ移行したのか、その動機・メリット・具体的な実装スタイルについて解説します。

---

## 1. 移行の動機と優先度

`useState` → Zustand への移行は、以下の **3つの動機** によるものです。

| 優先度 | 動機 | 解決した問題 |
|---|---|---|
| ⭐⭐⭐ | **パフォーマンス** | Context API の無駄な再レンダリング |
| ⭐⭐ | **ロジックの凝集** | コンポーネントの肥大化・Prop Drilling |
| ⭐⭐ | **副作用の分離** | `useEffect` による自動保存の複雑さ |

「コードを簡潔にする」だけなら Context API でも一応対応できますが、**パフォーマンスと自動保存の設計**まで含めて考えると、Zustand が最適という総合判断です。

---

## 2. パフォーマンス問題の解決（最大の理由）

### Context API の問題

`useState` で Prop Drilling を避けるために Context API を使うと、状態の一部が更新されただけで、**その Context を参照している全コンポーネントが強制的に再レンダリング**されます。

メモアプリでは「**エディタで1文字打つたびに `updatePage` が走る**」ため、Context だとサイドバーやゴミ箱コンポーネントまで毎回再レンダリングされ、**体感的にカクつく**という深刻な問題が起きます。

### Zustand セレクターによる解決

Zustand にはセレクター（監視機能）が備わっており、**必要な状態だけを監視**できます。関係ない状態の変更では再レンダリングが発生しません。

```typescript
// ✅ pages が変わった時だけ、このコンポーネントが再レンダリングされる
const pages = useNoteStore((s) => s.pages)

// ✅ activePageId が変わった時だけ再レンダリング
const activePageId = useNoteStore((s) => s.activePageId)
```

---

## 3. ロジックの凝集と UI の簡潔化

### useState の問題

`useState` のみでグローバルな状態（ノート群 `pages`、現在開いているノートID `activePageId` など）を管理すると：

*   **バケツリレー（Prop Drilling）の発生**: サイドバー、エディタ、ゴミ箱といった多数のコンポーネントで同じ状態を共有するため、親コンポーネントに状態と更新関数（`addPage`, `updatePage` 等）をすべて定義し、子へ延々と渡すことになる。
*   **UI とロジックの密結合**: 親コンポーネントが肥大化し、ビュー（見た目）のコードとビジネスロジックが混ざり合い、メンテナンス性が著しく低下する。

### Zustand による解決

状態とそれを操作するロジック（アクション）をすべて `note-store.ts` に隔離（凝集）できます。UI コンポーネントは必要な関数をカスタムフックから呼び出すだけで済むため、コードが劇的にシンプルになります。

---

## 4. useEffect 地獄からの脱却（確実な自動保存）

### useState + useEffect の問題

「データが変わったら裏で保存（オートセーブ）する」機能を `useState` で作ると、コンポーネント内に `useEffect` を書くしかありません。

```typescript
// ❌ useState + useEffect の辛いアンチパターン例
useEffect(() => {
  saveNotes(pages);
}, [pages]); // 依存配列の管理が複雑になり、意図しないタイミングで発火するバグの温床に
```

### Zustand の subscribe による解決

`subscribeWithSelector` ミドルウェアを活用し、**React のライフサイクルとは完全に独立した場所**で状態変更を監視して保存処理を実行しています。コンポーネントは保存のことを一切知らなくてよくなります。

```typescript
// ✅ Zustand による見通しの良いサブスクリプション（note-store.ts 末尾）

// pages が変わったら自動でストレージに保存
useNoteStore.subscribe(
  (state) => state.pages,
  (pages) => { saveNotes(pages) }
)

// activePageId が変わったら設定ファイルに保存
useNoteStore.subscribe(
  (state) => state.activePageId,
  (activePageId) => { saveConfig({ lastActivePageId: activePageId }) }
)
```

---

## 5. 他の状態管理ライブラリとの比較

| ライブラリ | Zustand を選んだ理由 |
|---|---|
| **React Context API** | 状態の一部が更新されると参照コンポーネントが全て再レンダリングされる。エディタで頻繁に更新が走るメモアプリでは致命的 |
| **Redux** | 堅牢だが、Action / Reducer / Dispatch 等のボイラープレートが多い。中小規模のメモアプリでは過剰設計 |
| **Jotai / Recoil** | アトム型で状態を細かく分割するのに向いているが、`pages` と `activePageId` のように関連性の高いデータを1つのストア（SSoT）にカプセル化する方が管理しやすいため、ストア型の Zustand が適切 |

### Zustand 自体の強み

- **バンドルサイズ**: 約 **1KB（gzip）** と非常に軽量
- **API のシンプルさ**: `create()` 1つで状態もアクションもまとめて定義可能
- **Hooks ベース**: React の設計思想と自然に統合

---

## 6. 具体的な利用箇所とアーキテクチャ設計

### 利用ファイル一覧

| ファイル | 役割 |
|---|---|
| `src/features/notes/stores/note-store.ts` | **ストア本体**（SSoT）。状態・アクション・自動保存の副作用をすべて定義 |
| `src/features/notes/hooks/use-notes.ts` | **メイン機能用フック**（Facade）。エディタ・サイドバーで使うステートとアクションを抽出 |
| `src/features/notes/hooks/use-trash.ts` | **ゴミ箱機能用フック**（Facade）。削除済みページのフィルタリングや復元アクションを提供 |
| `src/features/notes/components/home-content.tsx` | **利用側コンポーネント**。上記2つのフックを呼び出す |

### ① ストアの全容定義（SSoT）

**ファイル**: `src/features/notes/stores/note-store.ts`

ストアが管理している内容：

- **State（状態）**: `pages`（ノート配列）, `activePageId`（表示中のノートID）, `isHydrated`（初期化フラグ）
- **Actions（操作）**: `hydrate`, `addPage`, `updatePage`, `softDeletePage`, `restorePage`, `permanentDeletePage`, `cleanupOldTrash`, `setActivePageId`
- **Side-effects（副作用）**: ファイル末尾に定義された `subscribe` による自動永続化（ストレージ保存）

### ② UI 層とのブリッジ（Facade パターン）

コンポーネントから Zustand ストアに直接アクセスするのではなく、**責務を分けたカスタムフック**を介して利用しています。

- **`use-notes.ts`（メイン機能用）**: エディタやサイドバーで必要なステートやアクション（追加・更新・切り替え）を抽出。初回マウント時のデータ読み込み（`hydrate`）処理も内包
- **`use-trash.ts`（ゴミ箱機能用）**: `deletedAt` が存在するページだけをフィルタリングして返す処理や、復元・完全削除アクションを専門に取り扱う

### ③ アーキテクチャ全体図

```
┌─────────────────────────────────────────────┐
│           note-store.ts (Zustand)           │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐  │
│  │  State   │  │ Actions  │  │ Subscribe │  │
│  │ pages    │  │ addPage  │  │ 自動保存  │  │
│  │ activeId │  │ update.. │  │ pages→    │  │
│  │ hydrated │  │ delete.. │  │  storage  │  │
│  └─────────┘  └──────────┘  └───────────┘  │
└──────────┬──────────────────────┬───────────┘
           │                      │
    ┌──────┴──────┐       ┌──────┴──────┐
    │ use-notes.ts│       │ use-trash.ts│
    │  (Facade)   │       │  (Facade)   │
    └──────┬──────┘       └──────┬──────┘
           │                      │
    ┌──────┴──────────────────────┴──────┐
    │       home-content.tsx             │
    │  (UIコンポーネント・利用側)          │
    └────────────────────────────────────┘
```

**設計思想**: 「**状態・操作・副作用**」を Zustand ストア層に凝集させつつ、UI（コンポーネント）層からはシンプルなカスタムフック経由で呼び出すことで、見通しが良くパフォーマンスの高い設計を維持しています。
