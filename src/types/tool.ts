export interface Tool {
  id: string;
  name: string;
  handle: string;
  website_url: string;
  logo_url: string;
  description_en: string;
  description_ar: string;
  summary_ar: string;
  category: string;
  tags: string[];
  pricing_model: string;
  target_audience: string;
  difficulty_level: number;
  is_featured: boolean;
  votes_count: number;
  created_at: string;
  is_active: boolean;
  status: string;
}

export interface ToolsQuery {
  search?: string;
  category?: string;
  pricing_model?: string;
  target_audience?: string;
  difficulty_level?: number;
  sort?: 'newest' | 'votes' | 'alpha';
  page?: number;
  pageSize?: number;
}
