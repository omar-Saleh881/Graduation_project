import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, ExternalLink, BookOpen, Video, Wrench, PenTool, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearningPath } from "@/hooks/use-learning-paths";

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};

const typeIcons: Record<string, React.ReactNode> = {
  lesson: <BookOpen className="h-4 w-4" />,
  article: <FileText className="h-4 w-4 text-blue-500" />,
  video: <Video className="h-4 w-4 text-red-500" />,
  tool: <Wrench className="h-4 w-4 text-orange-500" />,
  exercise: <PenTool className="h-4 w-4 text-green-500" />,
  quiz: <PenTool className="h-4 w-4 text-purple-500" />,
  external: <ExternalLink className="h-4 w-4 text-slate-500" />,
};

const typeLabels: Record<string, string> = {
  lesson: "درس محتوى",
  article: "مقال تعليمي",
  video: "فيديو حصري",
  tool: "أداة مساعدة",
  exercise: "تمرين عملي",
  quiz: "اختبار تقييمي",
  external: "مصدر خارجي",
};

const PathDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: path, isLoading } = useLearningPath(slug ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 rounded-lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">المسار غير موجود</h1>
          <Link to="/paths">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للمسارات
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
            <span className="mx-1">/</span>
            <Link to="/paths" className="hover:text-foreground transition-colors">المسارات</Link>
            <span className="mx-1">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{path.title_ar}</span>
          </nav>

          {/* Header */}
          <div className="flex items-start gap-5 mb-8">
            <span className="text-5xl">{path.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{path.title_ar}</h1>
              <p className="mt-2 text-lg text-muted-foreground leading-relaxed">{path.description_ar}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Badge variant="secondary">{levelLabels[path.level]}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {path.estimated_hours} ساعات
                </Badge>
                <Badge variant="outline">{path.category}</Badge>
              </div>
            </div>
          </div>

          {/* Courses & Steps */}
          <h2 className="text-2xl font-bold text-foreground mb-6">محتوى المسار ({path.steps_count} خطوات)</h2>
          <div className="space-y-8">
            {path.courses?.map((course, cIdx) => (
              <div key={course.id} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/20 text-primary font-bold">
                    {cIdx + 1}
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{course.title_ar}</h3>
                </div>
                {course.description_ar && (
                  <p className="text-muted-foreground mr-11 mb-2">{course.description_ar}</p>
                )}
                
                <div className="space-y-3 mr-4 border-r-2 border-primary/20 pr-6">
                  {course.steps.map((step, idx) => (
                    <Card key={step.id} className="overflow-hidden transition-all hover:shadow-md hover:border-primary/40 text-right">
                      <CardContent className="p-4 sm:p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground font-bold text-sm mt-1">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-foreground text-lg mb-1">{step.title_ar}</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed mb-3">{step.description_ar}</p>
                              <div className="flex flex-wrap items-center gap-3">
                                <Badge variant="secondary" className="gap-1 text-xs px-2 py-0.5">
                                  {typeIcons[step.resource_type]}
                                  {typeLabels[step.resource_type]}
                                </Badge>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {step.duration_minutes} دقيقة
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="sm:shrink-0 flex items-center justify-end mt-2 sm:mt-0">
                            {/* Improved routing and rendering for all item types */}
                            {['lesson', 'video', 'document', 'quiz'].includes(step.resource_type) ? (
                              <Link to={`/paths/${path.slug}/lesson/${step.id}`}>
                                <Button size="sm" className="gap-1.5 w-full sm:w-auto">
                                  {step.resource_type === 'quiz' ? 'ابدأ الاختبار' : step.resource_type === 'document' ? 'عرض المستند' : step.resource_type === 'video' ? 'شاهد الفيديو' : 'ابدأ الدرس'}
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            ) : step.resource_type === 'tool' ? (
                              <a href={step.resource_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto">
                                  الذهاب للأداة
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            ) : step.resource_type === 'article' ? (
                              <Link to={step.resource_url}>
                                <Button variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto">
                                  اقرأ المقال
                                  <ArrowRight className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            ) : step.resource_type === 'external' && step.resource_url ? (
                              <a href={step.resource_url} target="_blank" rel="noopener noreferrer">
                                <Button variant="outline" size="sm" className="gap-1.5 w-full sm:w-auto">
                                  افتح المصدر الخارجي
                                  <ExternalLink className="h-3.5 w-3.5" />
                                </Button>
                              </a>
                            ) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
            
            {/* Unassigned steps if any */}
            {path.unassigned_steps && path.unassigned_steps.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-foreground opacity-50 mt-8">خطوات أخرى</h3>
                <div className="space-y-3 mr-4 border-r-2 border-border pr-6">
                  {path.unassigned_steps.map((step, idx) => (
                    <Card key={step.id} className="opacity-70 hover:opacity-100 transition-opacity">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{step.title_ar}</h4>
                          <Badge variant="outline" className="mt-1">{typeLabels[step.resource_type]}</Badge>
                        </div>
                        {step.resource_url && step.resource_url !== "#" && (
                          <a href={step.resource_url} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm">فتح <ExternalLink className="h-3 w-3 mr-1" /></Button>
                          </a>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PathDetails;
