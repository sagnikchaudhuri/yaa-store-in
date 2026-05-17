export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice?: number;
  images: string[];
  category: ProductCategory;
  tags: string[];
  series?: string;
  inStock: boolean;
  isFeatured?: boolean;
  isDrop?: boolean;
  dropDate?: string;
  description: string;
  badge?: string;
  character?: string;
}

export type ProductCategory =
  | "figures"
  | "apparel"
  | "accessories"
  | "posters"
  | "manga"
  | "collectibles";

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  productCount: number;
  series?: string;
}

export interface Drop {
  id: string;
  name: string;
  description: string;
  image: string;
  releaseDate: string;
  isLive: boolean;
  requiresRegistration: boolean;
  registeredCount?: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  type: "drop" | "restock" | "community" | "event";
  publishedAt: string;
  isPinned?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}
