# Track: flight_path_visualization_20260404 Spec

## Overview
Add the ability to visualize estimated flight paths (S-curves) for discs on the Flight Chart.

## Goals
- Render a theoretical flight path for discs based on their flight numbers.
- Provide a visual cue for how a disc is expected to fly.

## Scope
- `src/components/FlightChart.tsx`
- `src/lib/flightPath.ts` (new utility)

## Requirements
- Mathematical model to generate an SVG Bézier curve from Speed, Glide, Turn, and Fade.
- Support for "Tuned" flight numbers if active for a specific disc.
- Visuals: Subtle, animated dashed line or glowing path.
- Trigger: Show path on disc hover or via a global toggle.
