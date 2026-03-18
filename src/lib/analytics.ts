/*
 * Copyright 2026 Google LLC
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

import { db as prisma } from "./prisma";

export async function getInventoryStats(collectionId?: string) {
  const inventory = await prisma.inventory.findMany({
    where: collectionId ? { collectionId } : {},
    include: { mold: true },
  });

  const totalDiscs = inventory.length;
  if (totalDiscs === 0) return null;

  // Aggregations
  const brandDistribution: Record<string, number> = {};
  const categoryDistribution: Record<string, number> = {};
  const speedDistribution: Record<number, number> = {};
  const stabilityDistribution: Record<string, number> = {};

  let totalWeight = 0;
  let totalCondition = 0;
  let conditionCount = 0;

  inventory.forEach((item) => {
    const { brand, category, speed, stability, turn, fade } = item.mold;
    
    brandDistribution[brand] = (brandDistribution[brand] || 0) + 1;
    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1;
    speedDistribution[speed] = (speedDistribution[speed] || 0) + 1;
    stabilityDistribution[stability] = (stabilityDistribution[stability] || 0) + 1;

    if (item.weight) totalWeight += item.weight;
    if (item.condition) {
      totalCondition += item.condition;
      conditionCount++;
    }
  });

  const formatData = (record: Record<string | number, number>) =>
    Object.entries(record)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

  return {
    totalDiscs,
    totalWeightKg: (totalWeight / 1000).toFixed(2),
    avgCondition: conditionCount > 0 ? (totalCondition / conditionCount).toFixed(1) : 'N/A',
    brands: formatData(brandDistribution),
    categories: formatData(categoryDistribution),
    speeds: Object.entries(speedDistribution)
      .map(([name, value]) => ({ name: Number(name), value }))
      .sort((a, b) => a.name - b.name),
    stability: formatData(stabilityDistribution),
  };
}
