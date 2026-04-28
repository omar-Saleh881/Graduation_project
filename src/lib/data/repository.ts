import { initialTools, initialArticles, initialContent, initialPaths, initialPathSteps, initialPathCourses, initialDomains } from "./seed";
import { Tool } from "@/types/tool";
import { Article } from "@/types/article";
import { ContentResource } from "@/types/content";
import { LearningPath, PathStep, PathCourse, LearningPathWithSteps } from "@/types/learning-path";
import { Course, CourseModule, Lesson, PathStage, PathStageItem } from "@/types/builder";
import { PlatformSection, SectionTemplateType } from "@/types/platform-section";
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
// Default sections if empty or missing built-ins
const currentSections = sectionsRepo.getAll();
const builtInTypes: SectionTemplateType[] = ['tools', 'paths', 'articles', 'courses', 'content'];

const defaultBuiltIns: Record<string, any> = {
  tools: {
    title_ar: "دليل الأدوات الذكية",
    description_ar: "أكبر دليل عربي لأدوات AI — ابحث، قارن، واختر من بين مئات الأدوات المُصنّفة.",
    icon: "🔍",
    template_type: 'tools',
    module_mode: false,
    display_style: 'grid',
    max_items: 6,
    order: 1,
    is_active: true,
    cta_text: "تصفّح الأدوات",
    empty_state_text: "لا توجد أدوات منشورة حالياً"
  },
  paths: {
    title_ar: "المسارات التعليمية",
    description_ar: "مسارات مُنظّمة خطوة بخطوة تغطي الكتابة، التصميم، البرمجة، والتسويق.",
    icon: "📚",
    template_type: 'paths',
    module_mode: false,
    display_style: 'cards',
    max_items: 6,
    order: 2,
    is_active: true,
    cta_text: "ابدأ مسارك الأول",
    empty_state_text: "لا توجد مسارات منشورة حالياً"
  },
  articles: {
    title_ar: "المقالات التعليمية",
    description_ar: "مقالات عربية مبسّطة تشرح المفاهيم والأدوات بأسلوب واضح وعملي.",
    icon: "📝",
    template_type: 'articles',
    module_mode: false,
    display_style: 'list',
    max_items: 6,
    order: 3,
    is_active: true,
    cta_text: "اقرأ أحدث المقالات",
    empty_state_text: "لا توجد مقالات منشورة حالياً"
  },
  courses: {
    title_ar: "كورسات المنصة",
    description_ar: "دورات متكاملة تغطي مختلف جوانب الذكاء الاصطناعي من البداية حتى الاحتراف.",
    icon: "🎓",
    template_type: 'courses',
    module_mode: false,
    display_style: 'featured',
    max_items: 6,
    order: 4,
    is_active: true,
    cta_text: "تصفح الكورسات",
    empty_state_text: "لا توجد كورسات متاحة حالياً"
  },
  content: {
    title_ar: "مصادر ومحتوى خارجي",
    description_ar: "ترشيحات لأفضل الكورسات، الفيديوهات، والمصادر العالمية الموثوقة.",
    icon: "🔗",
    template_type: 'content',
    module_mode: false,
    display_style: 'grid',
    max_items: 6,
    order: 5,
    is_active: true,
    cta_text: "استكشف المكتبة",
    empty_state_text: "لا توجد مصادر خارجية حالياً"
  }
};

