/*
 * Copyright 2026 ChaoticGood007
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Generates an SVG path string representing a theoretical flight path
 * based on disc flight numbers.
 */
export function generateFlightPath(
  speed: number,
  glide: number,
  turn: number,
  fade: number,
  startX: number,
  startY: number,
  endX: number,
  endY: number
): string {
  // We use a Cubic Bezier curve to represent the S-curve of a disc flight.
  // Start point (M) is the release point.
  // End point is the final resting position on the chart.
  
  // Control point 1 (C1) handles the initial "turn" (high-speed stability).
  // Control point 2 (C2) handles the late "fade" (low-speed stability).
  
  // Calculate horizontal intensity of turn and fade
  // Turn is typically negative (right for RHBH), Fade is positive (left for RHBH).
  // On our chart, more positive stability is left (overstable), more negative is right (understable).
  
  // Adjust turn/fade intensity by speed (higher speed discs have more pronounced curves)
  const speedFactor = Math.max(1, speed / 7);
  const turnIntensity = turn * 10 * speedFactor;
  const fadeIntensity = fade * 12 * speedFactor;
  
  // CP1 handles the high-speed turn phase.
  // Placed at 70% of the flight distance so the disc flies mostly straight
  // before any turn displacement kicks in — mimicking real flight where
  // the disc holds its line for the majority of the throw.
  const cp1x = startX - (turnIntensity * 0.5);
  const cp1y = startY - (startY - endY) * 0.7;
  
  // CP2 handles the low-speed fade phase.
  // Pushed PAST the endpoint in the fade direction so the curve
  // arrives at the endpoint already hooking left, rather than straightening out.
  const cp2x = endX + (fadeIntensity * 0.6);
  const cp2y = endY + (startY - endY) * 0.1;
  
  return `M ${startX} ${startY} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
}

/**
 * Calculates a starting point for the flight path relative to the grid.
 * Usually starts from the bottom of the chart.
 */
export function getFlightPathOrigin(width: number = 800, height: number = 1000): { x: number, y: number } {
  return {
    x: width / 2, // Center of stability axis
    y: height - 50 // Near the bottom (speed 0)
  };
}
