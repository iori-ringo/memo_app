"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { v4 as uuidv4 } from "uuid";
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { NotebookCanvas } from "@/components/notebook/notebook-canvas";
// import { NotebookSpread } from "@/components/notebook/notebook-spread";
import { NotePage } from "@/types/note";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AnimatePresence, motion } from "framer-motion";

const INITIAL_PAGE: NotePage = {
  id: "1",
  notebookId: "default",
  title: "メモの魔力 - 実践ノート",
  summary: "このアプリの使い方とコンセプト",
  tags: ["Guide"],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  fact: "<p>これは『メモの魔力』を実践するためのデジタルノートです。</p><ul><li>左ページに事実を書く</li><li>右ページで抽象化と転用を行う</li></ul>",
  abstraction: "<p>物理ノートの制約（ページの終わり）がなく、かつデジタルの利便性（検索、編集）を兼ね備えている。</p>",
  diversion: "<p>毎日の気づきをここに記録し、週末に見返す習慣をつける。</p>",
  objects: [],
  strokes: [],
  connections: [],
};

export default function Home() {
  const [pages, setPages] = useState<NotePage[]>([]);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();

  // Load data
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const loadData = async () => {
      if (window.electronAPI) {
        try {
          const saved = await window.electronAPI.loadPages();
          if (saved) {
            setPages(saved);
            if (saved.length > 0) {
              setActivePageId(saved[0].id);
            }
          } else {
            setPages([INITIAL_PAGE]);
            setActivePageId(INITIAL_PAGE.id);
          }
        } catch (e) {
          console.error("Failed to load pages from Electron", e);
          setPages([INITIAL_PAGE]);
          setActivePageId(INITIAL_PAGE.id);
        }
      } else {
        const saved = localStorage.getItem("magic-notebook-pages");
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setPages(parsed);
            if (parsed.length > 0) {
              setActivePageId(parsed[0].id);
            }
          } catch (e) {
            console.error("Failed to load pages", e);
            setPages([INITIAL_PAGE]);
            setActivePageId(INITIAL_PAGE.id);
          }
        } else {
          setPages([INITIAL_PAGE]);
          setActivePageId(INITIAL_PAGE.id);
        }
      }
    };

    loadData();
  }, [isClient]);

  // Auto-save
  // Auto-save
  useEffect(() => {
    if (isClient && pages.length > 0) {
      if (window.electronAPI) {
        window.electronAPI.savePages(pages);
      } else {
        localStorage.setItem("magic-notebook-pages", JSON.stringify(pages));
      }
    }
  }, [pages, isClient]);

  const handleAddPage = useCallback(() => {
    const newPage: NotePage = {
      id: uuidv4(),
      notebookId: "default",
      title: "",
      summary: "",
      tags: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fact: "",
      abstraction: "",
      diversion: "",
      objects: [],
      strokes: [],
      connections: [],
    };
    setPages((prev) => [newPage, ...prev]);
    setActivePageId(newPage.id);
  }, []);

  // Electron listeners
  useEffect(() => {
    if (!window.electronAPI) return;

    const cleanupNewPage = window.electronAPI.onNewPage(() => {
      handleAddPage();
    });

    const cleanupToggleDark = window.electronAPI.onToggleDark(() => {
      setTheme(resolvedTheme === "dark" ? "light" : "dark");
    });

    return () => {
      cleanupNewPage();
      cleanupToggleDark();
    };
  }, [handleAddPage, resolvedTheme, setTheme]);

  const handleUpdatePage = (id: string, updates: Partial<NotePage>) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === id ? { ...page, ...updates, updatedAt: Date.now() } : page
      )
    );
  };

  const activePage = pages.find((p) => p.id === activePageId) || pages[0];

  if (!isClient) return null; // Prevent hydration mismatch

  return (
    <div className="flex h-screen w-full bg-stone-100 dark:bg-stone-950 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full border-r bg-background">
        <AppSidebar
          pages={pages}
          activePageId={activePageId}
          onSelectPage={setActivePageId}
          onAddPage={handleAddPage}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center p-4 border-b bg-background">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="p-0 w-72">
              <AppSidebar
                pages={pages}
                activePageId={activePageId}
                onSelectPage={(id) => {
                  setActivePageId(id);
                  // Close sheet logic would go here if controlled
                }}
                onAddPage={handleAddPage}
                className="border-none"
              />
            </SheetContent>
          </Sheet>
          <span className="ml-4 font-semibold">Memo of Magic</span>
        </div>

        {/* Notebook Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 flex justify-center">
          <div className="w-full max-w-7xl h-full min-h-[800px]">
            <AnimatePresence mode="wait">
              {activePage ? (
                <motion.div
                  key={activePage.id}
                  initial={{ opacity: 0, rotateY: 90, transformOrigin: "left" }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  exit={{ opacity: 0, rotateY: -90, transformOrigin: "right" }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="w-full h-full"
                  style={{ perspective: "1000px" }}
                >
                  <NotebookCanvas
                    page={activePage}
                    onUpdate={handleUpdatePage}
                  />
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  ページを選択または作成してください
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
