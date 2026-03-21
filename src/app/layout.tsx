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

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getGlobalSettings } from '@/app/actions/settings';
import { generateTailwindPalette } from '@/lib/colors';
import { db as prisma } from "@/lib/prisma";
import { syncMolds } from "@/app/actions/molds";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DiscVault",
  description: "Personal disc golf inventory management",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Execute background mold synchronization natively if the master registry is completely empty.
  const coreMoldCount = await prisma.mold.count();
  if (coreMoldCount === 0) {
    console.log("Empty Master Database detected. Triggering automated background sync natively...");
    // Fire and forget Promise directly into the Node Event Loop without blocking the HTML render!
    syncMolds().catch(console.error);
  }

  const settings = await getGlobalSettings();
  const customPalette = generateTailwindPalette(settings.accentColor);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50 text-slate-900 min-h-screen`}
        style={customPalette as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}