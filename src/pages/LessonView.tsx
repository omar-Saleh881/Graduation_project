import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, BookOpen, Clock, ChevronRight, Video, ExternalLink, GraduationCap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLearningPath } from "@/hooks/use-learning-paths";
import { getCourseWithStructure } from "@/lib/data/repository";

const LessonView = () => {
  const { slug, id, lessonId } = useParams<{ slug?: string; id?: string; lessonId: string }>();
  const navigate = useNavigate();
  
  const contextId = slug || id || "";
  const { data: path, isLoading: isPathLoading } = useLearningPath(contextId);
  const [course, setCourse] = useState<any>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  useEffect(() => {
    if (!path && id) {
      setIsLoadingCourse(true);
      const data = getCourseWithStructure(id);
      if (data) setCourse(data);
      setIsLoadingCourse(false);
    }
  }, [id, path]);

  const isLoading = isPathLoading || isLoadingCourse;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center">
          <Skeleton className="h-[400px] w-full max-w-4xl rounded-3xl mb-8" />
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-20 w-full max-w-2xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!path && !course) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-20" />
          <h1 className="text-3xl font-bold mb-4">هذا المحتوى غير متاح حالياً</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">ربما تم نقله أو حذفه من قبل المشرفين.</p>
          <Button onClick={() => navigate('/')} variant="default" className="px-10 h-12 shadow-xl shadow-primary/20">العودة للرئيسية</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const allSteps = path 
    ? path.courses?.flatMap(c => c.steps) || []
    : course?.modules?.flatMap((m: any) => m.lessons) || [];
    
  const currentStepIndex = allSteps.findIndex(s => s.id === lessonId);
  const currentStep = allSteps[currentStepIndex];

  if (!currentStep) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">الدرس غير موجود</h1>
          <Link to={slug ? `/paths/${slug}` : `/courses/${id}`}>
            <Button variant="outline" className="h-12 px-8">العودة لخطة الدراسة</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const prevStep = currentStepIndex > 0 ? allSteps[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < allSteps.length - 1 ? allSteps[currentStepIndex + 1] : null;

  const renderMedia = () => {
    // Pick the best available URL
    const videoUrl = currentStep.youtube_url || currentStep.resource_url;
    const isVideo = currentStep.resource_type === 'video' || (videoUrl && (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")));
    
    if (isVideo && videoUrl && videoUrl !== "#") {
      let videoId = "";
      if (videoUrl.includes("v=")) {
        videoId = videoUrl.split("v=")[1].split("&")[0];
      } else if (videoUrl.includes("youtu.be/")) {
        videoId = videoUrl.split("youtu.be/")[1].split("?")[0];
      } else {
        videoId = videoUrl.split("/").pop() || "";
      }
        
      return (
        <div className="aspect-video w-full rounded-3xl overflow-hidden border-4 border-background shadow-2xl mb-10 bg-black group relative">
          <iframe 
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`} 
            title="Lesson Video" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        </div>
      );
    }

    const extUrl = currentStep.external_url || currentStep.resource_url;
    if (extUrl && extUrl !== "#") {
        return (
          <div className="mb-10 p-10 bg-card rounded-3xl border-2 border-border/50 border-dashed flex flex-col items-center justify-center text-center shadow-inner">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
              <ExternalLink className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-3">مصدر تعليمي خارجي</h3>
            <p className="text-muted-foreground max-w-sm mb-8">هذا الدرس يتطلب الانتقال إلى منصة أو موقع خارجي لإكمال المحتوى.</p>
            <a href={extUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full max-w-xs">
              <Button className="w-full h-13 text-lg font-bold gap-3 shadow-xl shadow-primary/20">
                فتح المصدر الآن
                <ExternalLink className="h-5 w-5" />
              </Button>
            </a>
          </div>
        );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      {/* Dynamic top bar for learning context */}
      <div className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-20 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={slug ? `/paths/${slug}` : `/courses/${id}`} className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-all group">
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary/5 mr-2">
              <ChevronRight className="h-4 w-4" />
            </div>
            <span>العودة لـ: {path?.title_ar || course?.title_ar}</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
             <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary px-3">{path ? 'مسار تعلم' : 'كورس تدريبي'}</Badge>
             <span className="text-xs font-bold text-muted-foreground/60">درس {currentStepIndex + 1} / {allSteps.length}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-col">
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 h-8 flex items-center gap-2 font-bold text-xs ring-0">
              {currentStep.resource_type === 'video' ? <Video className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              {currentStep.resource_type === 'video' ? 'درس مرئي' : 'محتوى تعليمي'}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground/80 bg-muted/40 px-3 h-8 rounded-full border border-border/40">
              <Clock className="h-4 w-4 text-primary/60" />
              {currentStep.duration_minutes} دقيقة تقريباً
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-tight max-w-4xl">
            {currentStep.title_ar}
          </h1>
          
          {currentStep.description_ar && (
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 border-r-4 border-primary/20 pr-6 italic">
              {currentStep.description_ar}
            </p>
          )}

          {renderMedia()}

          <div className="bg-card rounded-3xl border border-border shadow-sm p-8 md:p-12 mb-12">
            <div className="max-w-none text-right">
              <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                محتوى الدرس والتفاصيل <BookOpen className="h-4 w-4" />
              </h4>
              <div className="prose prose-lg prose-slate dark:prose-invert max-w-none leading-loose">
                {currentStep.content_ar ? (
                   <div dangerouslySetInnerHTML={{ __html: currentStep.content_ar.replace(/\n/g, '<br/>') }} className="text-foreground/90 font-medium" />
                ) : (
                  <p className="text-muted-foreground italic">لا يوجد محتوى نصي إضافي لهذا الدرس.</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 mb-20 flex flex-col sm:flex-row items-stretch justify-between gap-6">
            {prevStep ? (
              <Link to={slug ? `/paths/${slug}/lesson/${prevStep.id}` : `/courses/${id}/lesson/${prevStep.id}`} className="flex-1 group">
                <div className="h-full border border-border rounded-2xl p-5 flex items-center justify-between hover:bg-card hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer">
                  <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest block mb-1">السابق</span>
                    <span className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{prevStep.title_ar}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex-1 hidden sm:block"></div>
            )}

            {nextStep ? (
              <Link to={slug ? `/paths/${slug}/lesson/${nextStep.id}` : `/courses/${id}/lesson/${nextStep.id}`} className="flex-1 group">
                <div className="h-full border border-primary/20 bg-primary/5 rounded-2xl p-5 flex items-center justify-between hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase text-primary/60 group-hover:text-primary-foreground/60 tracking-widest block mb-1">التالي</span>
                    <span className="font-bold text-foreground group-hover:text-primary-foreground transition-colors line-clamp-1">{nextStep.title_ar}</span>
                  </div>
                  <ArrowLeft className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
              </Link>
            ) : (
              <Link to={slug ? `/paths/${slug}` : `/courses/${id}`} className="flex-1 group">
                <div className="h-full bg-green-600 rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-green-500/20 hover:bg-green-700 transition-all cursor-pointer">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase text-green-100/60 tracking-widest block mb-1">النهاية</span>
                    <span className="font-bold text-white">إكمال الوحدة بنجاح</span>
                  </div>
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </Link>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonView;
