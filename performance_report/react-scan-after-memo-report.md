# React パフォーマンスレポート

> 生成日時: 2026/3/15 14:47:02  
> ツール: react-scan + Puppeteer (headless)

## 1. サマリー

### スコア: 🔴 46/100 (F)

| 項目 | 値 |
| --- | --- |
| 対象URL | http://10.18.45.110:3000/ |
| ページタイトル | Magic Memo - ノート |
| 計測時間 | 56.3秒 |
| 検出コンポーネント数 | 85 |
| 総レンダー回数 | 2240 |
| 総コミット回数 | 42 |
| 不要レンダー回数 | 1672 (74.6%) |
| レンダー密度 | 39.8 renders/sec |
| メモ化候補 | 76 コンポーネント |

<details>
<summary>スコアの算出基準</summary>

- 不要レンダー率（最大-40pt）: 74.6% → -30pt
- 上位5コンポーネント平均レンダー時間（最大-30pt）: 3.34ms → -2pt
- メモ化候補数（最大-20pt）: 76件 → -20pt
- レンダー密度（最大-10pt）

</details>

## 2. コンポーネント別レンダリング詳細

### レンダー回数 Top 20

| # | コンポーネント | 総レンダー | 不要レンダー | 平均時間(ms) | 最大時間(ms) | Mount | Update | Unstable Props |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 1 | `_c` ⚠️ | 119 | 98 | 0.49 | 10.20 | 21 | 98 | - |
| 2 | `SegmentViewNode` ⚠️ | 110 | 42 | 1.11 | 12.90 | 68 | 42 | - |
| 3 | `SegmentTrieNode` ⚠️ | 110 | 42 | 0.00 | 0.00 | 68 | 42 | - |
| 4 | `PageGroup` ⚠️ | 100 | 40 | 0.12 | 4.70 | 5 | 95 | - |
| 5 | `MenuProvider` ⚠️ | 90 | 66 | 0.51 | 2.30 | 14 | 76 | - |
| 6 | `Presence` ⚠️ | 47 | 38 | 0.00 | 0.20 | 9 | 38 | - |
| 7 | `Menu` ⚠️ | 45 | 33 | 0.64 | 2.40 | 7 | 38 | - |
| 8 | `Popper` ⚠️ | 45 | 33 | 0.62 | 2.40 | 7 | 38 | - |
| 9 | `PopperProvider` ⚠️ | 45 | 3 | 0.55 | 2.30 | 7 | 38 | - |
| 10 | `MenuPortal` ⚠️ | 45 | 30 | 0.02 | 0.10 | 7 | 38 | - |
| 11 | `MenuPortalProvider` ⚠️ | 45 | 30 | 0.00 | 0.10 | 7 | 38 | - |
| 12 | `ErrorBoundary` ⚠️ | 44 | 42 | 2.73 | 12.90 | 2 | 42 | - |
| 13 | `ErrorBoundaryHandler` ⚠️ | 44 | 42 | 2.72 | 12.90 | 2 | 42 | - |
| 14 | `HTTPAccessFallbackBoundary` ⚠️ | 44 | 42 | 2.71 | 12.90 | 2 | 42 | - |
| 15 | `HTTPAccessFallbackErrorBoundary` ⚠️ | 44 | 42 | 2.71 | 12.90 | 2 | 42 | - |
| 16 | `RedirectBoundary` ⚠️ | 44 | 42 | 2.71 | 12.90 | 2 | 42 | - |
| 17 | `RedirectErrorBoundary` ⚠️ | 44 | 42 | 2.71 | 12.90 | 2 | 42 | - |
| 18 | `DropdownMenu` ⚠️ | 31 | 26 | 0.59 | 1.30 | 5 | 26 | - |
| 19 | `DropdownMenuProvider` ⚠️ | 31 | 26 | 0.64 | 1.20 | 5 | 26 | - |
| 20 | `DropdownMenuPortal` ⚠️ | 31 | 26 | 0.03 | 0.20 | 5 | 26 | - |

## 3. ボトルネック分析

### 3.1 レンダー時間が長いコンポーネント (Top 5)

#### `MobileDrawer`

- 平均レンダー時間: **3.90ms**
- 最大レンダー時間: 3.90ms
- 総レンダー回数: 1
- 総消費時間: 3.90ms

#### `Dialog`

- 平均レンダー時間: **3.70ms**
- 最大レンダー時間: 3.70ms
- 総レンダー回数: 1
- 総消費時間: 3.70ms

#### `DialogProvider`

- 平均レンダー時間: **3.60ms**
- 最大レンダー時間: 3.60ms
- 総レンダー回数: 1
- 総消費時間: 3.60ms

#### `Root`

- 平均レンダー時間: **2.76ms**
- 最大レンダー時間: 13.00ms
- 総レンダー回数: 22
- 総消費時間: 60.80ms

#### `ServerRoot`

- 平均レンダー時間: **2.76ms**
- 最大レンダー時間: 13.00ms
- 総レンダー回数: 22
- 総消費時間: 60.80ms

### 3.2 不要レンダーが多いコンポーネント

| コンポーネント | 不要レンダー | 全レンダー | 不要率 | Unstable Props |
| --- | ---: | ---: | ---: | --- |
| `_c` | 98 | 119 | 82.4% | - |
| `MenuProvider` | 66 | 90 | 73.3% | - |
| `ErrorBoundary` | 42 | 44 | 95.5% | - |
| `ErrorBoundaryHandler` | 42 | 44 | 95.5% | - |
| `HTTPAccessFallbackBoundary` | 42 | 44 | 95.5% | - |
| `HTTPAccessFallbackErrorBoundary` | 42 | 44 | 95.5% | - |
| `RedirectBoundary` | 42 | 44 | 95.5% | - |
| `RedirectErrorBoundary` | 42 | 44 | 95.5% | - |
| `SegmentViewNode` | 42 | 110 | 38.2% | - |
| `SegmentTrieNode` | 42 | 110 | 38.2% | - |

