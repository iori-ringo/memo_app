"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme } from "next-themes";
import { v4 as uuidv4 } from "uuid";
import { AppSidebar } from "@/components/features/sidebar/app-sidebar";
import { NotebookCanvas } from "@/components/features/notebook/notebook-canvas";

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
					const [savedPages, config] = await Promise.all([
						window.electronAPI.loadPages(),
						window.electronAPI.loadConfig(),
					]);

					if (savedPages) {
						setPages(savedPages);
						if (savedPages.length > 0) {
							// Try to restore last active page
							const lastActiveId = config?.lastActivePageId;
							const targetPage = savedPages.find((p: any) => p.id === lastActiveId);
							setActivePageId(targetPage ? targetPage.id : savedPages[0].id);
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
				const savedConfig = localStorage.getItem("magic-notebook-config");

				if (saved) {
					try {
						const parsed = JSON.parse(saved);
						setPages(parsed);
						if (parsed.length > 0) {
							let targetId = parsed[0].id;
							if (savedConfig) {
								try {
									const parsedConfig = JSON.parse(savedConfig);
									if (parsedConfig.lastActivePageId && parsed.find((p: any) => p.id === parsedConfig.lastActivePageId)) {
										targetId = parsedConfig.lastActivePageId;
									}
								} catch (e) {
									console.error("Failed to parse config", e);
								}
							}
							setActivePageId(targetId);
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

		// Auto-cleanup old trash (>2 weeks)
		const cleanupOldTrash = () => {
			const twoWeeksAgo = Date.now() - (14 * 24 * 60 * 60 * 1000);
			setPages((prev) => {
				const cleaned = prev.filter((page) => {
					if (page.deletedAt && page.deletedAt < twoWeeksAgo) {
						return false; // Remove if deleted more than 2 weeks ago
					}
					return true;
				});
				return cleaned;
			});
		};
		cleanupOldTrash();
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

	// Save active page ID
	useEffect(() => {
		if (!isClient || !activePageId) return;

		if (window.electronAPI) {
			window.electronAPI.saveConfig({ lastActivePageId: activePageId });
		} else {
			const config = { lastActivePageId: activePageId };
			localStorage.setItem("magic-notebook-config", JSON.stringify(config));
		}
	}, [activePageId, isClient]);

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

	const handleUpdatePageTitle = async (id: string, newTitle: string) => {
		const updatedPages = pages.map((page) =>
			page.id === id ? { ...page, title: newTitle, updatedAt: Date.now() } : page
		);
		setPages(updatedPages);
		if (window.electronAPI) {
			await window.electronAPI.savePages(updatedPages);
		}
	};

	// Soft delete - set deletedAt timestamp
	const handleDeletePage = async (id: string) => {
		console.log("handleDeletePage called with id:", id);
		const updatedPages = pages.map((page) =>
			page.id === id ? { ...page, deletedAt: Date.now(), updatedAt: Date.now() } : page
		);
		console.log("Updated pages:", updatedPages);
		setPages(updatedPages);

		// If deleting the active page, switch to another non-deleted page
		if (activePageId === id) {
			const nextActivePage = updatedPages.find((p) => p.id !== id && !p.deletedAt);
			setActivePageId(nextActivePage?.id || null);
		}

		if (window.electronAPI) {
			await window.electronAPI.savePages(updatedPages);
		}
	};

	// Restore from trash
	const handleRestorePage = async (id: string) => {
		const updatedPages = pages.map((page) =>
			page.id === id ? { ...page, deletedAt: undefined, updatedAt: Date.now() } : page
		);
		setPages(updatedPages);

		if (window.electronAPI) {
			await window.electronAPI.savePages(updatedPages);
		}
	};

	// Permanent delete
	const handlePermanentDeletePage = async (id: string) => {
		if (!confirm("このページを完全に削除してもよろしいですか？この操作は取り消せません。")) return;

		const updatedPages = pages.filter((page) => page.id !== id);
		setPages(updatedPages);

		if (activePageId === id) {
			setActivePageId(null);
		}

		if (window.electronAPI) {
			await window.electronAPI.savePages(updatedPages);
		}
	};

	return (
		<div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
			{/* Desktop Sidebar */}
			<div className="hidden md:block w-64 shrink-0 h-full">
				<AppSidebar
					pages={pages}
					activePageId={activePageId}
					onSelectPage={setActivePageId}
					onAddPage={handleAddPage}
					onUpdatePageTitle={handleUpdatePageTitle}
					onDeletePage={handleDeletePage}
					onRestorePage={handleRestorePage}
					onPermanentDeletePage={handlePermanentDeletePage}
					className="h-full w-full border-r"
				/>
			</div>

			{/* Mobile Drawer */}
			<div className="md:hidden fixed top-4 left-4 z-50">
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="outline" size="icon">
							<Menu className="h-4 w-4" />
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="p-0 w-80">
						<AppSidebar
							pages={pages}
							activePageId={activePageId}
							onSelectPage={(id) => {
								setActivePageId(id);
							}}
							onAddPage={handleAddPage}
							onUpdatePageTitle={handleUpdatePageTitle}
							onDeletePage={handleDeletePage}
							onRestorePage={handleRestorePage}
							onPermanentDeletePage={handlePermanentDeletePage}
						/>
					</SheetContent>
				</Sheet>
			</div>

			{/* Main Content */}
			<div className="flex-1 flex flex-col h-full overflow-hidden relative">
				{/* Mobile Header */}
				<div className="md:hidden flex items-center p-4 border-b bg-background">
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
