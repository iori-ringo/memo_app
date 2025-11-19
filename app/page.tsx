"use client";

import { useState, useEffect } from "react";
import { Sparkles, BookOpen } from "lucide-react";
import { MemoForm } from "@/components/memo-form";
import { MemoCard } from "@/components/memo-card";
import { Memo } from "@/types/memo";

// Dummy data for initial state
const INITIAL_MEMOS: Memo[] = [
  {
    id: "1",
    fact: "前田裕二さんの『メモの魔力』を読んだ。\nメモは「記録」ではなく「知的生産」のツールである。",
    abstraction: "多くの人は「忘れないため」にメモをとるが、成功者は「新しいアイデアを生むため」にメモをとる。\n事象（ファクト）から本質（抽象化）を抜き出すプロセスが重要。",
    diversion: "日々の会議でも、議事録だけでなく「そこから何が言えるか？」という気づきの欄を設ける。\n自分のアプリ開発にも「抽象化」のステップを強制的に入れるUIを採用する。",
    createdAt: Date.now(),
  },
];

export default function Home() {
  const [memos, setMemos] = useState<Memo[]>([]);

  useEffect(() => {
    // Load from local storage or use initial data
    const saved = localStorage.getItem("magic-memos");
    if (saved) {
      try {
        setMemos(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse memos", e);
        setMemos(INITIAL_MEMOS);
      }
    } else {
      setMemos(INITIAL_MEMOS);
    }
  }, []);

  useEffect(() => {
    if (memos.length > 0) {
      localStorage.setItem("magic-memos", JSON.stringify(memos));
    }
  }, [memos]);

  const handleAddMemo = (newMemoData: Omit<Memo, "id" | "createdAt">) => {
    const newMemo: Memo = {
      ...newMemoData,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };
    setMemos((prev) => [newMemo, ...prev]);
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Memo of <span className="text-primary">Magic</span>
            </h1>
          </div>
          <div className="text-sm text-muted-foreground">
            知的生産のためのメモアプリ
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 py-8">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-5xl">
            日常を<span className="text-primary">アイデア</span>に変える
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            「ファクト→抽象化→転用」のフレームワークで、
            あなたの思考を加速させる最強のメモツール。
          </p>
        </div>

        {/* Input Form */}
        <section>
          <MemoForm onAddMemo={handleAddMemo} />
        </section>

        {/* Memo List */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">あなたのメモ</h3>
            <span className="ml-auto text-sm text-muted-foreground">
              {memos.length} 件のメモ
            </span>
          </div>

          <div className="grid gap-6">
            {memos.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                まだメモがありません。新しいメモを作成して、魔法を始めましょう。
              </div>
            ) : (
              memos.map((memo) => (
                <MemoCard key={memo.id} memo={memo} />
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
