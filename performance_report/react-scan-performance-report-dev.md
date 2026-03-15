# React パフォーマンスレポート

> 生成日時: 2026/3/14 16:20:02  
> ツール: react-scan + Puppeteer (headless)

## 1. サマリー

### スコア: 🔴 46/100 (F)

| 項目 | 値 |
| --- | --- |
| 対象URL | http://10.49.185.126:3000/ |
| ページタイトル | Magic Memo - ノート |
| 計測時間 | 56.3秒 |
| 検出コンポーネント数 | 91 |
| 総レンダー回数 | 2240 |
| 総コミット回数 | 25 |
| 不要レンダー回数 | 1672 (74.6%) |
| レンダー密度 | 39.8 renders/sec |
| メモ化候補 | 82 コンポーネント |

<details>
<summary>スコアの算出基準</summary>

- 不要レンダー率（最大-40pt）: 74.6% → -30pt
- 上位5コンポーネント平均レンダー時間（最大-30pt）: 3.99ms → -2pt
- メモ化候補数（最大-20pt）: 82件 → -20pt
- レンダー密度（最大-10pt）

</details>

## 2. コンポーネント別レンダリング詳細

### レンダー回数 Top 20

| # | コンポーネント | 総レンダー | 不要レンダー | 平均時間(ms) | 最大時間(ms) | Mount | Update | Unstable Props |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | `SegmentViewNode` ⚠️ | 110 | 42 | 1.18 | 11.80 | 68 | 42 | - |
| 2 | `SegmentTrieNode` ⚠️ | 110 | 42 | 0.00 | 0.10 | 68 | 42 | - |
| 3 | `PageGroup` ⚠️ | 100 | 40 | 0.12 | 5.50 | 5 | 95 | - |
| 4 | `MenuProvider` ⚠️ | 90 | 66 | 0.50 | 2.40 | 14 | 76 | - |
| 5 | `Presence` ⚠️ | 47 | 38 | 0.00 | 0.10 | 9 | 38 | - |
| 6 | `Menu` ⚠️ | 45 | 33 | 0.60 | 2.50 | 7 | 38 | - |
| 7 | `Popper` ⚠️ | 45 | 33 | 0.57 | 2.40 | 7 | 38 | - |
| 8 | `PopperProvider` ⚠️ | 45 | 3 | 0.52 | 2.40 | 7 | 38 | - |
| 9 | `MenuPortal` ⚠️ | 45 | 30 | 0.04 | 0.20 | 7 | 38 | - |
| 10 | `MenuPortalProvider` ⚠️ | 45 | 30 | 0.02 | 0.10 | 7 | 38 | - |
| 11 | `ErrorBoundary` ⚠️ | 44 | 42 | 2.99 | 11.80 | 2 | 42 | - |
| 12 | `ErrorBoundaryHandler` ⚠️ | 44 | 42 | 2.99 | 11.80 | 2 | 42 | - |
| 13 | `HTTPAccessFallbackBoundary` ⚠️ | 44 | 42 | 2.93 | 11.80 | 2 | 42 | - |
| 14 | `HTTPAccessFallbackErrorBoundary` ⚠️ | 44 | 42 | 2.93 | 11.80 | 2 | 42 | - |
| 15 | `RedirectBoundary` ⚠️ | 44 | 42 | 2.93 | 11.80 | 2 | 42 | - |
| 16 | `RedirectErrorBoundary` ⚠️ | 44 | 42 | 2.93 | 11.80 | 2 | 42 | - |
| 17 | `DropdownMenu` ⚠️ | 31 | 26 | 0.51 | 1.60 | 5 | 26 | - |
| 18 | `DropdownMenuProvider` ⚠️ | 31 | 26 | 0.58 | 1.40 | 5 | 26 | - |
| 19 | `DropdownMenuPortal` ⚠️ | 31 | 26 | 0.04 | 0.20 | 5 | 26 | - |
| 20 | `ContextMenu` ⚠️ | 28 | 24 | 0.67 | 2.80 | 4 | 24 | - |

## 3. ボトルネック分析

### 3.1 レンダー時間が長いコンポーネント (Top 5)

#### `MobileDrawer`

- 平均レンダー時間: **4.70ms**
- 最大レンダー時間: 4.70ms
- 総レンダー回数: 1
- 総消費時間: 4.70ms

#### `Dialog`

- 平均レンダー時間: **4.50ms**
- 最大レンダー時間: 4.50ms
- 総レンダー回数: 1
- 総消費時間: 4.50ms

#### `DialogProvider`

- 平均レンダー時間: **4.40ms**
- 最大レンダー時間: 4.40ms
- 総レンダー回数: 1
- 総消費時間: 4.40ms

