export interface Article {
  id: string;
  title_ar: string;
  excerpt_ar?: string;
  article_goal?: string;
  learner_notes?: string;
  read_time_minutes?: number;
  blocks?: ArticleBlock[];
  slug?: string;
  category?: string;
  tags?: string[];
  author_name?: string;
  content_ar?: string; // Legacy field
  cover_image?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  section_id?: string;
}

export type ArticleBlockType = 'text' | 'image' | 'text_image' | 'image_text' | 'media' | 'separator' | 'note';

export interface ArticleBlock {
  id: string;
  type: ArticleBlockType;
  content?: string;
  image_url?: string;
  media_url?: string;
  media_type?: 'video' | 'youtube' | 'gif';
  caption?: string;
  file_name_placeholder?: string;
}

export interface ArticlesQuery {
  search?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}
