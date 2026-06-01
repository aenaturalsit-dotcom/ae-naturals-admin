export enum APlusBlockType {
  BANNER = 'BANNER',
  SPLIT = 'SPLIT',
  IMAGE_GRID = 'IMAGE_GRID',
  TEXT = 'TEXT',
}

export interface BannerBlockContent {
  imageUrl: string;
  videoUrl?: string | null;
  overlayTitle?: string | null;
  overlaySubtitle?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
}

export interface SplitBlockContent {
  leftImageUrl: string;
  rightTitle: string;
  rightDescription: string;
  reverse: boolean;
}

export interface ImageGridBlockContent {
  images: string[];
  title?: string | null;
}

export interface TextBlockContent {
  title: string;
  description: string;
}

export type APlusBlockContent =
  | BannerBlockContent
  | SplitBlockContent
  | ImageGridBlockContent
  | TextBlockContent;

export interface APlusContentResponse {
  id: string;
  productId: string;
  type: APlusBlockType;
  order: number;
  content: APlusBlockContent;
  isActive: boolean;
}