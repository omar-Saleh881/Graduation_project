import { Tool } from "@/types/tool";
import { Article } from "@/types/article";
import { ContentResource } from "@/types/content";
import { LearningPath, PathStep, PathCourse } from "@/types/learning-path";
import { Domain } from "@/types/domain";

// ── Domains ──
export const initialDomains: Domain[] = [
  {
    id: "dom-1",
    name_ar: "الذكاء الاصطناعي",
    slug: "ai",
    description_ar: "عالم الذكاء الاصطناعي، تعلم الآلة، والشبكات العصبية.",
    icon: "🧠",
    order: 1,
    is_active: true,
    content_types: ['courses', 'paths', 'articles', 'tools'],
    created_at: new Date().toISOString()
  },
  {
    id: "dom-2",
    name_ar: "تطوير الويب",
    slug: "web-dev",
    description_ar: "بناء المواقع وتطبيقات الويب باستخدام أحدث التقنيات.",
    icon: "💻",
    order: 2,
    is_active: true,
    content_types: ['courses', 'paths', 'tools'],
    created_at: new Date().toISOString()
  },
  {
    id: "dom-3",
    name_ar: "التصميم الرقمي",
    slug: "design",
    description_ar: "فنون التصميم الجرافيكي، واجهات المستخدم، وتجربة المستخدم.",
    icon: "🎨",
    order: 3,
    is_active: true,
    content_types: ['tools', 'articles'],
    created_at: new Date().toISOString()
  }
];