#### `Root`

- 平均レンダー時間: **3.17ms**
- 最大レンダー時間: 11.80ms
- 総レンダー回数: 22
- 総消費時間: 69.70ms

#### `ServerRoot`

- 平均レンダー時間: **3.16ms**
- 最大レンダー時間: 11.80ms
- 総レンダー回数: 22
- 総消費時間: 69.60ms

### 3.2 不要レンダーが多いコンポーネント

| コンポーネント | 不要レンダー | 全レンダー | 不要率 | Unstable Props |
| --- | ---: | ---: | ---: | --- |
| `MenuProvider` | 66 | 90 | 73.3% | - |
| `ErrorBoundary` | 42 | 44 | 95.5% | - |
| `ErrorBoundaryHandler` | 42 | 44 | 95.5% | - |
| `HTTPAccessFallbackBoundary` | 42 | 44 | 95.5% | - |
| `HTTPAccessFallbackErrorBoundary` | 42 | 44 | 95.5% | - |
| `RedirectBoundary` | 42 | 44 | 95.5% | - |
| `RedirectErrorBoundary` | 42 | 44 | 95.5% | - |
| `SegmentViewNode` | 42 | 110 | 38.2% | - |
| `SegmentTrieNode` | 42 | 110 | 38.2% | - |
| `PageGroup` | 40 | 100 | 40.0% | - |

## 4. 最適化提案

### 4.1. React.memoによるメモ化

**対象**: `MenuProvider`, `ErrorBoundary`, `ErrorBoundaryHandler`, `HTTPAccessFallbackBoundary`, `HTTPAccessFallbackErrorBoundary`

**原因**: 親コンポーネントが再レンダーされた際に、propsが変わっていないにもかかわらず
子コンポーネントも再レンダーされている。

**対策**:

```tsx
// ❌ Before
const ExpensiveList = ({ items }: Props) => {
  return items.map(item => <ListItem key={item.id} {...item} />);
};

// ✅ After
const ExpensiveList = React.memo(({ items }: Props) => {
  return items.map(item => <ListItem key={item.id} {...item} />);
});
```

> **注意**: React.memoは浅い比較（shallow comparison）を行います。
> propsにオブジェクトや配列がある場合、親側で `useMemo` と合わせて使う必要があります。

### 4.2. React Compilerの検討

React Compiler（旧React Forget）が安定版に近づいています。
手動の `useMemo` / `useCallback` / `React.memo` を自動化できるため、
上記の最適化の多くが不要になる可能性があります。

Expo SDK 54+ / Next.js では実験的に有効化可能です。

## 5. 改善優先度マトリクス

影響度（レンダー回数 × 平均時間）でソートした改善優先度:

| 優先度 | コンポーネント | 影響度スコア | 主な問題 | 推奨アクション |
| :---: | --- | ---: | --- | --- |
| 🔴 1 | `MenuProvider` | 375.0 | 不要レンダー, 高頻度レンダー | React.memo |
| 🔴 2 | `ErrorBoundary` | 341.6 | 不要レンダー | React.memo |
| 🔴 3 | `ErrorBoundaryHandler` | 341.6 | 不要レンダー | React.memo |
| 🟡 4 | `SegmentViewNode` | 339.8 | 不要レンダー, 高頻度レンダー | React.memo |
| 🟡 5 | `HTTPAccessFallbackBoundary` | 338.9 | 不要レンダー | React.memo |
| 🟡 6 | `HTTPAccessFallbackErrorBoundary` | 338.9 | 不要レンダー | React.memo |
| 🟢 7 | `RedirectBoundary` | 338.9 | 不要レンダー | React.memo |
| 🟢 8 | `RedirectErrorBoundary` | 338.9 | 不要レンダー | React.memo |
| 🟢 9 | `PageGroup` | 212.0 | 不要レンダー, 高頻度レンダー | React.memo |
| 🟢 10 | `SegmentTrieNode` | 210.0 | 不要レンダー, 高頻度レンダー | React.memo |

## 6. 生データサンプル（AI分析用）

<details>
<summary>直近のレンダーログ（最新20件）</summary>

