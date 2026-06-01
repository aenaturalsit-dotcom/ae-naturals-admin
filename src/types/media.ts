// src/types/media.ts

export type MediaType = "image" | "video" | "gif";

export interface MediaItem {
  url: string;
  publicId?: string | null;
  type: MediaType;
  posterUrl?: string | null;
}