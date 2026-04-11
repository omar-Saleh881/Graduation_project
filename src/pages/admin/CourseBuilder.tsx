import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Trash2, Edit, Save, ArrowRight, Video, FileText, ChevronDown, ChevronUp, Layers, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  coursesRepo, 
  modulesRepo, 
  lessonsRepo, 
  getCourseWithStructure 
} from "@/lib/data/repository";
import { CourseModule, Lesson } from "@/types/builder";

export default function CourseBuilder() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [course, setCourse] = useState<any>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Dialog states for Lesson
  const [isLessonOpen, setIsLessonOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null); 

  // Dialog state for Module
  const [isModuleOpen, setIsModuleOpen] = useState(false);
  const [moduleTitle, setModuleTitle] = useState("");

  const loadData = () => {
    if (!id) return;
    const data = getCourseWithStructure(id);
    if (data) {
      setCourse(data);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  useEffect(() => {
    if (course?.modules?.[0] && Object.keys(expandedModules).length === 0) {
      setExpandedModules({ [course.modules[0].id]: true });
    }
  }, [course]);

  if (!course) return <div className="p-8">جاري التحميل أو الكورس غير موجود...</div>;

  const handleAddModule = () => {
    if (!moduleTitle) return;
    modulesRepo.create({
      course_id: course.id,
      title_ar: moduleTitle,
      order: course.modules.length + 1
    });
    setModuleTitle("");
    setIsModuleOpen(false);
    toast({ title: "تم إضافة الوحدة" });
    loadData();
  };

  const handleDeleteModule = (moduleId: string) => {
    if (window.confirm("حذف الوحدة سيحذف جميع الدروس بداخلها. متأكد؟")) {
      modulesRepo.delete(moduleId);
      course.modules.find((m: any) => m.id === moduleId)?.lessons.forEach((l: any) => {
        lessonsRepo.delete(l.id);
      });
      loadData();
      toast({ title: "تم الحذف" });
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const openNewLesson = (moduleId: string) => {
    setEditingLesson(null);
    setActiveModuleId(moduleId);
    setIsLessonOpen(true);
  };

  const openEditLesson = (lesson: Lesson, moduleId: string) => {
    setEditingLesson(lesson);
    setActiveModuleId(moduleId);
    setIsLessonOpen(true);
  };

  const handleSaveLesson = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const lessonData = {
      course_id: course.id,
      module_id: activeModuleId || undefined,
      title_ar: formData.get("title_ar") as string,
      description_ar: formData.get("description_ar") as string,
      resource_type: formData.get("resource_type") as any,
      resource_url: formData.get("resource_url") as string,
      youtube_url: formData.get("youtube_url") as string,
      external_url: formData.get("external_url") as string,
      duration_minutes: Number(formData.get("duration_minutes") || 0),
      content_ar: formData.get("content_ar") as string,
    };

    if (editingLesson) {
      lessonsRepo.update(editingLesson.id, lessonData);
      toast({ title: "تم تعديل الدرس" });
    } else {
      lessonsRepo.create({
        ...lessonData,
        order: lessonsRepo.getAll().filter(l => l.module_id === activeModuleId).length + 1
      });
      toast({ title: "تم إضافة الدرس" });
    }
    setIsLessonOpen(false);
    loadData();
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (window.confirm("هل أنت متأكد من حذف الدرس؟")) {
      lessonsRepo.delete(lessonId);
      loadData();
      toast({ title: "تم حذف الدرس" });
    }
  };

  const moveLesson = (lesson: Lesson, direction: 'up' | 'down', lessonsInModule: Lesson[]) => {
    const currentIndex = lessonsInModule.findIndex(l => l.id === lesson.id);
    if (direction === 'up' && currentIndex > 0) {
      const prev = lessonsInModule[currentIndex - 1];
      lessonsRepo.update(lesson.id, { order: prev.order });
      lessonsRepo.update(prev.id, { order: lesson.order });
    } else if (direction === 'down' && currentIndex < lessonsInModule.length - 1) {
      const next = lessonsInModule[currentIndex + 1];
      lessonsRepo.update(lesson.id, { order: next.order });
      lessonsRepo.update(next.id, { order: lesson.order });
    }
    loadData();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/courses">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10"><ArrowRight className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">بناء الكورس: {course.title_ar}</h1>
          <p className="text-muted-foreground">قم بتنظيم محتوى الكورس عبر إضافة وحدات ودروس.</p>
        </div>
        <Link to={`/courses/${course.id}`} className="mr-auto">
          <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5 h-10 px-5">
            <FileText className="h-4 w-4" />
            معاينة الكورس
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center bg-card/60 backdrop-blur-sm p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            هيكل الكورس
          </h2>
          <p className="text-xs text-muted-foreground mt-1">يمكنك إضافة دروس فيديو، مقالات، أو اختبارات داخل كل وحدة.</p>
        </div>
        <Dialog open={isModuleOpen} onOpenChange={setIsModuleOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-10 shadow-lg shadow-primary/20"><Plus className="h-4 w-4"/> إضافة وحدة دراسية</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>إضافة وحدة دراسية جديدة</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="font-bold">عنوان الوحدة</Label>
                <Input value={moduleTitle} onChange={e => setModuleTitle(e.target.value)} placeholder="مثال: مدخل إلى الذكاء الاصطناعي" className="h-11" />
              </div>
              <Button onClick={handleAddModule} className="w-full h-11">حفظ الوحدة</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {course.modules.length === 0 ? (
          <div className="text-center p-20 border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/20">
            <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-bold text-foreground/70">لا توجد وحدات تعليمية بعد</h3>
            <p className="mt-1">ابدأ بإضافة أول وحدة لتنظيم دروسك.</p>
          </div>
        ) : course.modules.map((module: any, mIdx: number) => (
          <Card key={module.id} className="border border-border/50 overflow-hidden rounded-2xl bg-card shadow-sm group">
            <CardHeader className="bg-muted/30 p-4 transition-colors group-hover:bg-muted/50 flex flex-row items-center justify-between cursor-pointer select-none border-b border-border/50">
              <div className="flex items-center gap-4 font-bold text-lg flex-1" onClick={() => toggleModule(module.id)}>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-sm font-black shadow-inner">
                  {mIdx + 1}
                </div>
                <div className="flex flex-col text-right">
                  <span>{module.title_ar}</span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest">{module.lessons.length} دروس</span>
                </div>
                {expandedModules[module.id] ? <ChevronUp className="h-4 w-4 text-muted-foreground mr-auto"/> : <ChevronDown className="h-4 w-4 text-muted-foreground mr-auto"/>}
              </div>
              <div className="flex items-center gap-1 mr-4">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openNewLesson(module.id); }} className="text-primary hover:bg-primary/10 gap-1.5 h-9 px-3">
                  <Plus className="h-4 w-4" />
                  <span className="text-xs">درس</span>
                </Button>
                <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleDeleteModule(module.id); }} className="text-red-500 hover:bg-red-50 h-9 w-9">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            {expandedModules[module.id] && (
              <CardContent className="p-3 bg-muted/10 space-y-2">
                {module.lessons.map((lesson: Lesson, lIdx: number) => (
                  <div key={lesson.id} className="flex bg-background border border-border/50 rounded-xl p-3 items-center justify-between group/item hover:border-primary/40 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-0.5 items-center justify-center text-muted-foreground/30 group-hover/item:text-muted-foreground transition-colors ml-1">
                        <ChevronUp className="h-4 w-4 cursor-pointer hover:text-primary" onClick={() => moveLesson(lesson, 'up', module.lessons)} />
                        <ChevronDown className="h-4 w-4 cursor-pointer hover:text-primary" onClick={() => moveLesson(lesson, 'down', module.lessons)} />
                      </div>
                      <div className="bg-muted text-muted-foreground w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                        {lIdx + 1}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm text-foreground">{lesson.title_ar}</div>
                        <div className="text-[10px] text-muted-foreground flex gap-3 mt-1 font-medium items-center">
                          <span className="flex items-center gap-1"><Video className="h-3 w-3" /> {lesson.resource_type === 'video' ? 'فيديو' : lesson.resource_type === 'article' ? 'مقال' : 'درس'}</span>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>{lesson.duration_minutes} دقيقة</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => openEditLesson(lesson, module.id)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteLesson(lesson.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
                
                {module.lessons.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center p-8 bg-background/50 rounded-xl border border-dashed">
                    لا توجد دروس في هذه الوحدة حالياً.
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={isLessonOpen} onOpenChange={setIsLessonOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md border-primary/20 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                {editingLesson ? <Edit className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              </div>
              {editingLesson ? "تعديل بيانات الدرس" : "تجهيز درس جديد"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLesson} className="space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div className="space-y-2 text-right">
                  <Label className="text-sm font-bold">العنوان (عربي)</Label>
                  <Input name="title_ar" defaultValue={editingLesson?.title_ar} required className="h-11" placeholder="أدخل عنواناً واضحاً ومعبراً..." />
                </div>
                
                <div className="space-y-2 text-right">
                  <Label className="text-sm font-bold">وصف الدرس</Label>
                  <Textarea name="description_ar" defaultValue={editingLesson?.description_ar} rows={3} placeholder="اكتب نبذة مختصرة عما سيتعلمه الطالب في هذا الدرس..." className="resize-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label className="text-sm font-bold">المدة (بالدقائق)</Label>
                    <Input name="duration_minutes" type="number" defaultValue={editingLesson?.duration_minutes || 0} className="h-11" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="text-sm font-bold">نوع المحتوى</Label>
                    <select name="resource_type" defaultValue={editingLesson?.resource_type || "video"} className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary outline-none">
                      <option value="video">فيديو (تعليمي)</option>
                      <option value="article">مقال / قراءة</option>
                      <option value="lesson">درس نصي</option>
                      <option value="quiz">اختبار / تقييم</option>
                      <option value="exercise">تمرين عملي</option>
                      <option value="external">رابط خارجي</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-5 border-r pr-6 border-border/50">
                <div className="space-y-2 p-4 rounded-xl bg-red-500/5 border border-red-500/10 text-right">
                  <Label className="text-sm font-bold text-red-600 flex items-center justify-end gap-2">
                     رابط YouTube <Video className="h-4 w-4" />
                  </Label>
                  <Input name="youtube_url" defaultValue={editingLesson?.youtube_url} placeholder="https://www.youtube.com/watch?v=..." className="h-10 bg-background text-left ltr" dir="ltr" />
                  <p className="text-[10px] text-muted-foreground mt-1 italic">مثال: youtube.com/watch?v=XXXXX</p>
                </div>

                <div className="space-y-2 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 text-right">
                  <Label className="text-sm font-bold text-blue-600 flex items-center justify-end gap-2">
                     رابط خارجي / مصدر <ExternalLink className="h-4 w-4" />
                  </Label>
                  <Input name="external_url" defaultValue={editingLesson?.external_url} placeholder="https://example.com/source" className="h-10 bg-background text-left ltr" dir="ltr" />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="text-sm font-bold">الرابط المرجعي (Legacy)</Label>
                  <Input name="resource_url" defaultValue={editingLesson?.resource_url || ""} placeholder="رابط بديل في حال الحاجة" className="h-10 text-left ltr" dir="ltr" />
                </div>
              </div>

              <div className="col-span-full space-y-2 mt-4 text-right">
                <Label className="text-sm font-bold">المحتوى التعليمي / ملاحظات المدرس</Label>
                <Textarea name="content_ar" defaultValue={editingLesson?.content_ar} rows={6} placeholder="اكتب الشرح التفصيلي للدرس..." className="font-sans leading-relaxed text-sm bg-muted/20" />
              </div>
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsLessonOpen(false)} className="h-11 px-8">إلغاء</Button>
              <Button type="submit" className="h-11 px-12 shadow-lg shadow-primary/20 gap-2">
                <Save className="h-4 w-4" /> حفظ كل التغييرات
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