builtInTypes.forEach(type => {
  const exists = currentSections.find(s => s.template_type === type && !s.module_mode);
  if (!exists) {
    sectionsRepo.create(defaultBuiltIns[type]);
  }
});


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
                resource_url: `/article/${article.slug || article.id}`,
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
          case 'document':
            baseData = {
              id: item.id,
              title_ar: item.title_override || "مستند",
              description_ar: item.description_override || "",
              resource_type: 'document',
              resource_url: item.url || "#",
              document_url: item.document_url,
              document_label: item.document_label,
              duration_minutes: item.duration_minutes || 0,
              content_ar: item.notes || ""
            };
            break;
          case 'video':
            baseData = {
              id: item.id,
              title_ar: item.title_override || "فيديو",
              description_ar: item.description_override || "",
              resource_type: 'video',
              resource_url: item.url || "#",
              youtube_url: item.youtube_url,
              duration_minutes: item.duration_minutes || 0,
              content_ar: item.notes || ""
            };
            break;
        }

        if (!baseData || !Object.keys(baseData).length) {
          // If no base data (like for external or manual item), use the item itself
          baseData = {
            id: item.reference_id || item.id,
            title_ar: item.title_override || "عنصر تعليمي",
            description_ar: item.description_override || "",
            resource_type: item.item_type === 'course' ? 'external' : item.item_type,
            resource_url: item.url || "#",
            duration_minutes: item.duration_minutes || 0,
            content_ar: item.content_ar || item.notes || ""
          };
        }

        return {
          id: item.id, // Always use the stage item ID for navigation to avoid confusion
          path_id: path.id,
          course_id: stage.id,
          step_order: item.order,
          title_ar: item.title_override || baseData.title_ar || "بدون عنوان",
          description_ar: item.description_override || baseData.description_ar || "",
          resource_type: item.item_type === 'course' ? 'external' : (item.item_type as any),
          resource_url: item.url || baseData.resource_url || "#",
          youtube_url: item.youtube_url || baseData.youtube_url || "",
          document_url: item.document_url || baseData.document_url || "",
          document_label: item.document_label || baseData.document_label || "",
          quiz: item.quiz || baseData.quiz,
          duration_minutes: item.duration_minutes || baseData.duration_minutes || 0,
          content_ar: item.content_ar || item.notes || baseData.content_ar || ""
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
  sectionsRepo.reset();
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION ITEMS RESOLVER
// Fetches real content from existing repos based on section config.
// Does NOT create any new CRUD module — it only reads from existing repos.
// ─────────────────────────────────────────────────────────────────────────────
export interface SectionItem {
  id: string;
  title_ar: string;
  description_ar?: string;
  icon?: string;
  href: string;          // where clicking this item goes
  badge?: string;        // optional type label (e.g. "أداة", "مقال")
  meta?: string;         // optional subtitle (e.g. read time, level)
}

export const DEFAULT_CTA_LINKS: Record<SectionTemplateType, string> = {
  tools: '/tools',
  paths: '/paths',
  courses: '/courses',
  articles: '/articles',
  content: '/content',
};

export function getSectionCtaLink(section: PlatformSection): string {
  // Always resolve to the dedicated isolated route for custom modules, ignoring legacy DB fallbacks
  if (section.module_mode) return `/section/${section.id}`;
  if (section.cta_link) return section.cta_link;
  return DEFAULT_CTA_LINKS[section.template_type] || '/';
}

export function getSectionItems(section: PlatformSection): SectionItem[] {
  const limit = section.max_items ?? 6;
  const type = section.template_type;
  const isModule = section.module_mode === true;

  if (type === 'tools') {
    return toolsRepo.getAll()
      .filter(t => t.is_active !== false && (isModule ? t.section_id === section.id : !t.section_id))
      .slice(0, limit)
      .map(t => ({
        id: t.id,
        title_ar: t.name,
        description_ar: t.description_ar,
        href: `/tool/${t.handle || t.id}`,
        badge: 'أداة',
      }));
  }

  if (type === 'articles') {
    return articlesRepo.getAll()
      .filter(a => a.is_published !== false && (isModule ? a.section_id === section.id : !a.section_id))
      .slice(0, limit)
      .map(a => ({
        id: a.id,
        title_ar: a.title_ar,
        description_ar: a.excerpt_ar,
        href: `/article/${a.slug || a.id}`,
        badge: 'مقال',
        meta: a.read_time_minutes ? `${a.read_time_minutes} دقائق` : undefined,
      }));
  }

  if (type === 'paths') {
    return pathsRepo.getAll()
      .filter(p => p.is_published !== false && (isModule ? p.section_id === section.id : !p.section_id))
      .slice(0, limit)
      .map(p => ({
        id: p.id,
        title_ar: p.title_ar,
        description_ar: p.description_ar,
        icon: p.icon,
        href: `/paths/${p.slug}`,
        badge: 'مسار',
      }));
  }

  if (type === 'courses') {
    return coursesRepo.getAll()
      .filter(c => c.is_published !== false && (isModule ? c.section_id === section.id : !c.section_id))
      .slice(0, limit)
      .map(c => ({
        id: c.id,
        title_ar: c.title_ar,
        description_ar: c.description_ar,
        href: `/courses/${c.slug || c.id}`,
        badge: 'كورس',
        meta: c.level,
      }));
  }

  if (type === 'content') {
    return contentRepo.getAll()
      .filter(c => c.is_published !== false && (isModule ? c.section_id === section.id : !c.section_id))
      .slice(0, limit)
      .map(c => ({
        id: c.id,
        title_ar: c.title_ar,
        description_ar: c.description_ar,
        href: c.url,
        badge: 'مصدر خارجي',
        meta: c.provider,
      }));
  }

  return [];
}
