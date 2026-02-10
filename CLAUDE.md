# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeShell is a trading platform monorepo with two packages:

- **packages/core/** - Shared services, types, constants, and utilities (`@tradeshell/core`)
- **packages/cli/** - React Ink terminal UI application (`@tradeshell/cli`)

The CLI communicates with core services via a **Bun Worker thread + RPC**. There is no separate API server — core services run in-process in a Worker.

**Package Manager:** Bun (uses `bun.lock` and workspaces). Always use `bun` commands, never `npm`.

## Development Commands

### Monorepo-wide

```bash
bun install              # Install all dependencies
bun run check-types      # Type check all packages
bun run format           # Format all code
bun run lint             # Lint all code (xo)
bun run build            # Build all (core first, then cli)
```

### Core (from packages/core)

```bash
bun run build            # Compile TypeScript (outputs to dist/)
bun run dev              # Watch mode
bun run check-types      # TypeScript type check
```

### CLI (from packages/cli)

```bash
bun run dev              # Watch mode with hot reload
bun start                # Run the CLI
bun run build            # Compile TypeScript
bun run check-types      # TypeScript type check
```

## Architecture

### Core (`@tradeshell/core`)

Plain TypeScript package — no framework dependencies:

- `src/constants/` - Chain definitions, file paths, event names
- `src/types/` - Zod schemas + inferred types for config, wallet
- `src/utils/` - Crypto utilities (master key, private key encryption)
- `src/services/` - ConfigService, WalletService, BlockchainService, error classes, logger

Services use Node.js `EventEmitter` for internal events. Types are defined with Zod schemas and exported as inferred TypeScript types.

### CLI (`@tradeshell/cli`)

Terminal UI with React components:

- `source/cli.tsx` - Entry point
- `source/commands/` - Command handlers
- `source/components/` - UI components
- `source/lib/rpc/` - Worker RPC layer (rpc-client, worker, types)
- `source/lib/hooks/` - TanStack Query hooks wrapping RPC calls
- `source/lib/` - Utilities, atoms (Jotai), schemas (Zod)
- `source/providers/` - React context providers

**State Management:** Jotai atoms in `source/lib/atoms/`

**RPC Layer:** The CLI spawns a Bun Worker (`lib/rpc/worker.ts`) that boots core services. UI hooks in `lib/hooks/api-hooks.ts` call `rpc-client.ts` which communicates via `postMessage`. Types are imported directly from `@tradeshell/core` — no codegen needed.

**Forms:** React Hook Form with Zod schemas in `source/lib/schemas/`

## Patterns & Guidelines

Reference `.claude/patterns/` for project-specific patterns:

- `error-handling.md` - Error handling patterns for viem blockchain operations
- `return-types.md` - When to use explicit return types (async/values: yes, sync void: no)
- `comments.md` - Use `//` only, be concise, no JSDoc param/return annotations

## Code Style

### TypeScript

- Use `type` over `interface` for type definitions
- Component props type should be named `Props`
- Strict mode enabled

### Linting

- CLI: XO with xo-react config
- Core: Prettier
- Pre-commit hooks via Husky + lint-staged

### Commits

Conventional commits enforced via commitlint.
