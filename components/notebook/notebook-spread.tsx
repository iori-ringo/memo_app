"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RichTextEditor } from "@/components/editor/rich-text-editor";
import { NotePage } from "@/types/note";
import { generateAbstraction, generateDiversion, generateSummary } from "@/lib/ai-client";


interface NotebookSpreadProps {
    page: NotePage;
    onUpdate: (id: string, updates: Partial<NotePage>) => void;
}

export function NotebookSpread({ page, onUpdate }: NotebookSpreadProps) {
    // Local state for smooth typing without constant parent updates
    // We rely on the parent component changing the 'key' prop when page.id changes
    // to reset this internal state.
    const [title, setTitle] = useState(page.title);
    const [summary, setSummary] = useState(page.summary || "");
    const [isGenerating, setIsGenerating] = useState<string | null>(null);

    const handleTitleBlur = () => {
        if (title !== page.title) {
            onUpdate(page.id, { title });
        }
    };

    const handleSummaryBlur = () => {
        if (summary !== page.summary) {
            onUpdate(page.id, { summary });
        }
    };

    const handleGenerateAbstraction = async () => {
        if (!page.fact?.trim()) {
            alert("まず事実を入力してください。");
            return;
        }
        setIsGenerating("abstraction");
        try {
            const abstraction = await generateAbstraction(page.fact || "");
            onUpdate(page.id, { abstraction });
        } catch (error) {
            alert(error instanceof Error ? error.message : "エラーが発生しました");
        } finally {
            setIsGenerating(null);
        }
    };

    const handleGenerateDiversion = async () => {
        if (!page.abstraction?.trim()) {
            alert("まず抽象化を入力してください。");
            return;
        }
        setIsGenerating("diversion");
        try {
            const diversion = await generateDiversion(page.fact || "", page.abstraction || "");
            onUpdate(page.id, { diversion });
        } catch (error) {
            alert(error instanceof Error ? error.message : "エラーが発生しました");
        } finally {
            setIsGenerating(null);
        }
    };

    const handleGenerateSummary = async () => {
        const content = `Fact: ${page.fact || ""}\nAbstraction: ${page.abstraction || ""}\nDiversion: ${page.diversion || ""}`;
        if (!content.trim()) {
            alert("まずコンテンツを入力してください。");
            return;
        }
        setIsGenerating("summary");
        try {
            const summary = await generateSummary(content);
            setSummary(summary);
            onUpdate(page.id, { summary });
        } catch (error) {
            alert(error instanceof Error ? error.message : "エラーが発生しました");
        } finally {
            setIsGenerating(null);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row w-full h-full bg-background shadow-2xl rounded-lg overflow-hidden border border-stone-200 dark:border-stone-800">
            {/* Left Page: Fact & Meta */}
            <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-stone-800 bg-[#fdfbf7] dark:bg-[#1c1c1c] min-h-[600px] p-6 relative">
                {/* Header Area */}
                <div className="flex flex-col gap-4 mb-6 border-b border-stone-200 dark:border-stone-800 pb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
                        <span>{format(page.createdAt, "yyyy.MM.dd", { locale: ja })}</span>
                        <span>ID: {page.id.slice(0, 8)}</span>
                    </div>

                    <div className="space-y-2">
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            onBlur={handleTitleBlur}
                            placeholder="タイトルを入力..."
                            className="text-xl font-bold border-none shadow-none bg-transparent px-0 focus-visible:ring-0 placeholder:text-muted-foreground/50"
                        />
                        <div className="relative">
                            <Textarea
                                value={summary}
                                onChange={(e) => setSummary(e.target.value)}
                                onBlur={handleSummaryBlur}
                                placeholder="サマリー / 要約..."
                                className="min-h-[60px] resize-none text-sm border-none shadow-none bg-primary/5 dark:bg-primary/10 focus-visible:ring-0 placeholder:text-muted-foreground/50 pr-10"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1 top-1 h-7 w-7"
                                onClick={handleGenerateSummary}
                                disabled={isGenerating === "summary"}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Fact Section */}
                <div className="flex-1 flex flex-col">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2 justify-between">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">1</span>
                            Fact (事実)
                        </div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-stone-900/50 rounded-md border border-stone-100 dark:border-stone-800 p-4 shadow-sm">
                        <RichTextEditor
                            content={page.fact || ""}
                            onChange={(content) => onUpdate(page.id, { fact: content })}
                            placeholder="客観的な事実を記録..."
                            className="h-full"
                        />
                    </div>
                </div>

                {/* Page Number (Visual) */}
                <div className="absolute bottom-4 left-4 text-xs text-muted-foreground/30 font-mono">
                    L
                </div>
            </div>

            {/* Right Page: Abstraction & Diversion */}
            <div className="flex-1 flex flex-row bg-[#fdfbf7] dark:bg-[#1c1c1c] min-h-[600px] relative">
                {/* Abstraction Column */}
                <div className="flex-1 flex flex-col p-6 border-r border-dashed border-stone-300 dark:border-stone-700">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">2</span>
                        Abstraction (抽象化)
                    </div>
                    <div className="flex-1 bg-white dark:bg-stone-900/50 rounded-md border border-stone-100 dark:border-stone-800 p-4 shadow-sm">
                        <RichTextEditor
                            content={page.abstraction || ""}
                            onChange={(content) => onUpdate(page.id, { abstraction: content })}
                            placeholder="気づき、法則、本質..."
                            className="h-full"
                        />
                        <div className="relative mt-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1 top-1 h-7 w-7"
                                onClick={handleGenerateAbstraction}
                                disabled={isGenerating === "abstraction"}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Diversion Column */}
                <div className="flex-1 flex flex-col p-6">
                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-2 flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">3</span>
                        Diversion (転用)
                    </div>
                    <div className="flex-1 bg-white dark:bg-stone-900/50 rounded-md border border-stone-100 dark:border-stone-800 p-4 shadow-sm">
                        <RichTextEditor
                            content={page.diversion || ""}
                            onChange={(content) => onUpdate(page.id, { diversion: content })}
                            placeholder="アクション、適用..."
                            className="h-full"
                        />
                        <div className="relative mt-2">
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute right-1 top-1 h-7 w-7"
                                onClick={handleGenerateDiversion}
                                disabled={isGenerating === "diversion"}
                            >
                                <Sparkles className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Page Number (Visual) */}
                <div className="absolute bottom-4 right-4 text-xs text-muted-foreground/30 font-mono">
                    R
                </div>
            </div>
        </div>
    );
}
