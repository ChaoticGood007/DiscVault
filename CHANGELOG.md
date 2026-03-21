# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-03-20

### Changed
- **Global Settings Expansion:** Relocated the "Sync Global DB" manual trigger completely out of localized Vault statistic dashboards and permanently mounted it natively inside the global `/settings` Configuration panel under a dedicated Database Engine module.
- **Analytics Theming:** Rewrote `Recharts` SVG properties across the Analytics dashboard to aggressively consume dynamically generated CSS `var()` targets natively, matching the Global Accent Color configuration rather than rendering static legacy hex codes.
- **Global Header UX:** Aggressively decoupled the `<header>` structural constraints from the `layout.tsx` wrapper mapping. Built a modular `<Header>` React artifact specifically to absorb localized metadata dynamically.
- **TopBar Consolidation:** Transferred the "Active Workspace" contextual payload (Vault Name, Total Disc Inventory, and 4-Link Navigation Tabs) physically into the centralized Global Top Navbar. Eradicated the massive secondary title banner previously sitting underneath the header, saving over 120 pixels of vertical screen estate.
- **Workflow Protection:** Initialized rigorous GitHub Branch Protection rules locking `main` against direct pushes natively. Workflows gracefully evaluate against standard container registry PR checks proactively.

## [0.1.2] - 2026-03-19

### Added
- **Global Settings & Theming:** Added a universal Settings page (`/settings`) accessible via a top navigation Gear icon. Users can now pick a custom Hex Accent Color overriding default palettes natively. 
- **Real-Time Live Previews:** The color picker leverages Tailwind V4 core dictionary injection via `document.body` to instantaneously re-render the app's components strictly without waiting for asynchronous DB reload loops.

### Changed
- **Mobile Density Restructuring:** Aggressively compressed HTML padding barriers across the app ensuring efficient screen density on mobile devices. Master layout padding, Workspace Navigation margins, and overarching Toolbar heights were systematically halved.
- **Card Truncation Bypass:** Abandoned strict CSS Grid constraints (`max-w-[80px]`) for `Plastic` and `Color` attributes over standard Disc Cards. Rewrote the rendering protocol natively into CSS Flex. Long strings (like `Metal Flake Glow C-Blend`) can now radically stretch taking upwards of 40% of standard viewport dimensions.
- **Luminance Ratio Fallbacks:** Mathematical Contrast logic automatically analyzes the user's core UI settings. If users purposely dictate incredibly bright primary arrays (such as `#FFFFFF` or neon yellow), all descendants carrying `.text-white` automatically mutate into `text-slate-900` natively to protect visibility!

### Fixed
- **Mobile Scroll Shift Bug:** Eliminated standard `calc(100dvh-x)` screen bounding structures on standard viewports natively. Utilizing standard `body` scrolling entirely cures violent interface layout jitter triggered by toolbars hiding organically.

## [0.1.1] - 2026-03-19

### Fixed
- **Dashboard Double-Scrolling Bug**: Refactored the core Next.js routing structures (`src/app/v/[vaultId]/layout.tsx` and `page.tsx`) to implement dynamic Flexbox window bounding (`h-[calc(100dvh-176px)]`). The outer page scrollbar is naturally eliminated by securely evaluating the Active Workspace header heights natively.
- **Table Column Squishing**: Patched the dataset `InventoryList` components with `whitespace-nowrap`, enabling perfect horizontal scrolling without crushing textual data. The table's scrollbar is now permanently pinned to the bottom of the user's viewport, dramatically improving UX.

## [0.1.0] - 2026-03-19

### Added
- **Multi-Edit Inventory**: Added the ability to select multiple discs in the inventory table and bulk edit their properties (`inBag`, `condition`, `weight`, `plastic`, and `location`) natively inside a new `BulkEditModal`.
- **Bulk Update Actions**: Expanded `inventory.ts` server actions with `bulkUpdateInventory` to safely perform partial batched database queries.

### Fixed
- **Table Sorting Navigation**: Resolved a bug where clicking a column header to sort the inventory table would forcefully lose the current Vault context and redirect back to the app root menu. The URL builder now smartly utilizes `usePathname()` to construct relative URLs.
