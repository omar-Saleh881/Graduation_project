import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { settingsRepo, sectionsRepo, getSectionItems, getSectionCtaLink } from "@/lib/data/repository";
import { PlatformSection } from "@/types/platform-section";
import {
  Sparkles, Search, GraduationCap, FileText, Library, MessageCircleQuestion,
  ArrowLeft, Target, Rocket, Users, BookOpen, CheckCircle2,
  Zap, Shield, Globe, TrendingUp, Star, ChevronLeft, Lightbulb, PackageOpen
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   HOME — Premium Arabic Landing Page (refined v2)
   Section IDs match Navbar's landingSections for smooth scrolling
   ═══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────────────────
   DynamicSections — renders the admin-configured sections with real items
   ───────────────────────────────────────────────────────────────────────────── */
function DynamicSections() {
  const [sections, setSections] = useState<PlatformSection[]>([]);
  useEffect(() => {
    setSections(
      sectionsRepo.getAll().filter(s => s.is_active).sort((a, b) => a.order - b.order)
    );
  }, []);

  if (sections.length === 0) return null;

  return (
    <section id="sections" className="py-20 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-sm font-semibold text-accent tracking-wide bg-accent/5 rounded-full px-4 py-1 mb-3">
            استكشف المنصة
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
            أقسام المنصة الرئيسية
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
            كل قسم مصمّم ليقدّم لك تجربة تعليمية متكاملة
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sections.map((section) => {
            const previewItems = getSectionItems({ ...section, max_items: 3 });
            const ctaLink = getSectionCtaLink(section);
            return (
              <Card
                key={section.id}
                className="group overflow-hidden border-border/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 flex flex-col"
              >
                <CardContent className="p-0 flex flex-col flex-1">
                  {/* Header */}
                  <div className="bg-gradient-to-br from-primary/5 to-primary/10 px-6 py-5 flex items-center gap-4">
                    <span className="text-3xl group-hover:scale-110 transition-transform shrink-0">
                      {section.icon || "✨"}
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-foreground leading-snug">{section.title_ar}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{section.description_ar}</p>
                    </div>
                  </div>

                  {/* Live preview items */}
                  <div className="px-6 py-4 flex-1 space-y-2.5">
                    {previewItems.length > 0 ? (
                      previewItems.map(item => (
                        <Link key={item.id} to={item.href} className="flex items-start gap-3 group/item hover:bg-muted/50 -mx-2 px-2 py-1.5 rounded-lg transition-colors">
                          {item.icon && <span className="text-lg shrink-0">{item.icon}</span>}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground leading-snug line-clamp-1 group-hover/item:text-primary transition-colors">
                              {item.title_ar}
                            </p>
                            {item.meta && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.meta}</p>
                            )}
                          </div>
                          {item.badge && (
                            <Badge variant="outline" className="text-[10px] shrink-0 py-0">{item.badge}</Badge>
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-6 text-center">
                        <PackageOpen className="h-8 w-8 text-muted-foreground/30 mb-2" />
                        <p className="text-xs text-muted-foreground">
                          {section.empty_state_text || "لا توجد عناصر حالياً"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="px-6 pb-5 pt-2 border-t border-border/40">
                    <Link to={ctaLink}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-primary hover:text-primary hover:bg-primary/5 -mx-2 w-full justify-start font-medium"
                      >
                        {section.cta_text || "استكشف"}
                        <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 mr-auto" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}


const Home = () => {
  const [settings, setSettings] = useState(() => settingsRepo.getById("global"));

  useEffect(() => {
    const handleFocus = () => setSettings(settingsRepo.getById("global"));
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            § 1  HERO — id="hero"
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section
          id="hero"
          className="relative overflow-hidden bg-gradient-to-bl from-primary/12 via-background to-accent/8 pt-20 pb-24 md:pt-28 md:pb-32 lg:pt-36 lg:pb-40"
        >
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-32 h-[400px] w-[400px] rounded-full bg-accent/5 blur-3xl" />

          <div className="container relative mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Text side */}
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5 text-sm font-medium text-primary mb-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                  <Sparkles className="h-4 w-4" />
                  منصتك العربية الأولى للمهارات الرقمية
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-bold text-foreground leading-[1.18] tracking-tight animate-in fade-in slide-in-from-bottom-3 duration-700 delay-100">
                  {settings?.heroTitle || "اكتشف، تعلّم، وأتقن أدوات الذكاء الاصطناعي"}
                </h1>

                <p className="mt-6 text-lg text-muted-foreground leading-[1.8] max-w-lg animate-in fade-in slide-in-from-bottom-3 duration-700 delay-200">
                  {settings?.heroSubtitle || "دليل عربي شامل يساعدك على اكتشاف أفضل الأدوات الذكية، التعلّم عبر مسارات مُنظّمة، وقراءة محتوى مبسّط — كل شيء مجاني وباللغة العربية."}
                </p>

                <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-in fade-in slide-in-from-bottom-3 duration-700 delay-300">
                  <Link to="/tools">
                    <Button size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow">
                      <Search className="h-5 w-5" />
                      استكشف الأدوات الآن
                    </Button>
                  </Link>
                  <Link to="/quiz">
                    <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto">
                      <MessageCircleQuestion className="h-5 w-5" />
                      ما الأداة المناسبة لي؟
                    </Button>
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground animate-in fade-in duration-700 delay-500">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    +200 أداة ذكية
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    مسارات تعليمية مجانية
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                    محتوى عربي 100%
                  </span>
                </div>
              </div>

              {/* Visual mockup */}
              <div className="relative hidden lg:block animate-in fade-in slide-in-from-left-6 duration-1000 delay-300">
                <div className="relative rounded-2xl border border-border/50 bg-gradient-to-br from-card via-card to-muted/50 p-8 shadow-2xl shadow-primary/5">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded-full bg-muted" />
                        <div className="h-2 w-1/2 rounded-full bg-muted/70" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      {["🧠", "✍️", "🎨"].map((emoji, i) => (
                        <div key={i} className="rounded-xl border border-border bg-background p-4 text-center transition-transform hover:scale-105">
                          <span className="text-2xl">{emoji}</span>
                          <div className="mt-2 h-2 w-full rounded-full bg-muted" />
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-primary/5 border border-primary/10 p-4 flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary" />
                      <div className="flex-1 space-y-1.5">
                        <div className="h-2.5 w-2/3 rounded-full bg-primary/20" />
                        <div className="h-2 w-1/3 rounded-full bg-primary/10" />
                      </div>
                      <div className="text-xs font-bold text-primary bg-primary/10 rounded-full px-3 py-1">92%</div>
                    </div>

                    <div className="flex gap-2">
                      <div className="h-2 flex-1 rounded-full bg-accent/30" />
                      <div className="h-2 w-1/4 rounded-full bg-primary/20" />
                    </div>
                  </div>
                </div>

                {/* Floating accent card */}
                <div className="absolute -bottom-6 -left-6 rounded-xl border border-border bg-card px-4 py-3 shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-700 delay-700">
                  <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">+45% تحسّن</p>
                    <p className="text-[11px] text-muted-foreground">في المهارات الرقمية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            § 1.5  PLATFORM SECTIONS — Dynamic, content-aware
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <DynamicSections />

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            § 2  FEATURES — id="features"
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="features" className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="inline-block text-sm font-semibold text-primary tracking-wide bg-primary/5 rounded-full px-4 py-1 mb-3">لماذا هذه المنصة؟</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                كل ما تحتاجه لإتقان الأدوات الرقمية
              </h2>
              <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
                صمّمنا المنصة لتكون دليلك العربي الشامل — من الاكتشاف إلى الإتقان
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  icon: Search,
                  color: "text-primary bg-primary/10",
                  title: "اكتشف أدوات الذكاء الاصطناعي",
                  desc: "تصفّح مئات الأدوات الذكية مع تصنيفات دقيقة ومراجعات عربية شاملة",
                },
                {
                  icon: GraduationCap,
                  color: "text-accent bg-accent/10",
                  title: "تعلّم عبر مسارات مُنظّمة",
                  desc: "مسارات تعليمية متدرّجة من المبتدئ إلى المتقدّم مع محتوى عملي",
                },
                {
                  icon: FileText,
                  color: "text-orange-600 bg-orange-100 dark:text-orange-400 dark:bg-orange-950/40",
                  title: "اقرأ محتوى عربي مبسّط",
                  desc: "مقالات ودروس مكتوبة بأسلوب واضح تشرح المفاهيم المعقدة ببساطة",
                },
                {
                  icon: Target,
                  color: "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-950/40",
                  title: "احصل على توصيات ذكية",
                  desc: "أجب عن أسئلة بسيطة واحصل على أدوات مناسبة لمستواك واحتياجاتك",
                },
              ].map((f, i) => (
                <Card
                  key={i}
                  className="group border-border/50 bg-card/60 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${f.color} mb-4 transition-transform duration-300 group-hover:scale-110`}
                    >
                      <f.icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2 leading-snug">{f.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            § 4  WHY THIS PLATFORM — nested before "how-it-works"
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              {/* Text */}
              <div>
                <span className="inline-block text-sm font-semibold text-primary tracking-wide bg-primary/5 rounded-full px-4 py-1 mb-4">لماذا تختارنا؟</span>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                  منصة صُمّمت خصيصاً
                  <span className="text-primary"> للمتعلّم العربي</span>
                </h2>
                <p className="mt-5 text-lg text-muted-foreground leading-[1.8]">
                  نؤمن أن كل شخص يستحق الوصول إلى المعرفة الرقمية بلغته الأم. هذه المنصة هي الجسر بينك وبين عالم الذكاء الاصطناعي — بأسلوب عربي واضح واحترافي.
                </p>
                <div className="mt-8 space-y-5">
                  {[
                    { icon: Globe, title: "محتوى عربي بالكامل", desc: "كل شيء — من الواجهة إلى المقالات والمسارات — مكتوب بالعربية" },
                    { icon: Zap, title: "تعلّم عملي وسريع", desc: "مسارات قصيرة ومركّزة تعطيك نتائج ملموسة خلال أيام" },
                    { icon: Shield, title: "محتوى مُراجع وموثوق", desc: "كل أداة ومقال يمر بمراجعة دقيقة لضمان الجودة والدقة" },
                    { icon: Users, title: "مناسب لجميع المستويات", desc: "سواء كنت مبتدئاً أو خبيراً — ستجد ما يناسبك" },
                  ].map((b, i) => (
                    <div key={i} className="flex gap-4 group">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <b.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{b.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-5">
                {[
                  { value: "+200", label: "أداة ذكاء اصطناعي", icon: Sparkles, accent: "border-primary/20 bg-primary/5 hover:bg-primary/10" },
                  { value: "6+", label: "مسارات تعليمية", icon: BookOpen, accent: "border-accent/20 bg-accent/5 hover:bg-accent/10" },
                  { value: "100%", label: "محتوى عربي", icon: Globe, accent: "border-orange-400/20 bg-orange-500/5 hover:bg-orange-500/10" },
                  { value: "مجاني", label: "بالكامل للجميع", icon: Star, accent: "border-rose-400/20 bg-rose-500/5 hover:bg-rose-500/10" },
                ].map((s, i) => (
                  <div key={i} className={`rounded-2xl border ${s.accent} p-6 text-center transition-all duration-300 hover:scale-[1.03] hover:shadow-md`}>
                    <s.icon className="h-6 w-6 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-3xl font-bold text-foreground">{s.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            § 5  HOW IT WORKS — id="how-it-works"
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="how-it-works" className="py-20 md:py-24 bg-gradient-to-b from-background via-muted/20 to-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="inline-block text-sm font-semibold text-accent tracking-wide bg-accent/5 rounded-full px-4 py-1 mb-3">كيف تعمل المنصة؟</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">
                أربع خطوات نحو الإتقان
              </h2>
              <p className="mt-3 text-muted-foreground text-base">ابدأ من أي مكان — المنصة تتكيّف مع أسلوبك</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden lg:block absolute top-[3.25rem] left-[12%] right-[12%] h-0.5 bg-gradient-to-l from-primary/20 via-accent/20 to-primary/20" />

              {[
                { step: "01", icon: Search, title: "اكتشف", desc: "تصفّح الأدوات والمصادر واعثر على ما يناسبك", color: "bg-primary text-primary-foreground shadow-primary/30" },
                { step: "02", icon: BookOpen, title: "تعلّم", desc: "اتبع المسارات التعليمية واقرأ المقالات المبسّطة", color: "bg-accent text-accent-foreground shadow-accent/30" },
                { step: "03", icon: Rocket, title: "طبّق", desc: "استخدم الأدوات في مشاريعك الحقيقية وجرّبها عملياً", color: "bg-primary text-primary-foreground shadow-primary/30" },
                { step: "04", icon: TrendingUp, title: "تطوّر", desc: "انتقل إلى مستويات أعلى وشارك ما تعلّمته", color: "bg-accent text-accent-foreground shadow-accent/30" },
              ].map((s, i) => (
                <div key={i} className="text-center relative group">
                  <div className={`mx-auto h-[4.5rem] w-[4.5rem] rounded-2xl ${s.color} flex items-center justify-center mb-5 shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl relative z-10`}>
                    <s.icon className="h-8 w-8" />
                  </div>
                  <span className="text-[11px] font-bold text-muted-foreground/60 tracking-[0.2em] uppercase">{s.step}</span>
                  <h3 className="text-xl font-bold text-foreground mt-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed max-w-[210px] mx-auto">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            § 6  ABOUT — id="about"
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section id="about" className="py-20 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block text-sm font-semibold text-primary tracking-wide bg-primary/5 rounded-full px-4 py-1 mb-3">عن المنصة</span>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                نبني أكبر مرجع عربي للمهارات الرقمية
              </h2>
              <div className="mt-6 space-y-4 text-lg text-muted-foreground leading-[1.8]">
                <p>
                  أُسّست هذه المنصة بهدف واحد: تمكين المتعلّم العربي من مواكبة الثورة الرقمية والاستفادة من أدوات الذكاء الاصطناعي بأسلوب عملي ومبسّط.
                </p>
                <p>
                  نجمع بين أكبر دليل عربي لأدوات AI، ومسارات تعليمية مُنظّمة، ومحتوى مبسّط — كل ذلك بلغة عربية واضحة وتصميم عصري يضع تجربة المستخدم أولاً.
                </p>
              </div>

              {/* Target audience */}
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3">
                {["🎓 طلاب", "👩‍🏫 معلمون", "📱 منشئو محتوى", "💻 مطوّرون"].map((label, i) => (
                  <div key={i} className="rounded-lg bg-muted/50 border border-border/50 px-4 py-3 text-sm font-medium text-foreground">{label}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            § 7  FINAL CTA — before footer
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
        <section className="py-20 md:py-24 bg-gradient-to-br from-primary/8 via-background to-accent/8 relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
          <div className="container relative mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <Sparkles className="mx-auto h-10 w-10 text-primary mb-5" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                جاهز تبدأ رحلتك الرقمية؟
              </h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                اكتشف أفضل أدوات الذكاء الاصطناعي، تعلّم مهارات جديدة، واحصل على توصيات مخصصة — كل ذلك مجاناً.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/tools">
                  <Button size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto shadow-lg shadow-primary/20">
                    <Search className="h-5 w-5" />
                    استكشف الأدوات
                  </Button>
                </Link>
                <Link to="/paths">
                  <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto">
                    <GraduationCap className="h-5 w-5" />
                    ابدأ التعلم
                  </Button>
                </Link>
                <Link to="/quiz">
                  <Button variant="outline" size="lg" className="gap-2 text-base px-8 h-12 w-full sm:w-auto">
                    <Target className="h-5 w-5" />
                    اختبر نفسك
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Contact info is inside the Footer — id="contact" wraps it */}
      <div id="contact">
        <Footer />
      </div>
    </div>
  );
};

export default Home;
