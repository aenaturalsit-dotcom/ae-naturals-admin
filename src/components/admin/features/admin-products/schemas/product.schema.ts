// src\components\admin\features\admin-products\schemas\product.schema.ts


import { z } from "zod";



// Match your exact custom media type strings
export const mediaTypeSchema = z.enum(["image", "video", "gif"]);

// 🔥 NEW: Explicit object validator matching your custom MediaItem interface
export const mediaItemSchema = z.object({
  url: z.string().url("Each media item must contain a valid URL string"),
  publicId: z.string().optional().nullable(),
  type: mediaTypeSchema,
  posterUrl: z.string().optional().nullable(),
});


export const variantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().optional().nullable(),
  optionType: z.string().min(1, "Option type is required"),
  optionValue: z.string().min(1, "Option value is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  oldPrice: z.coerce.number().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  shippingWeightKg: z.coerce.number().min(0),
  lengthCm: z.coerce.number().min(0),
  widthCm: z.coerce.number().min(0),
  heightCm: z.coerce.number().min(0),
});

export const productFormSchema = z.object({
  name: z.string().min(3, "Title must be at least 3 characters"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  storeId: z.string().min(1, "Store is required"),
  
  // No .default() here ensures perfect type alignment with React Hook Form
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  isCodEnabled: z.boolean(),
  
  // 🔥 UPDATED: Shifted from simple URL arrays to an object array using mediaItemSchema
  images: z.array(mediaItemSchema).min(1, "At least one image is required"),
  
  highlightIds: z.array(z.string()),
  
  variants: z.array(variantSchema).min(1, "At least one variant is required"),
  
  attributes: z.array(z.object({ name: z.string(), value: z.string() })),
  careInstructions: z.array(z.object({ value: z.string() })),
  deliveryInfo: z.array(z.object({ value: z.string() })),
  
  ingredients: z.string().optional(),
  
  extra: z.object({
    manufacturer: z.string().optional(),
    countryOfOrigin: z.string().optional(),
    safetyInfo: z.string().optional(),
    directions: z.string().optional(),
    legalDisclaimer: z.string().optional(),
    aPlusContent: z
  .union([
    z.array(z.any()),
    // z.record(z.any()),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => {
    if (Array.isArray(value)) return value;
    return [];
  }),
  }),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;