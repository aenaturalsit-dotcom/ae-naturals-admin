// src/lib/validators/storefront.ts

import { z } from "zod";

// ============================================================
// 1. SHARED SETTINGS SCHEMAS (Reusable across sections)
// ============================================================

const ImageSettingsSchema = z.object({
  imageUrl: z.string().url().optional().nullable(),
  altText: z.string().optional().nullable(),
});

const LinkSettingsSchema = z.object({
  link: z.string().optional().nullable(),
  buttonText: z.string().optional().nullable(),
});

// ============================================================
// 2. SECTION-SPECIFIC SETTINGS SCHEMAS
// ============================================================

// 2.1 HERO SECTION
const HeroSlideSchema = z.object({
  desktopImageUrl: z.string().url().optional().nullable(),
  tabletImageUrl: z.string().url().optional().nullable(),
  mobileImageUrl: z.string().url().optional().nullable(),
  headline: z.string().optional().nullable(),
  subtext: z.string().optional().nullable(),
  primaryCtaText: z.string().optional().nullable(),
  primaryCtaLink: z.string().optional().nullable(),
  collectionId: z.string().optional(),
  link: z.string().optional().nullable(),
});

const HeroSettingsSchema = z.object({
  title: z.string().optional().nullable(),
  banners: z.array(HeroSlideSchema).default([]),
  autoplaySpeed: z.number().min(1000).max(10000).optional().default(5000),
  showDots: z.boolean().optional().default(true),
  showArrows: z.boolean().optional().default(true),
});

// 2.2 TRUST BADGES SECTION
const TrustBadgeSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, "Badge text is required"),
  icon: z.string().url().optional().nullable(),
});

const TrustBadgesSettingsSchema = z.object({
  title: z.string().optional().nullable(),
  selectedIds: z.array(z.string()).default([]),
  badges: z.array(TrustBadgeSchema).default([]),
  speed: z.number().min(10).max(60).optional().default(30),
  autoplay: z.boolean().optional().default(true),
});

// 2.3 COLLECTIONS GRID
const CollectionsSettingsSchema = z.object({
  title: z.string().optional().nullable(),
  collectionId: z.string().optional(),
  collectionSlug: z.string().optional(),
  displayCount: z.number().min(1).max(20).optional().default(6),
  columns: z.enum(["2", "3", "4"]).optional().default("4"),
  showProductCount: z.boolean().optional().default(true),
});

// 2.4 PRODUCT CAROUSEL
const ProductCarouselSettingsSchema = z.object({
  title: z.string().optional().nullable(),
  dataSource: z.string().optional().default("featuredProducts"),
  viewAllLink: z.string().optional().nullable(),
  autoplaySpeed: z.number().min(1000).max(10000).optional().default(3000),
  showHighlights: z.boolean().optional().default(true),
  itemsPerView: z.enum(["1", "2", "3", "4"]).optional().default("4"),
  showArrows: z.boolean().optional().default(true),
  showDots: z.boolean().optional().default(false),
});

// 2.5 FEATURED PRODUCTS
const FeaturedProductsSettingsSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  displayCount: z.number().min(1).max(50).optional().default(12),
  columns: z.enum(["3", "4", "6"]).optional().default("4"),
  viewAllLink: z.string().optional().nullable(),
  showBadges: z.boolean().optional().default(true),
  showPrice: z.boolean().optional().default(true),
});

// 2.6 PROMO BANNER
const PromoBannerSettingsSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  buttonText: z.string().optional().nullable(),
  buttonLink: z.string().optional().nullable(),
  alignment: z.enum(["left", "center", "right"]).optional().default("center"),
  overlayColor: z.string().optional().default("rgba(0,0,0,0.3)"),
  textColor: z.string().optional().default("#ffffff"),
});

// 2.7 BRAND STORY
const BrandStorySettingsSchema = z.object({
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  buttonText: z.string().optional().nullable(),
  buttonLink: z.string().optional().nullable(),
  layout: z.enum(["left", "right", "top", "bottom"]).optional().default("left"),
  imageHeight: z.enum(["small", "medium", "large"]).optional().default("medium"),
});

