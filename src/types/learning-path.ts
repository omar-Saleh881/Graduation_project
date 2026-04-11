export interface LearningPath {
  id: string;
  title_ar: string;
  description_ar: string;
  slug: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimated_hours: number;
  category: string;
  icon: string;
  is_published: boolean;
  steps_count: number;
  created_at: string;
}

export interface PathCourse {
  id: string;
  path_id: string;
  course_order: number;
  title_ar: string;
  description_ar: string;
}

export interface PathStep {
  id: string;
  path_id: string;
  course_id?: string; // Links step to a course
  step_order: number;
  title_ar: string;
  description_ar: string;
  resource_type: 'lesson' | 'article' | 'video' | 'tool' | 'exercise' | 'quiz' | 'external';
  resource_url: string;
  youtube_url?: string;
  external_url?: string;
  duration_minutes: number;
  content_ar?: string; // For rich text lesson notes or summary
}

export interface LearningPathWithSteps extends LearningPath {
  courses: (PathCourse & { steps: PathStep[] })[];
  unassigned_steps?: PathStep[]; // Just in case
}
