# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-03-28

### Added
- **Data Normalization Filter**: Added dynamic category mapping rules to sync legacy "Fairway", "Driver", and "Utility" aliases strictly to Discit API schemas when importing custom spreadsheet CSVs.
- **Legacy DB Normalizer**: Added a "Normalize Legacy Data" button to the `/settings` page. Triggers a smart scan across all existing Molds, resolving legacy aliases and typos against the canonical API synonym map without requiring a migration.
- **Global Cookie Filter Resilience**: Built a client-side `FilterPreserver` that continuously writes the active vault URL state to a 30-day browser cookie. The `Inventory` tab link and `VaultSwitcher` dropdown now read the live cookie at click-time, so jumping to Analytics, Stats, or another Vault and returning always restores your exact filter combination.

### Fixed
- **Dashboard Filter Collisions**: Refactored core Prisma query construction in both vault and global dashboard views. Search, Bag, and multi-select filters now correctly compose via a nested `AND` array instead of overwriting each other.
- **Strict Search Parity**: Resolved a bug where text search implicitly forced an `AND` match across name, brand, and category simultaneously. Search now executes as a broad `OR` across all relevant fields as intended.
- **View/Edit Return Navigation**: Viewing or editing a disc no longer hard-redirects to the vault root, discarding active filters. Both the Detail View and Edit Form now call `router.back()` after saving/cancelling, returning the user to their exact previous state.
- **Location ID Crash**: Removed a dependency on the Crypto Web API (`crypto.randomUUID`) inside the Location Tree editor that caused crashes on non-HTTPS self-hosted networks.
- **Tree Migrator Button Restored**: The "Import from Inventory" button in the Location Tree editor is now correctly wired up again.
- **React Architectural Performance**: Lifted sub-components out of render bodies in `BulkEditModal` and resolved `useEffect` cascades in `MobileFilterDrawer`, eliminating input focus-loss and unnecessary double-renders.
- **Code Sanctity**: Replaced 30+ `any` type annotations with explicit Prisma types and removed 50+ unused imports across the codebase.


## [0.2.0] - 2026-03-23

### Added
- **Multi-Bag Selector UI**: Replaced the binary "In Bag" toggle with a professional Bag Selector dropdown. Users can now filter their vault by "All Bags", "No Bag", or select a specific named bag (e.g., "Main Bag", "Storage Bin") defined in their vault's location tree.
- **Global Bag Aggregation**: The "All Vaults" dashboard now intelligently aggregates all unique bag names from every vault, allowing for cross-vault bag filtering.
- **Multi-Bag Mobile Support**: Integrated the bag selector into the Mobile Filter Drawer for a consistent experience on all devices.
- **Multi-Select Filters**: Upgraded the generic filtering experience natively across the board. Brand, Category, Plastic, Color, Stamp, and Stamp Foil are now fully multi-selectable via a newly engineered dropdown component dynamically populated with distinct values from your inventory database. Free-text database entry is fully preserved while enabling powerful multi-value query combinations in the UI.
- **Focus Mode (Detail View)**: Created a dedicated read-only screen for viewing detailed disc metadata, decoupling the interface from the generic Edit Form.
- **Mobile Filter Drawer**: Replaced standard top-bar inline dropdowns with a full-screen, slide-out UI on mobile devices for vastly superior usability.
- **Organizational Colors**: Users can now bind custom HEX targets to specific disc categories from settings. Natively renders as vibrant visual accent strips on dashboard cards.
- **Persistent Table Columns**: Converted the Visible Columns tracking state natively out of rigid URL properties into global browser Cookies. The table layout perfectly remembers itself organically across completely disconnected page routes.
- **Universal Filter Panel**: Extended the Advanced Filters panel with text-search fields for Plastic, Color, and Stamp. Location filtering is now a fully interactive folder-style tree picker sourced from the configured Location Tree in Settings — supports multi-select, parent-selects-children, partial selection indicators, and expand/collapse per folder.

