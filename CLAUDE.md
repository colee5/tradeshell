# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TradeShell is a trading platform monorepo with two packages:

- **api/** - NestJS v11 backend API (port 3001)
- **cli/** - React Ink terminal UI application

**Package Manager:** Bun (uses `bun.lock` and workspaces). Always use `bun` commands, never `npm`.

## Development Commands

### Monorepo-wide

```bash
bun install              # Install all dependencies
bun run check-types      # Type check all packages
bun run format           # Format all code
bun run lint             # Lint all code (xo)
```

### API (from /api)

```bash
bun run dev              # Development with hot reload (alias: bun run start:dev)
bun run build            # Build for production
bun run test             # Run unit tests
bun run test:e2e         # Run E2E tests
bun run lint             # ESLint
bun run check-types      # TypeScript type check
```

### CLI (from /cli)

```bash
bun run dev              # Watch mode with hot reload
bun start                # Run the CLI
bun run build            # Compile TypeScript
bun run generate:api     # Regenerate API types from swagger.json
bun run check-types      # TypeScript type check
```

## Architecture

### API (NestJS)

Standard NestJS modular architecture:

- `src/main.ts` - Bootstrap (port 3001)
- `src/app.module.ts` - Root module
- Feature modules: `config/`, `blockchain/`, `wallet/`
- Uses Swagger for API documentation (`swagger.json`)

### CLI (React Ink)

Terminal UI with React components:

- `source/cli.tsx` - Entry point
- `source/commands/` - Command handlers
- `source/components/` - UI components
- `source/lib/` - Utilities, atoms (Jotai), schemas (Zod), generated API types
- `source/providers/` - React context providers

**State Management:** Jotai atoms in `source/lib/atoms/`

**API Integration:** Types auto-generated from backend Swagger via hey-api. Run `bun run generate:api` when backend API changes. Import hooks from `source/lib/hooks/api-hooks.ts`, not directly from generated files.

**Forms:** React Hook Form with Zod schemas in `source/lib/schemas/`

## Patterns & Guidelines

Reference `.claude/patterns/` for project-specific patterns:

- `error-handling.md` - Error handling patterns for NestJS + viem blockchain operations
- `dto-guide.md` - DTO and validation patterns
- `return-types.md` - When to use explicit return types (async/values: yes, sync void: no)
- `comments.md` - Use `//` only, be concise, no JSDoc param/return annotations

## Code Style

### TypeScript

- Use `type` over `interface` for type definitions
- Component props type should be named `Props`
- Strict mode enabled

### Linting

- API: ESLint with Prettier
- CLI: XO with xo-react config
- Pre-commit hooks via Husky + lint-staged

### Commits

Conventional commits enforced via commitlint.