```json
[
  {
    "component": "MenuPortal",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "MenuPortalProvider",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "Presence",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "TextAlignTools",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "ColorTools",
    "phase": "update",
    "time": 0.09999999403953552,
    "timestamp": 1773472760314
  },
  {
    "component": "ListTools",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "CanvasModeTools",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "DeleteButton",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "CanvasBackground",
    "phase": "update",
    "time": 0.19999998807907104,
    "timestamp": 1773472760314
  },
  {
    "component": "ConnectionLayer",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "__next_outlet_boundary__",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "SegmentBoundaryTriggerNode",
    "phase": "mount",
    "time": 0.09999999403953552,
    "timestamp": 1773472760314
  },
  {
    "component": "SegmentViewStateNode",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "SegmentViewNode",
    "phase": "mount",
    "time": 0.09999999403953552,
    "timestamp": 1773472760314
  },
  {
    "component": "SegmentTrieNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "SegmentViewNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "SegmentTrieNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "SegmentViewNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "SegmentTrieNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773472760314
  },
  {
    "component": "AppRouterAnnouncer",
    "phase": "update",
    "time": 0,
    "timestamp": 1773472760314
  }
]
```

</details>

<details>
<summary>コンポーネント別集計データ</summary>

```json
[
  {
    "name": "SegmentViewNode",
    "totalRenders": 110,
    "unnecessaryRenders": 42,
    "avgRenderTime": 1.18,
    "maxRenderTime": 11.799999982118607,
    "totalTime": 130,
    "unstableProps": [],
    "phases": {
      "mount": 68,
      "update": 42,
      "nested-update": 0
    }
  },
  {
    "name": "SegmentTrieNode",
    "totalRenders": 110,
    "unnecessaryRenders": 42,
    "avgRenderTime": 0,
    "maxRenderTime": 0.09999999403953552,
    "totalTime": 0.1,
    "unstableProps": [],
    "phases": {
      "mount": 68,
      "update": 42,
      "nested-update": 0
    }
  },
  {
    "name": "PageGroup",
    "totalRenders": 100,
    "unnecessaryRenders": 40,
    "avgRenderTime": 0.12,
    "maxRenderTime": 5.5,
    "totalTime": 12.5,
    "unstableProps": [],
    "phases": {
      "mount": 5,
      "update": 95,
      "nested-update": 0
    }
  },
  {
    "name": "MenuProvider",
    "totalRenders": 90,
    "unnecessaryRenders": 66,
    "avgRenderTime": 0.5,
    "maxRenderTime": 2.4000000059604645,
    "totalTime": 44.7,
    "unstableProps": [],
    "phases": {
      "mount": 14,
      "update": 76,
      "nested-update": 0
    }
  },
  {
    "name": "Presence",
    "totalRenders": 47,
    "unnecessaryRenders": 38,
    "avgRenderTime": 0,
    "maxRenderTime": 0.10000002384185791,
    "totalTime": 0.1,
    "unstableProps": [],
    "phases": {
      "mount": 9,
      "update": 38,
      "nested-update": 0
    }
  },
  {
    "name": "Menu",
    "totalRenders": 45,
    "unnecessaryRenders": 33,
    "avgRenderTime": 0.6,
    "maxRenderTime": 2.5,
    "totalTime": 26.8,
    "unstableProps": [],
    "phases": {
      "mount": 7,
      "update": 38,
      "nested-update": 0
    }
  },
  {
    "name": "Popper",
    "totalRenders": 45,
    "unnecessaryRenders": 33,
    "avgRenderTime": 0.57,
    "maxRenderTime": 2.4000000059604645,
    "totalTime": 25.6,
    "unstableProps": [],
    "phases": {
      "mount": 7,
      "update": 38,
      "nested-update": 0
    }
  },
  {
    "name": "PopperProvider",
    "totalRenders": 45,
    "unnecessaryRenders": 3,
    "avgRenderTime": 0.52,
    "maxRenderTime": 2.4000000059604645,
    "totalTime": 23.5,
    "unstableProps": [],
    "phases": {
      "mount": 7,
      "update": 38,
      "nested-update": 0
    }
  },
  {
    "name": "MenuPortal",
    "totalRenders": 45,
    "unnecessaryRenders": 30,
    "avgRenderTime": 0.04,
    "maxRenderTime": 0.20000001788139343,
    "totalTime": 2,
    "unstableProps": [],
    "phases": {
      "mount": 7,
      "update": 38,
      "nested-update": 0
    }
  },
  {
    "name": "MenuPortalProvider",
    "totalRenders": 45,
    "unnecessaryRenders": 30,
    "avgRenderTime": 0.02,
    "maxRenderTime": 0.10000002384185791,
    "totalTime": 0.8,
    "unstableProps": [],
    "phases": {
      "mount": 7,
      "update": 38,
      "nested-update": 0
    }
  },
  {
    "name": "ErrorBoundary",
    "totalRenders": 44,
    "unnecessaryRenders": 42,
    "avgRenderTime": 2.99,
    "maxRenderTime": 11.799999982118607,
    "totalTime": 131.5,
    "unstableProps": [],
    "phases": {
      "mount": 2,
      "update": 42,
      "nested-update": 0
    }
  },
  {
    "name": "ErrorBoundaryHandler",
    "totalRenders": 44,
    "unnecessaryRenders": 42,
    "avgRenderTime": 2.99,
    "maxRenderTime": 11.799999982118607,
    "totalTime": 131.4,
    "unstableProps": [],
    "phases": {
      "mount": 2,
      "update": 42,
      "nested-update": 0
    }
  },
  {
    "name": "HTTPAccessFallbackBoundary",
    "totalRenders": 44,
    "unnecessaryRenders": 42,
    "avgRenderTime": 2.93,
    "maxRenderTime": 11.799999982118607,
    "totalTime": 129,
    "unstableProps": [],
    "phases": {
      "mount": 2,
      "update": 42,
      "nested-update": 0
    }
  },
  {
    "name": "HTTPAccessFallbackErrorBoundary",
    "totalRenders": 44,
    "unnecessaryRenders": 42,
    "avgRenderTime": 2.93,
    "maxRenderTime": 11.799999982118607,
    "totalTime": 129,
    "unstableProps": [],
    "phases": {
      "mount": 2,
      "update": 42,
      "nested-update": 0
    }
  },
  {
    "name": "RedirectBoundary",
    "totalRenders": 44,
    "unnecessaryRenders": 42,
    "avgRenderTime": 2.93,
    "maxRenderTime": 11.799999982118607,
    "totalTime": 129,
    "unstableProps": [],
    "phases": {
      "mount": 2,
      "update": 42,
      "nested-update": 0
    }
  },
  {
    "name": "RedirectErrorBoundary",
    "totalRenders": 44,
    "unnecessaryRenders": 42,
    "avgRenderTime": 2.93,
    "maxRenderTime": 11.799999982118607,
    "totalTime": 128.8,
    "unstableProps": [],
    "phases": {
      "mount": 2,
      "update": 42,
      "nested-update": 0
    }
  },
  {
    "name": "DropdownMenu",
    "totalRenders": 31,
    "unnecessaryRenders": 26,
    "avgRenderTime": 0.51,
    "maxRenderTime": 1.5999999940395355,
    "totalTime": 15.9,
    "unstableProps": [],
    "phases": {
      "mount": 5,
      "update": 26,
      "nested-update": 0
    }
  },
  {
    "name": "DropdownMenuProvider",
    "totalRenders": 31,
    "unnecessaryRenders": 26,
    "avgRenderTime": 0.58,
    "maxRenderTime": 1.4000000059604645,
    "totalTime": 17.9,
    "unstableProps": [],
    "phases": {
      "mount": 5,
      "update": 26,
      "nested-update": 0
    }
  },
  {
    "name": "DropdownMenuPortal",
    "totalRenders": 31,
    "unnecessaryRenders": 26,
    "avgRenderTime": 0.04,
    "maxRenderTime": 0.20000001788139343,
    "totalTime": 1.1,
    "unstableProps": [],
    "phases": {
      "mount": 5,
      "update": 26,
      "nested-update": 0
    }
  },
  {
    "name": "ContextMenu",
    "totalRenders": 28,
    "unnecessaryRenders": 24,
    "avgRenderTime": 0.67,
    "maxRenderTime": 2.800000011920929,
    "totalTime": 18.8,
    "unstableProps": [],
    "phases": {
      "mount": 4,
      "update": 24,
      "nested-update": 0
    }
  }
]
```

