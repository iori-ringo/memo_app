"use client";

import { useState } from "react";
import { Search, Book, Plus, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ModeToggle } from "@/components/mode-toggle";
import { NotePage } from "@/types/note";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

interface AppSidebarProps {
    pages: NotePage[];
    activePageId: string | null;
    onSelectPage: (id: string) => void;
    onAddPage: () => void;
    className?: string;
}

export function AppSidebar({
    pages,
    activePageId,
    onSelectPage,
    onAddPage,
    className,
}: AppSidebarProps) {
    const [searchQuery, setSearchQuery] = useState("");

    const filteredPages = pages.filter((page) => {
        const query = searchQuery.toLowerCase();
        return (
            page.title.toLowerCase().includes(query) ||
            (page.summary?.toLowerCase() || "").includes(query) ||
            (page.fact?.toLowerCase() || "").includes(query)
        );
    });

    return (
        <div className={cn("flex flex-col h-full border-r bg-muted/30", className)}>
            {/* Header */}
            <div className="p-4 border-b space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <Book className="h-5 w-5 text-primary" />
                        <span>My Notebook</span>
                    </div>
                    <ModeToggle />
                </div>
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="検索..."
                        className="pl-8 bg-background"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Page List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    <Button
                        variant="default"
                        className="w-full justify-start gap-2 mb-4"
                        onClick={onAddPage}
                    >
                        <Plus className="h-4 w-4" />
                        新しいページ
                    </Button>

                    {filteredPages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            ページが見つかりません
                        </div>
                    ) : (
                        filteredPages.map((page) => (
                            <button
                                key={page.id}
                                onClick={() => onSelectPage(page.id)}
                                className={cn(
                                    "w-full flex flex-col items-start gap-1 p-3 rounded-md text-sm transition-colors hover:bg-accent text-left",
                                    activePageId === page.id
                                        ? "bg-accent text-accent-foreground font-medium"
                                        : "text-muted-foreground"
                                )}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    {page.isFavorite && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400 shrink-0" />}
                                    <FileText className="h-3 w-3 shrink-0" />
                                    <span className="truncate">{page.title || "無題のページ"}</span>
                                </div>
                                <span className="text-xs opacity-70 pl-5">
                                    {format(page.createdAt, "MM/dd HH:mm", { locale: ja })}
                                </span>
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