// 2.8 BLOG SECTION
const BlogSectionSettingsSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  displayCount: z.number().min(1).max(10).optional().default(3),
  viewAllLink: z.string().optional().nullable(),
  showExcerpt: z.boolean().optional().default(true),
  showAuthor: z.boolean().optional().default(true),
});

// 2.9 VIDEO SHOPPABLE
const VideoProductSlideSchema = z.object({
  videoUrl: z.string().url().optional().nullable(),
  product: z.object({
    id: z.string(),
    name: z.string(),
    price: z.number().positive(),
    slug: z.string(),
    image: z.string().url().optional().nullable(),
  }).optional().nullable(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
});

const VideoShoppableSettingsSchema = z.object({
  title: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  slides: z.array(VideoProductSlideSchema).default([]),
  viewAllLink: z.string().optional().nullable(),
  autoplay: z.boolean().optional().default(false),
});

// 2.10 WHATSAPP WIDGET
const WhatsAppWidgetSettingsSchema = z.object({
  enabled: z.boolean().default(true),
  phoneNumber: z.string().min(10).max(15).optional(),
  defaultMessage: z.string().optional().nullable(),
  position: z.enum(["bottom-left", "bottom-right"]).optional().default("bottom-right"),
  showOnDesktop: z.boolean().optional().default(true),
  showOnMobile: z.boolean().optional().default(true),
});

// 2.11 CATEGORY ICON STRIP
const CategoryIconStripSettingsSchema = z.object({
  title: z.string().optional().nullable().default("Shop by Category"),
  subtitle: z.string().optional().nullable().default(""),
  categoryIds: z.array(z.string()).default([]),
  displayCount: z.number().min(1).max(20).optional().default(12),
  layout: z.enum(["grid", "scrollable"]).optional().default("grid"),
  columns: z.enum(["4", "5", "6"]).optional().default("5"),
  showProductCount: z.boolean().optional().default(true),
  imageSize: z.enum(["small", "medium", "large"]).optional().default("medium"),
  showCategoryNames: z.boolean().optional().default(true),
  imageShape: z.enum(["circle", "square", "rounded"]).optional().default("circle"),
});

// ============================================================
// 3. MAIN THEME SECTION SCHEMA
// ============================================================

export const ThemeSectionSchema = z.object({
  id: z.string().min(1, "Section ID is required"),
  type: z.enum([
    "HERO",
    "TRUST_BADGES",
    "COLLECTIONS",
    "PRODUCT_CAROUSEL",
    "FEATURED_PRODUCTS",
    "PROMO_BANNER",
    "BRAND_STORY",
    "BLOG_SECTION",
    "VIDEO_SHOPPABLE",
    "WHATSAPP_WIDGET",
    "CATEGORY_ICON_STRIP",
  ]),
  isActive: z.boolean().default(true),
  settings: z.record(z.string(), z.any()).default({}),
});

export const StorefrontLayoutSchema = z.object({
  sectionsOrder: z.array(ThemeSectionSchema).default([]),
});

export const StorefrontDataSchema = z.object({
  storeId: z.string(),
  config: StorefrontLayoutSchema,
  data: z.object({
    featuredProducts: z.array(z.any()).default([]),
    collections: z.array(z.any()).default([]),
    blogs: z.array(z.any()).default([]),
    banners: z.array(z.any()).default([]),
    categories: z.array(z.any()).optional().default([]),
  }),
});

// ============================================================
// 4. TYPE INFERENCES
// ============================================================

export type ThemeSection = z.infer<typeof ThemeSectionSchema>;
export type StorefrontLayout = z.infer<typeof StorefrontLayoutSchema>;
export type StorefrontData = z.infer<typeof StorefrontDataSchema>;

// Settings types
export type HeroSettings = z.infer<typeof HeroSettingsSchema>;
export type TrustBadgesSettings = z.infer<typeof TrustBadgesSettingsSchema>;
export type CollectionsSettings = z.infer<typeof CollectionsSettingsSchema>;
export type ProductCarouselSettings = z.infer<typeof ProductCarouselSettingsSchema>;
export type FeaturedProductsSettings = z.infer<typeof FeaturedProductsSettingsSchema>;
export type PromoBannerSettings = z.infer<typeof PromoBannerSettingsSchema>;
export type BrandStorySettings = z.infer<typeof BrandStorySettingsSchema>;
export type BlogSectionSettings = z.infer<typeof BlogSectionSettingsSchema>;
export type VideoShoppableSettings = z.infer<typeof VideoShoppableSettingsSchema>;
export type WhatsAppWidgetSettings = z.infer<typeof WhatsAppWidgetSettingsSchema>;
export type CategoryIconStripSettings = z.infer<typeof CategoryIconStripSettingsSchema>;

// Nested types
export type HeroSlide = z.infer<typeof HeroSlideSchema>;
export type TrustBadge = z.infer<typeof TrustBadgeSchema>;
export type VideoProductSlide = z.infer<typeof VideoProductSlideSchema>;

// ============================================================
// 5. UTILITY FUNCTIONS & TYPE GUARDS
// ============================================================

/**
 * Type guard to check if a section is of a specific type
 */
export function isSectionType<T extends ThemeSection['type']>(
  section: ThemeSection,
  type: T
): section is ThemeSection & { type: T } {
  return section.type === type;
}

/**
 * Type guard for Category Icon Strip section
 */
export function isCategoryIconStrip(
  section: ThemeSection
): section is ThemeSection & { settings: CategoryIconStripSettings } {
  return section.type === "CATEGORY_ICON_STRIP";
}

/**
 * Type guard for Hero section
 */
export function isHeroSection(
  section: ThemeSection
): section is ThemeSection & { settings: HeroSettings } {
  return section.type === "HERO";
}

/**
 * Type guard for Trust Badges section
 */
export function isTrustBadges(
  section: ThemeSection
): section is ThemeSection & { settings: TrustBadgesSettings } {
  return section.type === "TRUST_BADGES";
}

/**
 * Type guard for Collections section
 */
export function isCollections(
  section: ThemeSection
): section is ThemeSection & { settings: CollectionsSettings } {
  return section.type === "COLLECTIONS";
}

/**
 * Get default settings for a section type
 */
export function getDefaultSettings(type: ThemeSection['type']): Record<string, any> {
  switch (type) {
    case "HERO":
      return {
        title: "Hero Banner",
        banners: [],
        autoplaySpeed: 5000,
        showDots: true,
        showArrows: true,
      };
    
    case "TRUST_BADGES":
      return {
        title: "Why Choose Us",
        selectedIds: [],
        badges: [],
        speed: 30,
        autoplay: true,
      };
    
    case "COLLECTIONS":
      return {
        title: "Shop by Collection",
        collectionId: "",
        collectionSlug: "",
        displayCount: 6,
        columns: "4",
        showProductCount: true,
      };
    
    case "PRODUCT_CAROUSEL":
      return {
        title: "Trending Now",
        dataSource: "featuredProducts",
        viewAllLink: "",
        autoplaySpeed: 3000,
        showHighlights: true,
        itemsPerView: "4",
        showArrows: true,
        showDots: false,
      };
    
    case "FEATURED_PRODUCTS":
      return {
        title: "Featured Products",
        subtitle: "",
        displayCount: 12,
        columns: "4",
        viewAllLink: "",
        showBadges: true,
        showPrice: true,
      };
    
    case "PROMO_BANNER":
      return {
        title: "",
        subtitle: "",
        imageUrl: "",
        buttonText: "Shop Now",
        buttonLink: "",
        alignment: "center",
        overlayColor: "rgba(0,0,0,0.3)",
        textColor: "#ffffff",
      };
    
    case "BRAND_STORY":
      return {
        title: "Our Story",
        description: "",
        imageUrl: "",
        buttonText: "Learn More",
        buttonLink: "",
        layout: "left",
        imageHeight: "medium",
      };
    
    case "BLOG_SECTION":
      return {
        title: "From Our Blog",
        subtitle: "",
        displayCount: 3,
        viewAllLink: "",
        showExcerpt: true,
        showAuthor: true,
      };
    
    case "VIDEO_SHOPPABLE":
      return {
        title: "Watch & Shop",
        subtitle: "Discover our products in action",
        slides: [],
        viewAllLink: "",
        autoplay: false,
      };
    
    case "WHATSAPP_WIDGET":
      return {
        enabled: true,
        phoneNumber: "",
        defaultMessage: "Hi 👋 I would like to know more about your products and pricing.",
        position: "bottom-right",
        showOnDesktop: true,
        showOnMobile: true,
      };
    
    case "CATEGORY_ICON_STRIP":
      return {
        title: "Shop by Category",
        subtitle: "",
        categoryIds: [],
        displayCount: 12,
        layout: "grid",
        columns: "5",
        showProductCount: true,
        imageSize: "medium",
        showCategoryNames: true,
        imageShape: "circle",
      };
    
    default:
      return {};
  }
}

/**
 * Validate and sanitize section settings
 */
export function validateSectionSettings(
  section: ThemeSection
): ThemeSection {
  try {
    // Run through the main schema validation
    return ThemeSectionSchema.parse(section);
  } catch (error) {
    console.error(`Invalid section settings for ${section.type}:`, error);
    // Return with default settings for the type
    return {
      ...section,
      settings: getDefaultSettings(section.type),
    };
  }
}

/**
 * Extract specific settings type from a section
 */
export function getTypedSettings<T = any>(
  section: ThemeSection
): T {
  return section.settings as T;
}

/**
 * Check if a section has valid settings
 */
export function hasValidSettings(section: ThemeSection): boolean {
  try {
    ThemeSectionSchema.parse(section);
    return true;
  } catch {
    return false;
  }
}

// ============================================================
// 6. CONSTANTS & HELPERS
// ============================================================

export const SECTION_TYPES = ThemeSectionSchema.shape.type.options;

export const SECTION_LABELS: Record<ThemeSection['type'], string> = {
  HERO: "Hero Banner",
  TRUST_BADGES: "Trust Badges",
  COLLECTIONS: "Collections Grid",
  PRODUCT_CAROUSEL: "Product Carousel",
  FEATURED_PRODUCTS: "Featured Products",
  PROMO_BANNER: "Promotional Banner",
  BRAND_STORY: "Brand Story",
  BLOG_SECTION: "Journal / Blog",
  VIDEO_SHOPPABLE: "Video + Products",
  WHATSAPP_WIDGET: "WhatsApp Chat",
  CATEGORY_ICON_STRIP: "Category Icon Strip",
};

export const SECTION_ICONS: Record<ThemeSection['type'], string> = {
  HERO: "🎯",
  TRUST_BADGES: "⭐",
  COLLECTIONS: "📦",
  PRODUCT_CAROUSEL: "🔄",
  FEATURED_PRODUCTS: "✨",
  PROMO_BANNER: "📢",
  BRAND_STORY: "📖",
  BLOG_SECTION: "✍️",
  VIDEO_SHOPPABLE: "🎬",
  WHATSAPP_WIDGET: "💬",
  CATEGORY_ICON_STRIP: "🏷️",
};

export const SECTION_DESCRIPTIONS: Record<ThemeSection['type'], string> = {
  HERO: "Full-width banner with slides and CTAs",
  TRUST_BADGES: "Scrolling trust indicators and certifications",
  COLLECTIONS: "Grid display of product collections",
  PRODUCT_CAROUSEL: "Carousel with auto-play and product cards",
  FEATURED_PRODUCTS: "Grid of featured or best-selling products",
  PROMO_BANNER: "Promotional banner with image and CTA",
  BRAND_STORY: "Brand storytelling with image and text",
  BLOG_SECTION: "Recent blog posts and articles",
  VIDEO_SHOPPABLE: "Video content with linked products",
  WHATSAPP_WIDGET: "WhatsApp chat integration",
  CATEGORY_ICON_STRIP: "Icon-based category navigation strip",
};

// ============================================================
// 7. BACKWARD COMPATIBILITY (Deprecated exports)
// ============================================================

/**
 * @deprecated Use ThemeSection instead
 */
export type Section = ThemeSection;

/**
 * @deprecated Use StorefrontLayout instead
 */
export type Layout = StorefrontLayout;