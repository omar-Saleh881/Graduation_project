import { ArticleBlock } from "./article";

export interface Lesson {
  id: string;
  module_id?: string;
  course_id?: string;
  section_id?: string;
  order: number;
  title_ar: string;
  description_ar: string;
  duration_minutes: number;
  resource_type: 'video' | 'article' | 'external' | 'quiz' | 'exercise' | 'lesson';
  resource_url: string; // Legacy/fallback
  youtube_url?: string;
  external_url?: string;
  document_url?: string;
  document_label?: string;
  cover_image?: string;
  file_upload_placeholder?: string;
  video_upload_placeholder?: string;
  pdf_upload_placeholder?: string;
  content_ar: string; // Notes/content for the lesson
  thumbnail?: string;
  learner_instructions?: string;
  lesson_goals?: string;
  prerequisites?: string;
  is_published?: boolean;
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
  section_id?: string;
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
  item_type: 'course' | 'lesson' | 'article' | 'tool' | 'external' | 'quiz' | 'document' | 'video';
  reference_id?: string; // ID of the Course, Lesson, Article, Tool
  title_override?: string;
  description_override?: string;
  duration_minutes?: number;
  notes?: string;
  url?: string;
  youtube_url?: string;
  external_url?: string;
  content_ar?: string;
  document_url?: string;
  document_label?: string;
  cover_image?: string;
  thumbnail?: string;
  pdf_upload_placeholder?: string;
  video_upload_placeholder?: string;
  learner_instructions?: string;
  lesson_goals?: string;
  prerequisites?: string;
  is_published?: boolean;
  article_blocks?: ArticleBlock[];
  article_goal?: string;
  read_time_minutes?: number;
  attachments?: string[];
  // Quiz-specific fields
  quiz?: {
    title: string;
    description: string;
    passing_score: number;
    duration_minutes: number;
    attempts: number;
    questions: QuizQuestion[];
  };
}

export type QuizQuestionType = 'multiple_choice' | 'true_false' | 'multiple_select' | 'matching' | 'ordering';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  question: string;
  options?: string[];
  correct_answers?: number[]; // indices for correct answers
  pairs?: { left: string; right: string }[]; // for matching
  order?: string[]; // for ordering
  answer?: boolean; // for true/false
}
