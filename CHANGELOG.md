# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.3] - 2026-03-20

### Added
- **Customizable Card Fields:** The Fields/Columns picker in the toolbar now controls which data points appear on inventory cards and table rows. Users can toggle: Bag, Brand, Mold, Category, Flight Numbers, Plastic, Weight, Color, Stamp, Cond, Ink, Location, Notes, and Added.
- **Notes Field:** `Notes` was missing from the Fields selector entirely — now wired up across both Card and Table views.
- **Color & Stamp Fields:** `Color` and `Stamp` were also missing from the selector — both are now fully togglable.
- **Flight Numbers Grouped Toggle:** Replaced the four individual Speed/Glide/Turn/Fade toggles with a single "Flight Numbers" group toggle that shows/hides all four simultaneously.
- **Vault Renaming:** Users can now rename vaults they have created directly from the vault management interface.
- **Export Button Restored:** The CSV export button was lost during a previous UI refactor and has been re-added to both the single vault and All Vaults layouts.

### Changed
- **Card Layout — Minimalist Design:**
  - Weight moved to top-right of the card (opposite the Brand pill), taking zero vertical space.
  - Color swatch + label moved inline into the sub-header row alongside Category, Stamp, and Foil — separated by 2px vertical pill dividers instead of dots.
  - Foil renders before Stamp in the tag sequence.
  - Plastic and Weight removed from the bottom attribute grid; Plastic is now inline text, Weight is the top-right pill.
  - "Added" date is now absolutely positioned at the bottom-right of the card, contributing zero vertical height.
  - Reduced internal card padding across all sections.
- **Attribute Grid:** Remaining bottom grid fields (Cond, Ink, Location) wrap in a `grid-cols-3` layout instead of a horizontal flex row — eliminates horizontal scrollbars when many fields are active.
- **Edit Navigation:** Removed the floating hover Edit button from cards entirely. Clicking the Mold name now navigates to the edit page. Same change applied to the table — Mold name is now the edit link, Actions column removed.
- **Mold Field Locked:** The "Mold" field in the Fields selector is now marked `Required` and cannot be toggled off, since it is the edit entry point.
- **Toolbar Dropdowns:** Replaced the browser-native `<select>` elements for Category and Brand filters with custom animated dropdown menus matching the app's design language — pill buttons that turn solid indigo when active, animated panels with check marks, click-outside to dismiss.
- **Advanced Search Inputs:** Replaced `type="number"` spinners with clean `type="text"` inputs with numeric-only key guards — eliminates the browser's native stepper arrows.
- **All Vaults Page:** Removed redundant navigation bars and header elements. View now uses the global application shell consistently.
- **Z-Index Fix:** Fixed a stacking context collision where the Fields/Columns dropdown was rendering behind the sticky table header.
- **Table Column Alignment:** The "Added" date cell in the table is now correctly conditionalized, preventing a stray empty column from appearing when the field is hidden.

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
