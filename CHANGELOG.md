# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
