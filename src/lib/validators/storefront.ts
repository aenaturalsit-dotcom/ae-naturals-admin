// src/lib/validators/storefront.ts

import { z } from "zod";

export const ThemeSectionSchema = z.object({
  id: z.string(),
  type: z.enum([
    "HERO",
    "TRUST_BADGES",
    "COLLECTIONS",       // 🚨 Renamed from CATEGORIES
    "PRODUCT_CAROUSEL",
    "FEATURED_PRODUCTS", // 🚨 Added
    "PROMO_BANNER",
    "BRAND_STORY",
    "BLOG_SECTION",
    "VIDEO_SHOPPABLE",   // 🚨 Added
  ]),
  isActive: z.boolean().default(true),
  settings: z.record(z.string(), z.any()).default({}), // Can be strictly typed per block later
});

export const StorefrontLayoutSchema = z.object({
  sectionsOrder: z.array(ThemeSectionSchema),
});

export type ThemeSection = z.infer<typeof ThemeSectionSchema>;
export type StorefrontLayout = z.infer<typeof StorefrontLayoutSchema>;