"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Memo } from "@/types/memo";

interface MemoFormProps {
    onAddMemo: (memo: Omit<Memo, "id" | "createdAt">) => void;
}

export function MemoForm({ onAddMemo }: MemoFormProps) {
    const [fact, setFact] = useState("");
    const [abstraction, setAbstraction] = useState("");
    const [diversion, setDiversion] = useState("");
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!fact.trim()) return;

        onAddMemo({
            fact,
            abstraction,
            diversion,
        });

        setFact("");
        setAbstraction("");
        setDiversion("");
        setIsExpanded(false);
    };

    return (
        <Card className="w-full border-primary/20 shadow-lg overflow-hidden">
            <CardContent className="p-6">
                {!isExpanded ? (
                    <div
                        className="flex items-center gap-4 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setIsExpanded(true)}
                    >
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Plus className="h-6 w-6" />
                        </div>
                        <span className="text-lg font-medium">新しいメモを作成...</span>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr_auto_1fr] gap-4 items-start">
                            {/* Fact Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="fact" className="text-primary font-bold flex items-center gap-2">
                                    <span className="bg-primary/10 px-2 py-1 rounded text-xs">STEP 1</span>
                                    ファクト (事実)
                                </Label>
                                <Textarea
                                    id="fact"
                                    placeholder="客観的な事実を記入..."
                                    value={fact}
                                    onChange={(e) => setFact(e.target.value)}
                                    className="min-h-[150px] resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary"
                                />
                                <p className="text-xs text-muted-foreground">
                                    見たこと、聞いたことをそのまま記録
                                </p>
                            </motion.div>

                            {/* Arrow 1 */}
                            <div className="hidden md:flex items-center justify-center h-[150px] pt-8">
                                <ArrowRight className="text-muted-foreground/30 h-6 w-6" />
                            </div>

                            {/* Abstraction Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="abstraction" className="text-primary font-bold flex items-center gap-2">
                                    <span className="bg-primary/10 px-2 py-1 rounded text-xs">STEP 2</span>
                                    抽象化 (気づき)
                                </Label>
                                <Textarea
                                    id="abstraction"
                                    placeholder="そこから何が言える？..."
                                    value={abstraction}
                                    onChange={(e) => setAbstraction(e.target.value)}
                                    className="min-h-[150px] resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary"
                                />
                                <p className="text-xs text-muted-foreground">
                                    法則、背景、本質を見つけ出す
                                </p>
                            </motion.div>

                            {/* Arrow 2 */}
                            <div className="hidden md:flex items-center justify-center h-[150px] pt-8">
                                <ArrowRight className="text-muted-foreground/30 h-6 w-6" />
                            </div>

                            {/* Diversion Section */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="diversion" className="text-primary font-bold flex items-center gap-2">
                                    <span className="bg-primary/10 px-2 py-1 rounded text-xs">STEP 3</span>
                                    転用 (アクション)
                                </Label>
                                <Textarea
                                    id="diversion"
                                    placeholder="自分ならどうする？..."
                                    value={diversion}
                                    onChange={(e) => setDiversion(e.target.value)}
                                    className="min-h-[150px] resize-none bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 focus:border-primary focus:ring-primary"
                                />
                                <p className="text-xs text-muted-foreground">
                                    具体的な行動やアイデアに落とし込む
                                </p>
                            </motion.div>
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="ghost" type="button" onClick={() => setIsExpanded(false)}>
                                キャンセル
                            </Button>
                            <Button type="submit" className="gap-2">
                                <Sparkles className="h-4 w-4" />
                                メモを作成
                            </Button>
                        </div>
                    </form>
                )}
            </CardContent>
        </Card>
    );
}
