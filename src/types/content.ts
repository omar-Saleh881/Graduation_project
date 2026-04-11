export interface ContentResource {
  id: string;
  title_ar: string;
  description_ar: string;
  url: string;
  type: 'course' | 'video' | 'article' | 'book' | 'podcast' | 'tool';
  category: string;
  tags: string[];
  provider: string;
  is_free: boolean;
  language: string;
  is_published: boolean;
  created_at: string;
}

export interface ContentQuery {
  search?: string;
  type?: string;
  category?: string;
  is_free?: boolean;
  page?: number;
  pageSize?: number;
}
