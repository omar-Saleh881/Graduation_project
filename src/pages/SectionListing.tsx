import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, PackageOpen, Clock, BarChart3, GraduationCap, FileText } from "lucide-react";
import { sectionsRepo, toolsRepo, articlesRepo, pathsRepo, coursesRepo } from "@/lib/data/repository";
import { PlatformSection } from "@/types/platform-section";
import ToolCard from "@/components/ToolCard";

export default function SectionListing() {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<PlatformSection | null>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const found = sectionsRepo.getById(id);
    if (found) {
      setSection(found);
      
      // Fetch full rich data based on template_type scoped ONLY to this section.id
      let loadedItems: any[] = [];
      const isModule = found.module_mode === true;
      const sid = isModule ? found.id : undefined;

      switch (found.template_type) {
        case 'tools':
          loadedItems = toolsRepo.getAll().filter(t => t.is_active !== false && t.section_id === sid);
          break;
        case 'articles':
          loadedItems = articlesRepo.getAll().filter(a => a.is_published !== false && a.section_id === sid);
          break;
        case 'paths':
          loadedItems = pathsRepo.getAll().filter(p => p.is_published !== false && p.section_id === sid);
          break;
        case 'courses':
          loadedItems = coursesRepo.getAll().filter(c => c.is_published !== false && c.section_id === sid);
          break;
      }
      
      setItems(loadedItems);
    }
    setIsLoading(false);
  }, [id]);

  if (!isLoading && !section) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <h1 className="text-2xl font-bold mb-2">القسم غير موجود</h1>
            <p className="text-muted-foreground mb-6">تعذّر إيجاد القسم المطلوب.</p>
            <Link to="/"><Button variant="outline">العودة للرئيسية</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Renderers for different types to match public pages exact UI
  const renderTools = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((tool) => (
        <ToolCard key={tool.id} tool={tool} />
      ))}
    </div>
  );

  const renderArticles = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((article) => (
        <Card key={article.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 flex flex-col">
          <Link to={`/article/${article.slug || article.id}`} className="block aspect-video overflow-hidden relative bg-muted/50">
            {article.cover_image ? (
              <img src={article.cover_image} alt={article.title_ar} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 italic transition-colors group-hover:bg-primary/5">
                <FileText className="h-10 w-10 mb-2" />
                <span className="text-xs">مقال تعليمي</span>
              </div>
            )}
            <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background border-border shadow-sm">
              {article.category}
            </Badge>
          </Link>
          <CardContent className="p-5 flex-1 flex flex-col">
            <Link to={`/article/${article.slug || article.id}`}>
              <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                {article.title_ar}
              </h3>
            </Link>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{article.excerpt_ar}</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-xs text-muted-foreground">{article.read_time_minutes} دقائق قراءة</span>
              <Link to={`/article/${article.slug || article.id}`}><Button variant="ghost" size="sm">اقرأ المزيد</Button></Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPaths = () => {
    const levelLabels: Record<string, string> = { beginner: "مبتدئ", intermediate: "متوسط", advanced: "متقدم" };
    const levelColors: Record<string, string> = {
      beginner: "bg-green-100 text-green-700",
      intermediate: "bg-yellow-100 text-yellow-700",
      advanced: "bg-red-100 text-red-700",
    };
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((path) => (
          <Card key={path.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{path.icon}</span>
                <div className="flex-1 min-w-0">
                  <Link to={`/paths/${path.slug}`}>
                    <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">{path.title_ar}</h3>
                  </Link>
                  <Badge className={`mt-2 text-xs ${levelColors[path.level]}`} variant="secondary">
                    {levelLabels[path.level]}
                  </Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">{path.description_ar}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {path.estimated_hours} ساعات</span>
                <span className="flex items-center gap-1"><BarChart3 className="h-3.5 w-3.5" /> {path.steps_count} خطوات</span>
              </div>
              <Link to={`/paths/${path.slug}`}>
                <Button variant="outline" size="sm" className="w-full gap-1.5">ابدأ المسار <ArrowLeft className="h-4 w-4" /></Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderCourses = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((course) => (
        <Card key={course.id} className="group hover:shadow-xl transition-all border-2 hover:border-primary/20">
          <CardContent className="p-6">
            <Badge className="mb-4">{course.category}</Badge>
            <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{course.title_ar}</h3>
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description_ar}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
              <span className="flex items-center gap-1"><Clock size={14} /> {course.level}</span>
            </div>
            <Link to={`/courses/${course.slug || course.id}`}>
              <Button className="w-full gap-2">عرض تفاصيل الكورس <ArrowLeft size={16} /></Button>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-bl from-primary/10 via-background to-accent/5 py-16">
          <div className="container mx-auto px-4 text-center">
            {isLoading ? (
              <div className="space-y-4 max-w-lg mx-auto">
                <Skeleton className="h-12 w-3/4 mx-auto rounded-full" />
                <Skeleton className="h-6 w-full rounded-full" />
              </div>
            ) : (
              <>
                <div className="text-5xl mb-4">{section?.icon || "📦"}</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{section?.title_ar}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {section?.description_ar}
                </p>
                <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="secondary">قسم مستقل وحصري</Badge>
                  {items.length > 0 && <span>{items.length} عنصر</span>}
                </div>
              </>
            )}
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
              </div>
            ) : items.length > 0 ? (
              <>
                {section?.template_type === 'tools' && renderTools()}
                {section?.template_type === 'articles' && renderArticles()}
                {section?.template_type === 'paths' && renderPaths()}
                {section?.template_type === 'courses' && renderCourses()}
              </>
            ) : (
              <div className="text-center py-24">
                <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {section?.empty_state_text || "لا توجد عناصر حالياً"}
                </h2>
                <p className="text-muted-foreground mb-8">
                  هذا القسم حصري ومستقل. لم يتم نشر أي عناصر مخصصة لهذا القسم بعد.
                </p>
                <Link to="/">
                  <Button variant="outline" className="gap-2"><ArrowLeft className="h-4 w-4" /> العودة للرئيسية</Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
