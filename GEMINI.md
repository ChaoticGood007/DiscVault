# DiscVault - Professional Disc Golf Inventory Management

DiscVault is a professional-grade, self-hosted disc golf inventory management system. It uses a "Vault-first" architecture, allowing users to manage multiple separate collections (e.g., Main Bag, Storage, Collector's Vault) within a single unified interface.

## 🚀 Project Overview

- **Core Concept:** Manage disc golf discs across multiple "Vaults" (DiscCollections).
- **Primary Entities:** 
    - `Mold`: Technical specifications of a disc (Brand, Name, Speed, Glide, Turn, Fade).
    - `DiscCollection`: A named container (Vault) for discs.
    - `Inventory`: Individual disc instances belonging to a Mold and optionally a Collection.
- **Key Features:** Interactive CSV importer, flight number filtering, collection analytics, and infinite scroll browsing.

## 🛠️ Technical Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** SQLite with Prisma 6
- **Styling:** Tailwind CSS 4
- **UI Components:** Lucide Icons, Recharts (for stats), Framer Motion (for animations)
- **State Management:** Server Actions for mutations, `revalidatePath` for cache invalidation.

## 📂 Project Structure

- `src/app/`: Next.js routes and layouts.
    - `src/app/actions/`: Server Actions for database mutations (collections, inventory, molds).
    - `src/app/v/[vaultId]/`: Vault-specific views and management.
- `src/components/`: Reusable React components (Forms, Lists, Charts, Search).
- `src/lib/`: Core utilities (Prisma client, analytics).
- `src/scripts/`: Maintenance and utility scripts (CSV import, sync).
- `prisma/`: Database schema definition.
- `public/`: Static assets.

## ⌨️ Key Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install all dependencies |
| `npm run dev` | Start the development server at `http://localhost:3000` |
| `npm run build` | Build the application for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint checks |
| `npx prisma db push` | Push schema changes to the SQLite database |
| `npx prisma studio` | Open Prisma Studio to browse the database |

## 🏗️ Development Conventions

- **Server Actions:** All data mutations (Create, Update, Delete) should be implemented as Server Actions in `src/app/actions/`.
- **Database Access:** Use the Prisma client singleton exported from `@/lib/prisma`.
- **Styling:** Use Tailwind CSS for all styling. Follow the "Forced Light Theme" (Slate palette) as established in the UI.
- **Icons:** Use `lucide-react` for all icons.
- **Validation:** Always revalidate paths using `revalidatePath` after a mutation to ensure the UI stays in sync.
- **Copyright Headers:** Files should include the appropriate license header as specified in the LICENSE (GPLv3) and README (Apache-2.0 for source headers) files. Use 'Copyright 2026 ChaoticGood007' for new files.
- **Agent Workflows:** Automatically execute `docker compose up --build -d` natively via the terminal whenever completing any substantive code edits or feature deployments to ensure the user's mapped container gracefully syncs the new architecture.
- **Strict Merge Policy:** DO NOT merge pull requests, push directly to main, or create releases/tags without explicit, unambiguous instructions from the user to do so. You may stage changes, commit, push branches, and open PRs, but you must stop and wait for approval before merging.
- **Keep the Changelog up to date** - Always update the changelog after completing any substantive code edits or feature deployments. Try to keep to one entry per actual feature that a user might notice as they use the app.

## 📊 Data Model (Prisma)

- **Mold**: Stores the static data for a disc type (e.g., Discraft Buzz).
- **DiscCollection**: Represents a "Vault" or workspace.
- **Inventory**: Represents a physical disc (Weight, Plastic, Color, Condition, etc.) linked to a Mold and a Collection.