### Changed
- **Pure Multi-Bag Architecture**: Transitioned the entire bagging system to be derived from the Vault's location tree. The redundant `inBag` database property has been removed, significantly simplifying the data model. 
- **Inherited Bag Status**: Locations in the settings tree now visually indicate if they are part of a bag through inheritance. Manual "In Bag" toggling is automatically disabled for child nodes of existing bags to prevent conflicting definitions.
- **Refactored Dashboard Logic**: Dashboard filtering (All Bags, No Bag, Specific Bags) now utilizes location-prefix matching, ensuring that discs in sub-locations (e.g., "Main Bag / Putters") are correctly included in their parent bag's categories.
- **Streamlined UI**: Removed redundant "In Bag" toggles from Add/Edit forms, Bulk Edit, and CSV Importer. Bag status is now purely a function of where a disc is placed.
- **Visual Focus & Hierarchy**: Heavily audited form-input paddings, typography contrasts, and spacing to decrease visual density natively and improve primary data scannability.


## [0.1.3] - 2026-03-20

### Added
- **Location Tree System:** Engineered a hierarchical "Vault-first" location system. Users can now define nested storage locations (e.g., `Main Bag` → `Putter Pocket`) in Settings with full Drag-and-Drop support and Indent/Dedent controls.
- **Smart "In Bag" Automation:** Disc instances now automatically derive their "In Bag" status from the selected tree node. Suitcase icons (🎒) in the editor flag entire branches as part of the active bag.
- **Location Migration Helper:** Added a one-click migrator in Settings that rebuilds the location tree from all existing free-text inventory strings.
- **Customizable Fields:** The Fields/Columns picker now controls which data points render on cards and table rows — toggles include Bag, Brand, Mold, Category, Flight Numbers (grouped), Plastic, Weight, Color, Stamp, Cond, Ink, Location, Notes, and Added. Mold is locked as required since it doubles as the edit entry point.
- **Export Button Restored:** CSV export was lost in a previous refactor and has been re-added to both vault and All Vaults layouts.
- **Vault Renaming:** Vaults can now be renamed directly from the management interface.

### Changed
- **Premium User Experience:** Integrated **Framer Motion** for high-fidelity animations, specifically for the new animated inline deletion confirmation UI.
- **Zero-Vulnerability Security:** Patched critical Prisma/Effect vulnerabilities using surgical **npm dependency overrides** (Effect 3.20.0).
- **Global Settings Expansion:** Relocated the "Sync Global DB" manual trigger out of vault stat dashboards into the global `/settings` panel under a dedicated Database Engine module.
- **Analytics Theming:** Rewrote Recharts SVG properties to consume dynamically generated CSS `var()` targets matching the Global Accent Color rather than static hex codes.
- **Global Header UX:** Decoupled `<header>` from `layout.tsx` and built a modular `<Header>` component to absorb localized metadata dynamically.
- **TopBar Consolidation:** Moved vault name, total disc count, and nav tabs into the Global Top Navbar. Removed the secondary title banner, saving ~120px of vertical space.
- **Workflow Protection:** Added GitHub Branch Protection rules locking `main` against direct pushes.
- **Minimalist Card Redesign:** Weight pill moved to top-right corner; Color swatch + Plastic moved inline under disc title alongside Category, Stamp, and Foil (2px pill dividers). "Added" date absolutely positioned at bottom-right, contributing no vertical height. Floating edit button removed — clicking the Mold name opens the edit page instead.
- **Native UI Elements Replaced:** Browser `<select>` dropdowns for Category and Brand replaced with custom animated panels. `type="number"` spinners in Advanced Search replaced with clean text inputs.
- **Bug Fixes:** Fixed z-index collision causing the Fields dropdown to render behind the table header; fixed "Added" column misalignment in table view; removed duplicate nav bar from the All Vaults page.

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