// ── Tools ──
export const initialTools: Tool[] = [
  { id: "1", name: "ChatGPT", handle: "chatgpt", website_url: "https://chat.openai.com", logo_url: "https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg", description_en: "A language model...", description_ar: "نموذج لغوي قوي من أوبن إيه آي...", summary_ar: "أفضل أداة للمحادثة وكتابة النصوص.", category: "كتابة ومحادثة", tags: ["writing", "ai", "كتابة"], pricing_model: "freemium", target_audience: "الجميع", difficulty_level: 1, is_featured: true, votes_count: 5200, created_at: new Date().toISOString(), is_active: true, status: "published" },
  { id: "2", name: "Midjourney", handle: "midjourney", website_url: "https://midjourney.com", logo_url: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Midjourney_Emblem.png", description_en: "AI image generator.", description_ar: "توليد صور احترافية بكتابة الأوامر.", summary_ar: "توليد صور احترافية بكتابة الأوامر.", category: "توليد صور", tags: ["image", "تصميم"], pricing_model: "paid", target_audience: "المصممين", difficulty_level: 3, is_featured: true, votes_count: 3100, created_at: new Date().toISOString(), is_active: true, status: "published" },
  { id: "3", name: "Claude", handle: "claude", website_url: "https://anthropic.com/claude", logo_url: "", description_en: "A next generation AI assistant.", description_ar: "مساعد ذكي قوي في تحليل المستندات الطويلة.", summary_ar: "مساعد ذكي قوي في تحليل المستندات الطويلة.", category: "كتابة ومحادثة", tags: ["writing", "analysis"], pricing_model: "freemium", target_audience: "الجميع", difficulty_level: 2, is_featured: false, votes_count: 1400, created_at: new Date().toISOString(), is_active: true, status: "published" }
];

// ── Articles ──
export const initialArticles: Article[] = [
  { id: "art-1", title_ar: "ما هو الذكاء الاصطناعي التوليدي؟ دليل مبسّط", excerpt_ar: "شرح مبسّط لمفهوم الذكاء...", content_ar: `## ما هو الذكاء الاصطناعي التوليدي؟\n...`, slug: "what-is-generative-ai", category: "مفاهيم أساسية", tags: ["ذكاء اصطناعي", "مبتدئين"], cover_image: "", author_name: "فريق المنصة", read_time_minutes: 5, is_published: true, published_at: "2026-01-20T00:00:00Z", created_at: "2026-01-20T00:00:00Z" },
  { id: "art-2", title_ar: "10 أدوات ذكاء اصطناعي يجب أن يعرفها كل طالب", excerpt_ar: "قائمة بأهم الأدوات التي تساعد الطلاب...", content_ar: `## أدوات لا غنى عنها للطلاب\n...`, slug: "10-ai-tools-for-students", category: "أدوات", tags: ["طلاب", "تعليم"], cover_image: "", author_name: "فريق المنصة", read_time_minutes: 7, is_published: true, published_at: "2026-02-05T00:00:00Z", created_at: "2026-02-05T00:00:00Z" }
];

// ── Content Library ──
export const initialContent: ContentResource[] = [
  { id: "cr-1", title_ar: "دورة CS50 لعلوم الحاسب", description_ar: "من أشهر الدورات المجانية في علوم الحاسب...", url: "https://cs50.harvard.edu", type: "course", category: "برمجة", tags: ["علوم حاسب", "مجاني"], provider: "Harvard / edX", is_free: true, language: "إنجليزي (مترجم)", is_published: true, created_at: "2026-01-10T00:00:00Z" },
  { id: "cr-2", title_ar: "شرح الذكاء الاصطناعي — 3Blue1Brown", description_ar: "سلسلة فيديوهات تشرح الشبكات العصبية...", url: "https://youtube.com", type: "video", category: "ذكاء اصطناعي", tags: ["تعلم عميق"], provider: "YouTube", is_free: true, language: "إنجليزي", is_published: true, created_at: "2026-01-15T00:00:00Z" },
  { id: "cr-5", title_ar: "دورة Google في تعلم الآلة", description_ar: "دورة مجانية من Google تشرح أساسيات تعلم الآلة...", url: "https://developers.google.com/machine-learning/crash-course", type: "course", category: "تعلم الآلة", tags: ["Google", "مجاني"], provider: "Google", is_free: true, language: "إنجليزي", is_published: true, created_at: "2026-02-10T00:00:00Z" }
];

// ── Paths ──
export const initialPaths: LearningPath[] = [
  { id: "lp-1", title_ar: "أساسيات الذكاء الاصطناعي", description_ar: "تعلّم المفاهيم الأساسية للذكاء الاصطناعي من الصفر.", slug: "ai-fundamentals", level: "beginner", estimated_hours: 8, category: "ذكاء اصطناعي", icon: "🧠", is_published: true, steps_count: 5, created_at: "2026-01-15T00:00:00Z" },
  { id: "lp-2", title_ar: "كتابة المحتوى بالذكاء الاصطناعي", description_ar: "تعلّم كيف تستخدم أدوات الذكاء الاصطناعي لإنشاء محتوى إبداعي.", slug: "ai-content-writing", level: "beginner", estimated_hours: 6, category: "كتابة", icon: "✍️", is_published: true, steps_count: 4, created_at: "2026-02-01T00:00:00Z" }
];

export const initialPathCourses: PathCourse[] = [
  { id: "c1-1", path_id: "lp-1", course_order: 1, title_ar: "مقدمة في الذكاء الاصطناعي", description_ar: "المفاهيم الأولى والمبادئ" },
  { id: "c1-2", path_id: "lp-1", course_order: 2, title_ar: "تطبيقات الذكاء الاصطناعي", description_ar: "أمثلة عملية" },
  { id: "c2-1", path_id: "lp-2", course_order: 1, title_ar: "أساسيات الكتابة", description_ar: "كيف تكتب بشكل جيد" },
];

export const initialPathSteps: PathStep[] = [
  { id: "s1-1", path_id: "lp-1", course_id: "c1-1", step_order: 1, title_ar: "ما هو الذكاء الاصطناعي؟", description_ar: "مقدمة شاملة عن تاريخ ومفاهيم الذكاء الاصطناعي.", resource_type: "article", resource_url: "#", duration_minutes: 30, content_ar: "الذكاء الاصطناعي هو المجال الذي يهدف لبناء آلات قادرة على التفكير..." },
  { id: "s1-2", path_id: "lp-1", course_id: "c1-1", step_order: 2, title_ar: "تعلّم الآلة للمبتدئين", description_ar: "فهم أساسيات تعلم الآلة والخوارزميات.", resource_type: "video", resource_url: "https://www.youtube.com/watch?v=aircAruvnKk", duration_minutes: 45 },
  { id: "s2-1", path_id: "lp-2", course_id: "c2-1", step_order: 1, title_ar: "مقدمة في كتابة المحتوى", description_ar: "أساسيات كتابة المحتوى الرقمي.", resource_type: "lesson", resource_url: "#", duration_minutes: 25, content_ar: "تتضمن أساسيات كتابة المحتوى فهم الجمهور المستهدف وتحديد الرسالة بوضوح." },
  { id: "s2-2", path_id: "lp-2", course_id: "c2-1", step_order: 2, title_ar: "استخدام ChatGPT للكتابة", description_ar: "كيف تكتب مقالات وتدوينات بمساعدة AI.", resource_type: "tool", resource_url: "/tool/chatgpt", duration_minutes: 40 },
];
