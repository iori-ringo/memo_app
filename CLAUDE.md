# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Magic Memo is a macOS desktop note-taking application built with Electron + Next.js. It implements a structured note methodology: "事実 → 抽象化 → 転用" (Fact → Abstraction → Diversion) with a canvas-based UI for spatial note organization.

## Development Commands

```bash
npm run electron:dev     # Full stack dev (Electron + Next.js)
npm run dev              # Next.js only (web preview)
npm run electron:build   # Production build (creates .dmg)
npm run lint             # Biome lint check
npm run lint:fix         # Auto-fix lint errors
npm run format           # Format code
```

**Environment setup:**
```bash
cp .env.example .env.local  # Add GEMINI_API_KEY for AI features
```

## Architecture

### Feature-Based Module Structure
Dependency direction: `app → features → shared → lib → types`

```
src/
├── app/              # Next.js App Router (thin routing layer)
├── features/         # Self-contained feature modules
│   ├── notebook/     # Canvas + editor (core feature)
│   ├── notes/        # Data persistence & CRUD
│   └── sidebar/      # Navigation & page list
├── shared/           # Cross-feature UI (shadcn components)
├── lib/              # Platform adapters & utilities
└── types/            # Global type definitions (.d.ts for Electron/Web sharing)

electron/
├── main.ts           # App entry point
├── preload.ts        # IPC bridge (contextBridge)
├── handlers/         # IPC handlers (ai, data)
├── store/            # electron-store persistence
└── window/           # Window & menu management
```

### Key Patterns

**Platform Adapter** (`src/lib/platform-events.ts`): Abstracts Electron IPC, falls back to no-ops in browser.

**Storage Adapter** (`src/features/notes/services/note-storage.ts`): Routes to electron-store or localStorage based on environment.

**Canvas Hook Composition**: Notebook canvas logic split into focused hooks:
- `use-canvas-layout.ts` - Section boundary calculations
- `use-canvas-operations.ts` - Object CRUD
- `use-canvas-selection.ts` - Focus/selection state
- `use-canvas-shortcuts.ts` - Keyboard modes & shortcuts

**`useRef` Latest Value Pattern**: Event listeners registered once at mount, state accessed via `ref.current` to avoid recreation (Vercel React Best Practice).

### Type Sharing (SSoT)
Types in `src/types/*.d.ts` are shared between Electron and Next.js. Using `.d.ts` avoids `rootDir` conflicts with separate TypeScript configs.

## Code Style (Biome)

- Tab indentation, 100 char line width
- Single quotes (JS), double quotes (JSX)
- No semicolons
- Props defined with `type` (not `interface`) to prevent declaration merging

## Electron Security

- `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`
- IPC channels defined in `electron/ipc/types.ts`
- Input validation in `electron/utils/validators.ts`

## Key Entry Points

- **App shell**: `src/features/notes/components/home-content.tsx`
- **Canvas UI**: `src/features/notebook/components/canvas/notebook-canvas.tsx`
- **Note state**: `src/features/notes/hooks/use-notes.ts`
- **Electron main**: `electron/main.ts`
