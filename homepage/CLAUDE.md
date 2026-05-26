# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Business homepage application covering company introduction, contact information, product features, and recruitment information.

**Stack:** React 19, Next.js 15 (App Router), TypeScript (strict), Tailwind CSS, Prisma ORM + PostgreSQL, TanStack Query (React Query), NextAuth.js

## Commands

```bash
npm run dev          # Start dev server on port 3000
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest unit tests
npm run test:e2e     # Playwright e2e tests

npx prisma db push       # Sync schema to DB (dev, no migration history)
npx prisma migrate dev   # Create and apply a migration
```

## Architecture

- **Routing:** Next.js 15 App Router — all pages under `app/`, server components by default, client components use `"use client"` directive.
- **Data fetching:** TanStack Query for all client-side server state. Do not lift server state into Context.
- **Global state:** React Context for UI/client-only global state only.
- **API routes:** Located under `app/api/`. All responses follow `{ success: boolean, data?: any, error?: string }`.
- **Auth:** NextAuth.js — config at `app/api/auth/[...nextauth]/`.
- **Database:** Prisma schema at `prisma/schema.prisma`. Run `prisma migrate dev` for schema changes in development.
- **Components:** `components/` directory, organized by responsibility/feature.

## Conventions

- **Naming:** Component files PascalCase (`UserProfile.tsx`), utilities camelCase (`formatCurrency.ts`), constants UPPER_SNAKE_CASE.
- **Styling:** Tailwind CSS only — no separate `.css` files.
- **TypeScript:** `strict: true`. Avoid `any`; use `unknown` when type is uncertain.
- **Error handling:** `try-catch` on all async API calls. Show a Toast notification to the user and `console.error` the full error.
- **Commits:** Angular convention — `feat:`, `fix:`, `docs:`, `refactor:` prefixes.

When writing new code or reviewing existing code, check for and fix any violations of the above conventions in the same change.
