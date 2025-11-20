# Memo of Magic Notebook App Walkthrough

『メモの魔力』のコンセプトを忠実に再現した、高機能デジタルノートアプリです。

3.  **サイドバーナビゲーション**:
    *   作成したページの一覧をサイドバーで管理。
    *   キーワード検索機能で、過去のメモを瞬時に呼び出せます。
    *   モバイルではハンバーガーメニューからアクセス可能。

4.  **自動保存**:
    *   入力内容はリアルタイムでローカルストレージに保存されます。

## 実行方法

以下のコマンドで開発サーバーを起動してください。

```bash
npm run dev
```

ブラウザで `http://localhost:3000` にアクセスするとアプリが使用できます。

## Desktop App (Electron)

This app can be run as a native macOS application.

### Development
Run the Electron app in development mode (with hot reload):
## 使い方 (True Notebook Mode)

### 1. アプリケーションの起動
```bash
npm run electron:dev
```

### 2. 基本操作
*   **新しいページ**: サイドバーの「新しいページ」ボタンをクリックするか、メニューから作成します。
*   **テキストブロックの作成**: ノート（キャンバス）上の任意の場所を**ダブルクリック**すると、新しいテキストブロックが作成されます。
*   **移動とリサイズ**:
    *   ブロックの上部ハンドルをドラッグして移動。
    *   ブロックの右下ハンドルをドラッグしてリサイズ。
*   **テキスト編集**:
    *   ブロック内をクリックしてテキストを入力。
    *   ブロックを選択すると、ページ上部の**リボンツールバー**が有効になります。
    *   太字、斜体、リスト、文字色（黒・赤・青・黄）を選択できます。

### 3. セクションエリア
ページは4つのエリアに分かれています：
*   **左ページ**: タイトル（上部10%）+ ファクト（下部90%）
*   **右ページ**: 抽象化（左50%）+ 転用（右50%）
*   **境界線のカスタマイズ**: 境界線をドラッグして各エリアのサイズを調整できます
    *   横線（タイトル/ファクト）: 上下にドラッグ
    *   中央の縦線（左/右ページ）: 左右にドラッグ
    *   右の縦線（抽象化/転用）: 左右にドラッグ

### 4. 接続機能 (Connect Mode)
*   キーボードの **`C`** キーを押すと「Connect Mode」に入ります（右上にインジケーター表示）。
*   接続元のブロックをクリックし、次に接続先のブロックをクリックすると、2つのブロックが手書き風の線で結ばれます。
*   もう一度 `C` を押すか、背景をクリックするとモードを終了します。

### 4. 手書きモード (Pen Mode)
*   キーボードの **`P`** キーを押すと「Pen Mode」に入ります（右上に青いインジケーター表示）。
*   マウスやペンタブレットを使って、ノートの上に自由に線を描くことができます。
*   図解、矢印、落書きなど、思考を可視化するのに役立ちます。
*   もう一度 `P` を押すとモードを終了します。

### 5. お気に入り機能
*   右上の **☆** アイコンをクリックすると、ページをお気に入りに登録できます。
*   お気に入りページはサイドバーで黄色いスターアイコンが表示されます。

### 6. ページめくり
*   サイドバーで別のページを選択すると、紙をめくるようなアニメーションで切り替わります。

### 7. データの保存
*   データは自動的にローカルファイル（`~/Library/Application Support/Magic Memo/pages.json`）に保存されます。

## 開発・ビルド
*   **開発モード**: `npm run electron:dev`
*   **本番ビルド**: `npm run electron:build` (dmgファイルが `dist` フォルダに生成されます)

### AI Features
-   **Web Version**: Uses Mock AI responses (Server Actions were removed for static export compatibility).
-   **Desktop Version**: Uses Google Gemini API via Electron IPC.
    -   Ensure `GEMINI_API_KEY` is set in `.env.local`.

## Project Structure
- `app/`: Next.js App Router source
- `components/`: React components
- `electron/`: Electron main process and preload scripts
- `lib/`: Utility functions (including AI client wrapper)
- `types/`: TypeScript definitions
