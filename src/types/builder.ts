export interface Lesson {
  id: string;
  module_id?: string;
  course_id?: string;
  order: number;
  title_ar: string;
  description_ar: string;
  duration_minutes: number;
  resource_type: 'video' | 'article' | 'external' | 'quiz' | 'exercise' | 'lesson';
  resource_url: string; // Legacy/fallback
  youtube_url?: string;
  external_url?: string;
  content_ar: string; // Notes/content for the lesson
}

export interface CourseModule {
  id: string;
  course_id: string;
  order: number;
  title_ar: string;
}

export interface Course {
  id: string;
  slug: string;
  title_ar: string;
  description_ar: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  created_at: string;
}

export interface PathStage {
  id: string;
  path_id: string;
  order: number;
  title_ar: string;
  description_ar: string;
}

export interface PathStageItem {
  id: string;
  stage_id: string;
  order: number;
  item_type: 'course' | 'lesson' | 'article' | 'tool' | 'external' | 'quiz';
  reference_id?: string; // ID of the Course, Lesson, Article, Tool
  title_override?: string;
  description_override?: string;
  duration_minutes?: number;
  notes?: string;
  url?: string;
}
