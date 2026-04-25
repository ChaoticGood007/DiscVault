# Track: speckled_pattern_20260404 Spec

## Overview
Implement a new visual option called 'Speckled' (representing Metal Flake, Splatter, or Shimmer blends) for disc secondary patterns.

## Goals
- Provide a visual representation for 'Speckled' discs.
- Update management forms to allow selecting 'Speckled' as a secondary pattern.

## Scope
- `src/components/AddDiscForm.tsx`
- `src/components/EditDiscForm.tsx`
- `src/components/DiscPreview.tsx`

## Requirements
- 'Speckled' option added to `secondaryPattern` dropdown in forms.
- `DiscPreview.tsx` renders small dots of `secondaryColor` across the disc surface.
- Dots should be pseudo-randomly positioned but stable (consistent across renders).
- Dots must stay within the disc's circular boundary (`clipPath`).
