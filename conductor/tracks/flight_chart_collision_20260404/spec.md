# Track: flight_chart_collision_20260404 Spec

## Overview
Improve collision avoidance logic in the `FlightChart` component to prevent disc names from overlapping with the disc visual dots (previews) themselves.

## Goals
- Labels should be placed in 'clear' areas, avoiding both other labels AND disc dots.

## Scope
- `src/components/FlightChart.tsx`

## Requirements
- Update the collision detection algorithm to treat disc dots (previews) as occupied coordinate spaces.
- Maintain existing logic that prevents labels from overlapping each other.
- Support responsive re-calculation when the chart is resized.
