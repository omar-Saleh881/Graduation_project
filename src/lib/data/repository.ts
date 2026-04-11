import { initialTools, initialArticles, initialContent, initialPaths, initialPathSteps, initialPathCourses, initialDomains } from "./seed";
import { Tool } from "@/types/tool";
import { Article } from "@/types/article";
import { ContentResource } from "@/types/content";
import { LearningPath, PathStep, PathCourse, LearningPathWithSteps } from "@/types/learning-path";
import { Course, CourseModule, Lesson, PathStage, PathStageItem } from "@/types/builder";
import { PlatformSection } from "@/types/platform-section";
import { Domain } from "@/types/domain";

const SECTIONS_KEY = "ai_platform_sections";

// --- Types for Settings ---
export interface PlatformSettings {
  id: string;
  name: string;
  description: string;
  heroTitle?: string;
  heroSubtitle?: string;
  contactEmail?: string;
  footerText?: string;
  socialLinks?: {
    twitter?: string;
    github?: string;
    discord?: string;
  };
  announcement?: {
    text: string;
    link?: string;
    active: boolean;
  };
}

const defaultSettings: PlatformSettings[] = [{
  id: "global",
  name: "منصة الأدوات الذكية",
  description: "دليلك العربي الشامل لأدوات الذكاء الاصطناعي",
  heroTitle: "اكتشف، تعلّم، وأتقن أدوات الذكاء الاصطناعي",
  heroSubtitle: "دليل عربي شامل يساعدك على اكتشاف أفضل الأدوات الذكية، التعلّم عبر مسارات مُنظّمة، وقراءة محتوى مبسّط — كل شيء مجاني وباللغة العربية.",
  contactEmail: "contact@pro-hub.ai",
  footerText: "© 2024 جميع الحقوق محفوظة لمنصة أدوات AI",
  socialLinks: {
    twitter: "https://twitter.com/prohub",
    github: "https://github.com/prohub"
  },
  announcement: {
    text: "🎉 تم إطلاق مسارات تعلم البرمجة الجديدة!",
    link: "/paths",
    active: true
  }
}];
class LocalStorageRepository<T extends { id: string }> {
  private key: string;
  private seed: T[];

  constructor(key: string, seed: T[] = []) {
    this.key = key;
    this.seed = seed;
    this.init();
  }

  private init() {
    const data = localStorage.getItem(this.key);
    if (!data) {
      localStorage.setItem(this.key, JSON.stringify(this.seed));
    }
  }

  getAll(): T[] {
    const data = localStorage.getItem(this.key);
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): T | undefined {
    return this.getAll().find((item) => item.id === id);
  }

  create(item: Omit<T, "id"> & { id?: string }): T {
    const items = this.getAll();
    const newItem = { ...item, id: item.id || crypto.randomUUID() } as T;
    items.push(newItem);
    localStorage.setItem(this.key, JSON.stringify(items));
    return newItem;
  }

  update(id: string, updates: Partial<T>): T | undefined {
    const items = this.getAll();
    const index = items.findIndex((item) => item.id === id);
    if (index === -1) return undefined;

    items[index] = { ...items[index], ...updates };
    localStorage.setItem(this.key, JSON.stringify(items));
    return items[index];
  }

  delete(id: string): boolean {
    const items = this.getAll();
    const filtered = items.filter((item) => item.id !== id);
    if (items.length !== filtered.length) {
      localStorage.setItem(this.key, JSON.stringify(filtered));
      return true;
    }
    return false;
  }

  reset() {
    localStorage.setItem(this.key, JSON.stringify(this.seed));
  }
}

// Instantiate specific repositories
export const toolsRepo = new LocalStorageRepository<Tool>("ai_platform_tools", initialTools);
export const articlesRepo = new LocalStorageRepository<Article>("ai_platform_articles", initialArticles);
export const contentRepo = new LocalStorageRepository<ContentResource>("ai_platform_content", initialContent);
export const pathsRepo = new LocalStorageRepository<LearningPath>("ai_platform_paths", initialPaths);
export const pathCoursesRepo = new LocalStorageRepository<PathCourse>("ai_platform_path_courses", initialPathCourses);
export const pathStepsRepo = new LocalStorageRepository<PathStep>("ai_platform_path_steps", initialPathSteps);
export const domainsRepo = new LocalStorageRepository<Domain>("ai_platform_domains", initialDomains);