</details>

---

## 用語集

| 用語 | 説明 |
| --- | --- |
| **レンダー (Render)** | ReactがコンポーネントのJSXを評価して仮想DOMを生成する処理 |
| **コミット (Commit)** | 仮想DOMの差分を実DOMに反映する処理 |
| **不要レンダー (Unnecessary Render)** | レンダー後にDOMへの変更が発生しなかったレンダー |
| **Unstable Props** | レンダーごとに新しい参照が生成されるprops。React.memoの効果を無効化する |
| **メモ化 (Memoization)** | 計算結果やコンポーネントをキャッシュし再利用する最適化手法 |
| **React.memo** | propsが変わらない場合にコンポーネントの再レンダーをスキップするHOC |
| **useCallback** | 関数の参照を依存配列が変わるまで保持するHook |
| **useMemo** | 計算結果を依存配列が変わるまでキャッシュするHook |
| **React Compiler** | メモ化を自動適用するReactの実験的コンパイラ（旧React Forget） |
| **フレーム落ち** | 1フレーム(16.67ms)内に処理が完了せず描画が遅延する現象 |
| **Reconciliation** | 仮想DOMツリーの差分を検出するReactのアルゴリズム |
| **Fiber** | Reactの内部データ構造。コンポーネントの状態や親子関係を保持する |

*このレポートは react-scan-profiler skill により自動生成されました。*
