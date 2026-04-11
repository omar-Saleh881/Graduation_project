export interface PlatformSection {
  id: string;
  title_ar: string;
  description_ar: string;
  icon: string; // Emoji or Lucide icon name
  content_type: 'tools' | 'paths' | 'courses' | 'articles' | 'content' | 'mixed' | 'recommendations';
  order: number;
  is_active: boolean;
  cta_text?: string;
  cta_link?: string;
  items?: string[]; // IDs of specific items to show if mixed
}
