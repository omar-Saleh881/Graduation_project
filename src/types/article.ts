export interface Article {
  id: string;
  title_ar: string;
  excerpt_ar: string;
  content_ar: string;
  slug: string;
  category: string;
  tags: string[];
  cover_image: string;
  author_name: string;
  read_time_minutes: number;
  is_published: boolean;
  published_at: string;
  created_at: string;
}

export interface ArticlesQuery {
  search?: string;
  category?: string;
  tag?: string;
  page?: number;
  pageSize?: number;
}
