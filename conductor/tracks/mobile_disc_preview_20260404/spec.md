# Track: mobile_disc_preview_20260404 Spec

## Overview
Add a touch-friendly way for mobile users to enlarge and view detailed disc previews.

## Goals
- Allow mobile users to see intricate disc details (patterns, foils, colors).
- Replace hover-only preview states for touch devices.

## Scope
- `src/components/DiscPreview.tsx`
- `src/components/DiscDetailView.tsx`

## Requirements
- Lightbox Modal: Tapping a disc preview opens an overlay showing the disc at a large scale (e.g., 250px+).
- Tap-to-Toggle: (Alternative) Tap disc to expand its preview in the list.
- Ensure the enlarged preview maintains high-quality rendering of all SVG patterns.
