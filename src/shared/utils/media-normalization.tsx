// src\shared\utils\media-normalization.tsx




export type MediaType = 'image' | 'video' | 'gif';

export interface PolymorphicMedia {
  url: string;
  publicId?: string | null;
  type: MediaType;
  posterUrl?: string | null;
}

/**
 * Detects media type from standard URL strings if type information is omitted
 */
export function inferMediaTypeFromUrl(url: string): MediaType {
  if (!url) return 'image';
  const cleanUrl = url.split('?')[0].toLowerCase();
  if (cleanUrl.match(/\.(mp4|webm|ogg|mov|m4v)$/)) return 'video';
  if (cleanUrl.match(/\.gif$/)) return 'gif';
  return 'image';
}

/**
 * Normalizes incoming mixed data structures (Legacy strings, JSON strings, or raw partial objects)
 * into a strict, validated type-safe array of PolymorphicMedia entries.
 */
export function normalizeMediaCollection(incoming: any[] | null | undefined): PolymorphicMedia[] {
  if (!incoming || !Array.isArray(incoming)) return [];

  return incoming
    .map((item): PolymorphicMedia | null => {
      if (!item) return null;

      // Handle raw strings (either pure URLs or legacy encoded JSON strings)
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          try {
            const parsed = JSON.parse(trimmed);
            return {
              url: parsed.url || '',
              publicId: parsed.publicId || null,
              type: (parsed.type as MediaType) || inferMediaTypeFromUrl(parsed.url),
              posterUrl: parsed.posterUrl || null,
            };
          } catch {
            return { url: trimmed, publicId: null, type: inferMediaTypeFromUrl(trimmed), posterUrl: null };
          }
        }
        return { url: trimmed, publicId: null, type: inferMediaTypeFromUrl(trimmed), posterUrl: null };
      }

      // Handle standard modern object representations
      if (typeof item === 'object' && item.url) {
        return {
          url: item.url,
          publicId: item.publicId || null,
          type: (item.type as MediaType) || inferMediaTypeFromUrl(item.url),
          posterUrl: item.posterUrl || null,
        };
      }

      return null;
    })
    .filter((media): media is PolymorphicMedia => media !== null && typeof media.url === 'string' && media.url.length > 0);
}

/**
 * Sanitizes and applies recursive media normalization patterns directly to dynamic A+ Content structural layouts.
 */
export function normalizeAPlusContent(content: any[] | null | undefined): any[] {
  if (!content || !Array.isArray(content)) return [];

  return content.map((block) => {
    if (!block || typeof block !== 'object') return block;
    const type = block.type;
    const currentContent = block.content || {};

    switch (type) {
      case 'BANNER':
        return {
          ...block,
          content: {
            ...currentContent,
            imageUrl: typeof currentContent.imageUrl === 'string' ? currentContent.imageUrl : currentContent.imageUrl?.url || '',
            media: currentContent.media ? normalizeMediaCollection([currentContent.media])[0] || null : null,
          },
        };

      case 'SPLIT':
        return {
          ...block,
          content: {
            ...currentContent,
            leftImageUrl: typeof currentContent.leftImageUrl === 'string' ? currentContent.leftImageUrl : currentContent.leftImageUrl?.url || '',
            leftMedia: currentContent.leftMedia ? normalizeMediaCollection([currentContent.leftMedia])[0] || null : null,
          },
        };

      case 'IMAGE_GRID':
        if (Array.isArray(currentContent.images)) {
          return {
            ...block,
            content: {
              ...currentContent,
              images: normalizeMediaCollection(currentContent.images),
            },
          };
        }
        return block;

      default:
        return block;
    }
  });
}


// src/utils/media.ts

/**
 * Loops through the full images array, finds the very first valid asset, 
 * and extracts it as a static image URL. Converts videos to static frame URLs.
 * * @param imagesArray - The full array from p.images (could contain stringified JSON or plain strings)
 * @returns A guaranteed static image string URL, or null if empty/invalid
 */
export function resolveFirstProductImage(imagesArray: any[] | null | undefined): string | null {
  if (!imagesArray || !Array.isArray(imagesArray) || imagesArray.length === 0) {
    return null;
  }

  // Iterate over the array to find the first valid non-empty asset reference
  for (const item of imagesArray) {
    if (!item) continue;

    try {
      let rawUrl: string | null = null;

      // 1. Handle stringified JSON layout or legacy flat strings
      if (typeof item === "string") {
        if (item.startsWith("{")) {
          const parsed = JSON.parse(item);
          rawUrl = parsed?.url || null;
        } else {
          rawUrl = item; // Legacy flat string URL
        }
      } 
      // 2. Handle standard parsed object layers
      else if (typeof item === "object" && item !== null) {
        rawUrl = (item as any).url || null;
      }

      // If we found a valid URL, process it and return it immediately
      if (rawUrl) {
        const lowercaseUrl = rawUrl.toLowerCase();
        
        // If it's a video format, convert the extension to .jpg for a Cloudinary fallback frame
        if (lowercaseUrl.match(/\.(mp4|webm|ogg|mov|mkv)$/)) {
          return rawUrl.replace(/\.[^/.]+$/, ".jpg");
        }

        return rawUrl;
      }
    } catch (error) {
      console.error("Error processing item in images array:", error);
      // Continue loop to check subsequent images if one fails parsing
    }
  }

  return null;
}