## 4. 最適化提案

### 4.1. React.memoによるメモ化

**対象**: `_c`, `MenuProvider`, `ErrorBoundary`, `ErrorBoundaryHandler`, `HTTPAccessFallbackBoundary`

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
| 🔴 1 | `_c` | 548.3 | 不要レンダー, 高頻度レンダー | React.memo |
| 🔴 2 | `MenuProvider` | 375.9 | 不要レンダー, 高頻度レンダー | React.memo |
| 🔴 3 | `SegmentViewNode` | 332.1 | 不要レンダー, 高頻度レンダー | React.memo |
| 🟡 4 | `ErrorBoundary` | 330.1 | 不要レンダー | React.memo |
| 🟡 5 | `ErrorBoundaryHandler` | 329.7 | 不要レンダー | React.memo |
| 🟡 6 | `HTTPAccessFallbackBoundary` | 329.2 | 不要レンダー | React.memo |
| 🟢 7 | `HTTPAccessFallbackErrorBoundary` | 329.2 | 不要レンダー | React.memo |
| 🟢 8 | `RedirectBoundary` | 329.2 | 不要レンダー | React.memo |
| 🟢 9 | `RedirectErrorBoundary` | 329.2 | 不要レンダー | React.memo |
| 🟢 10 | `PageGroup` | 212.0 | 不要レンダー, 高頻度レンダー | React.memo |

## 6. 生データサンプル（AI分析用）

<details>
<summary>直近のレンダーログ（最新20件）</summary>

```json
[
  {
    "component": "MenuPortal",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "MenuPortalProvider",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "Presence",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "_c",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "_c",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "_c",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "_c",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "_c",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "CanvasBackground",
    "phase": "update",
    "time": 0.3999999761581421,
    "timestamp": 1773553580594
  },
  {
    "component": "ConnectionLayer",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "__next_outlet_boundary__",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "SegmentBoundaryTriggerNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "SegmentViewStateNode",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "SegmentViewNode",
    "phase": "mount",
    "time": 0.09999999403953552,
    "timestamp": 1773553580594
  },
  {
    "component": "SegmentTrieNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "SegmentViewNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "SegmentTrieNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "SegmentViewNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "SegmentTrieNode",
    "phase": "mount",
    "time": 0,
    "timestamp": 1773553580594
  },
  {
    "component": "AppRouterAnnouncer",
    "phase": "update",
    "time": 0,
    "timestamp": 1773553580594
  }
]
```

</details>

<details>
<summary>コンポーネント別集計データ</summary>

```json
[
  {
    "name": "_c",
    "totalRenders": 119,
    "unnecessaryRenders": 98,
    "avgRenderTime": 0.49,
    "maxRenderTime": 10.199999988079071,
    "totalTime": 58,
    "unstableProps": [],
    "phases": {
      "mount": 21,
      "update": 98,
      "nested-update": 0
    }
  },
  {
    "name": "SegmentViewNode",
    "totalRenders": 110,
    "unnecessaryRenders": 42,
    "avgRenderTime": 1.11,
    "maxRenderTime": 12.900000005960464,
    "totalTime": 121.9,
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
    "maxRenderTime": 0,
    "totalTime": 0,
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
    "maxRenderTime": 4.700000017881393,
    "totalTime": 11.8,
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
    "avgRenderTime": 0.51,
    "maxRenderTime": 2.300000011920929,
    "totalTime": 45.8,
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
    "maxRenderTime": 0.19999998807907104,
    "totalTime": 0.2,
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
    "avgRenderTime": 0.64,
    "maxRenderTime": 2.4000000059604645,
    "totalTime": 28.8,
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
    "avgRenderTime": 0.62,
    "maxRenderTime": 2.4000000059604645,
    "totalTime": 28.1,
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
    "avgRenderTime": 0.55,
    "maxRenderTime": 2.300000011920929,
    "totalTime": 24.6,
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
    "avgRenderTime": 0.02,
    "maxRenderTime": 0.10000002384185791,
    "totalTime": 1,
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
    "avgRenderTime": 0,
    "maxRenderTime": 0.10000002384185791,
    "totalTime": 0.2,
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
    "avgRenderTime": 2.73,
    "maxRenderTime": 12.900000005960464,
    "totalTime": 119.9,
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
    "avgRenderTime": 2.72,
    "maxRenderTime": 12.900000005960464,
    "totalTime": 119.8,
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
    "avgRenderTime": 2.71,
    "maxRenderTime": 12.900000005960464,
    "totalTime": 119.4,
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
    "avgRenderTime": 2.71,
    "maxRenderTime": 12.900000005960464,
    "totalTime": 119.3,
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
    "avgRenderTime": 2.71,
    "maxRenderTime": 12.900000005960464,
    "totalTime": 119.2,
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
    "avgRenderTime": 2.71,
    "maxRenderTime": 12.900000005960464,
    "totalTime": 119.2,
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
    "avgRenderTime": 0.59,
    "maxRenderTime": 1.300000011920929,
    "totalTime": 18.2,
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
    "avgRenderTime": 0.64,
    "maxRenderTime": 1.2000000178813934,
    "totalTime": 19.9,
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
    "avgRenderTime": 0.03,
    "maxRenderTime": 0.20000001788139343,
    "totalTime": 0.9,
    "unstableProps": [],
    "phases": {
      "mount": 5,
      "update": 26,
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