// Builder repositories
export const coursesRepo = new LocalStorageRepository<Course>("ai_builder_courses", []);
export const modulesRepo = new LocalStorageRepository<CourseModule>("ai_builder_modules", []);
export const lessonsRepo = new LocalStorageRepository<Lesson>("ai_builder_lessons", []);
export const pathStagesRepo = new LocalStorageRepository<PathStage>("ai_builder_path_stages", []);
export const pathStageItemsRepo = new LocalStorageRepository<PathStageItem>("ai_builder_path_stage_items", []);
export const sectionsRepo = new LocalStorageRepository<PlatformSection>(SECTIONS_KEY);

// Default sections if empty
if (sectionsRepo.getAll().length === 0) {
  sectionsRepo.create({
    title_ar: "دليل الأدوات",
    description_ar: "أكبر دليل عربي لأدوات AI — ابحث، قارن، واختر من بين مئات الأدوات المُصنّفة.",
    icon: "🔍",
    content_type: 'tools',
    order: 1,
    is_active: true,
    cta_text: "تصفّح الأدوات",
    cta_link: "/tools"
  });
  sectionsRepo.create({
    title_ar: "المسارات التعليمية",
    description_ar: "مسارات مُنظّمة خطوة بخطوة تغطي الكتابة، التصميم، البرمجة، والتسويق.",
    icon: "📚",
    content_type: 'paths',
    order: 2,
    is_active: true,
    cta_text: "ابدأ مسارك الأول",
    cta_link: "/paths"
  });
  sectionsRepo.create({
    title_ar: "المقالات التعليمية",
    description_ar: "مقالات عربية مبسّطة تشرح المفاهيم والأدوات بأسلوب واضح وعملي.",
    icon: "📝",
    content_type: 'articles',
    order: 3,
    is_active: true,
    cta_text: "اقرأ أحدث المقالات",
    cta_link: "/articles"
  });
  sectionsRepo.create({
    title_ar: "مكتبة المحتوى",
    description_ar: "مصادر مُنتقاة من أفضل المنصات العالمية — دورات، فيديوهات، وكتب.",
    icon: "🗂️",
    content_type: 'content',
    order: 4,
    is_active: true,
    cta_text: "تصفّح المكتبة",
    cta_link: "/content"
  });
  sectionsRepo.create({
    title_ar: "مستشار الأدوات الذكي",
    description_ar: "أجب عن 5 أسئلة فقط وسنقترح لك أفضل الأدوات بناءً على احتياجاتك.",
    icon: "🎯",
    content_type: 'recommendations',
    order: 5,
    is_active: true,
    cta_text: "جرّب المستشار مجاناً",
    cta_link: "/quiz"
  });
}

// Settings repository
export const settingsRepo = new LocalStorageRepository<PlatformSettings>("ai_platform_settings", defaultSettings);

// Specialized queries or composite methods
export const getCourseWithStructure = (slugOrId: string) => {
  const course = coursesRepo.getAll().find(c => c.id === slugOrId || c.slug === slugOrId);
  if (!course) return null;
  const courseId = course.id;
  const modules = modulesRepo.getAll()
    .filter(m => m.course_id === courseId)
    .sort((a, b) => a.order - b.order);
    
  const lessons = lessonsRepo.getAll()
    .filter(l => l.course_id === courseId)
    .sort((a, b) => a.order - b.order);

  const structuredModules = modules.map(m => ({
    ...m,
    lessons: lessons.filter(l => l.module_id === m.id).sort((a, b) => a.order - b.order)
  }));
  
  const unassignedLessons = lessons.filter(l => !l.module_id);
  return { ...course, modules: structuredModules, unassignedLessons };
};

export const getPathWithBuilderStructure = (slugOrId: string) => {
  const path = pathsRepo.getAll().find((p) => p.slug === slugOrId || p.id === slugOrId);
  if (!path) return null;

  const stages = pathStagesRepo.getAll()
    .filter(s => s.path_id === path.id)
    .sort((a, b) => a.order - b.order);

  const items = pathStageItemsRepo.getAll();
  
  const populatedStages = stages.map(s => ({
    ...s,
    items: items.filter(i => i.stage_id === s.id).sort((a, b) => a.order - b.order)
  }));

  return { ...path, stages: populatedStages };
};

