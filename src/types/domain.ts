export interface Domain {
  id: string;
  name_ar: string;
  name_en?: string;
  slug: string;
  description_ar: string;
  icon?: string; // Emoji or Lucide icon name
  order: number;
  is_active: boolean;
  content_types: ('courses' | 'paths' | 'articles' | 'tools')[];
  featured_items?: string[]; // IDs of items to feature
  created_at: string;
}