export const getPathWithSteps = (slug: string): LearningPathWithSteps | undefined => {
  const path = pathsRepo.getAll().find((p) => p.slug === slug || p.id === slug);
  if (!path) return undefined;
  
  // Try to find if it has new builder stages
  const newStages = pathStagesRepo.getAll().filter(s => s.path_id === path.id);
  
  if (newStages.length > 0) {
    // Convert new builder structure to the flat structure expected by PathDetails
    // Or just return a combined structure
    const items = pathStageItemsRepo.getAll();
    const courses = newStages.sort((a,b) => a.order - b.order).map(stage => {
      const stageItems = items.filter(i => i.stage_id === stage.id).sort((a,b) => a.order - b.order);
      
      const steps: PathStep[] = stageItems.map(item => {
        let baseData: any = {};
        
        switch(item.item_type) {
          case 'lesson':
            baseData = lessonsRepo.getById(item.reference_id || "");
            break;
          case 'article':
            const article = articlesRepo.getById(item.reference_id || "");
            if (article) {
              baseData = {
                id: article.id,
                title_ar: article.title_ar,
                description_ar: article.excerpt_ar,
                resource_type: 'article',
                resource_url: `/article/${article.slug}`,
                duration_minutes: article.read_time_minutes || 0,
                content_ar: article.content_ar
              };
            }
            break;
          case 'tool':
            const tool = toolsRepo.getById(item.reference_id || "");
            if (tool) {
              baseData = {
                id: tool.id,
                title_ar: tool.name,
                description_ar: tool.description_ar,
                resource_type: 'tool',
                resource_url: tool.website_url,
                duration_minutes: 0,
                content_ar: tool.summary_ar
              };
            }
            break;
          case 'external':
            baseData = {
              id: item.id,
              title_ar: item.title_override || "رابط خارجي",
              description_ar: item.description_override || "",
              resource_type: 'external',
              resource_url: item.url,
              duration_minutes: item.duration_minutes || 0,
              content_ar: item.notes || ""
            };
            break;
          case 'quiz':
            baseData = {
              id: item.id,
              title_ar: item.title_override || "اختبار تقييمي",
              description_ar: item.description_override || "",
              resource_type: 'quiz',
              resource_url: "#",
              duration_minutes: item.duration_minutes || 0,
              content_ar: item.notes || ""
            };
            break;
          case 'course':
            const course = coursesRepo.getById(item.reference_id || "");
            if (course) {
              baseData = {
                id: course.id,
                title_ar: course.title_ar,
                description_ar: course.description_ar,
                resource_type: 'external',
                resource_url: `/courses/${course.slug || course.id}`,
                duration_minutes: 0,
                content_ar: "كورس متكامل"
              };
            }
            break;
        }

        if (!baseData || !Object.keys(baseData).length) return null;

        return {
          id: baseData.id || item.id,
          path_id: path.id,
          course_id: stage.id,
          step_order: item.order,
          title_ar: item.title_override || baseData.title_ar || "بدون عنوان",
          description_ar: item.description_override || baseData.description_ar || "",
          resource_type: baseData.resource_type || 'external',
          resource_url: baseData.resource_url || "#",
          youtube_url: baseData.youtube_url || "",
          external_url: baseData.external_url || "",
          duration_minutes: item.duration_minutes || baseData.duration_minutes || 0,
          content_ar: item.notes || baseData.content_ar || ""
        } as PathStep;
      }).filter(Boolean) as PathStep[];

      return {
        id: stage.id,
        path_id: path.id,
        course_order: stage.order,
        title_ar: stage.title_ar,
        description_ar: stage.description_ar,
        steps
      };
    });

    return { ...path, courses };
  }

  // Fallback to old flat storage
  const allCourses = pathCoursesRepo.getAll()
    .filter((c) => c.path_id === path.id)
    .sort((a, b) => a.course_order - b.course_order);

  const allSteps = pathStepsRepo.getAll()
    .filter((s) => s.path_id === path.id)
    .sort((a, b) => a.step_order - b.step_order);
    
  const courses = allCourses.map(course => ({
    ...course,
    steps: allSteps.filter(s => s.course_id === course.id)
  }));
  
  const unassigned_steps = allSteps.filter(s => !s.course_id);

  return { ...path, courses, unassigned_steps };
};

export const resetAllData = () => {
  toolsRepo.reset();
  articlesRepo.reset();
  contentRepo.reset();
  pathsRepo.reset();
  pathCoursesRepo.reset();
  pathStepsRepo.reset();
  coursesRepo.reset();
  modulesRepo.reset();
  lessonsRepo.reset();
  pathStagesRepo.reset();
  pathStageItemsRepo.reset();
  settingsRepo.reset();
  domainsRepo.reset();
};
