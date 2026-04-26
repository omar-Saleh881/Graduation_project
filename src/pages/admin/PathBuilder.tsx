import { useState, useEffect } from "react";
// Image flow fix test
import { useParams, Link } from "react-router-dom";
import { 
  Plus, Trash2, Edit, Save, ArrowRight, BookOpen, Layers, 
  ArrowUp, ArrowDown, ExternalLink, FileText, Wrench, Video,
  Upload, FileUp, X, Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  pathsRepo, pathStagesRepo, pathStageItemsRepo, 
  coursesRepo, lessonsRepo, articlesRepo, toolsRepo 
} from "@/lib/data/repository";
import { PathStage, PathStageItem, QuizQuestion, Course, Lesson } from "@/types/builder";
import { Article, ArticleBlock, ArticleBlockType } from "@/types/article";
import { Tool } from "@/types/tool";

const PathBuilder = () => {
  const { slug, sectionId } = useParams<{ slug: string, sectionId?: string }>();
  const { toast } = useToast();
  
  const [path, setPath] = useState<any>(null);
  const [pathId, setPathId] = useState("");
  const [stages, setStages] = useState<(PathStage & { items: PathStageItem[] })[]>([]);
  
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PathStage | null>(null);
  const [stageForm, setStageForm] = useState({ title_ar: "", description_ar: "" });
  
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [activeStageId, setActiveStageId] = useState("");
  const [editingItem, setEditingItem] = useState<PathStageItem | null>(null);
  const [itemType, setItemType] = useState<PathStageItem['item_type']>('lesson');
  const [selectedRef, setSelectedRef] = useState('');
  
  const [itemForm, setItemForm] = useState({
    title_override: "",
    description_override: "",
    duration_minutes: 0,
    notes: "",
    url: "",
    youtube_url: "",
    content_ar: "",
    document_url: "",
    document_label: "",
    cover_image: "",
    quiz: {
      title: "",
      description: "",
      passing_score: 80,
      duration_minutes: 10,
      attempts: 1,
      questions: [] as QuizQuestion[]
    },
    // New Lesson Fields
    source_mode: 'youtube' as 'youtube' | 'external' | 'upload',
    learner_instructions: "",
    lesson_goals: "",
    prerequisites: "",
    thumbnail: "",
    video_upload_placeholder: "",
    pdf_upload_placeholder: "",
    is_published: true,
    // New Article Fields
    article_blocks: [] as ArticleBlock[],
    article_goal: "",
    read_time_minutes: 5,
    article_source: 'new' as 'new' | 'link',
    article_style: 'simple' as 'simple' | 'blocks',
  });

  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);

  const loadData = () => {
    if (!slug) return;
    
    const allPaths = pathsRepo.getAll();
    const targetPath = allPaths.find(p => p.id === slug || p.slug === slug);
    if (!targetPath) return;

    setPathId(targetPath.id);
    setPath(targetPath);

    const allStages = pathStagesRepo.getAll()
      .filter(s => s.path_id === targetPath.id)
      .sort((a, b) => a.order - b.order);
      
    const allItems = pathStageItemsRepo.getAll();

    const populatedStages = allStages.map(s => ({
      ...s,
      items: allItems.filter(i => i.stage_id === s.id).sort((a, b) => a.order - b.order)
    }));

    setStages(populatedStages);
    setAvailableCourses(coursesRepo.getAll());
    setAvailableLessons(lessonsRepo.getAll());
    setAvailableArticles(articlesRepo.getAll());
    setAvailableTools(toolsRepo.getAll());
  };

  useEffect(() => { loadData(); }, [slug]);

  if (!path) return <div className="p-8 text-center">جاري التحميل...</div>;

  const handleSaveStage = () => {
    if (!stageForm.title_ar) return;
    
    if (editingStage) {
      pathStagesRepo.update(editingStage.id, {
        title_ar: stageForm.title_ar,
        description_ar: stageForm.description_ar
      });
      toast({ title: "تم تحديث المرحلة" });
    } else {
      pathStagesRepo.create({
        path_id: pathId,
        title_ar: stageForm.title_ar,
        description_ar: stageForm.description_ar,
        order: stages.length + 1
      });
      toast({ title: "تم إضافة المرحلة" });
    }
    
    setStageForm({ title_ar: "", description_ar: "" });
    setEditingStage(null);
    setIsStageOpen(false);
    loadData();
  };

  const handleEditStage = (stage: PathStage) => {
    setEditingStage(stage);
    setStageForm({ title_ar: stage.title_ar, description_ar: stage.description_ar || "" });
    setIsStageOpen(true);
  };

  const handleSaveItem = () => {
    if (!pathId || !activeStageId) return;

    const isStandaloneType = ['lesson', 'article', 'quiz'].includes(itemType);

    // Validation
    if (!selectedRef && !isStandaloneType && itemType !== 'article') {
      toast({ title: "يرجى اختيار عنصر لربطه", variant: "destructive" });
      return;
    }

    if (itemType === 'article' && itemForm.article_source === 'link' && !selectedRef) {
       toast({ title: "برجاء اختيار مقال للربط", variant: "destructive" });
       return;
    }
    
    let finalRefId = selectedRef;

    // Handle Lesson/Article Creation if it's a new standalone item
    if ((itemType === 'lesson' || itemType === 'article') && !selectedRef && !editingItem) {
      if (itemType === 'lesson') {
        const newLesson = lessonsRepo.create({
          title_ar: itemForm.title_override || "درس بدون عنوان",
          description_ar: itemForm.description_override || "",
          duration_minutes: itemForm.duration_minutes || 0,
          resource_type: "lesson",
          resource_url: itemForm.url || "#",
          youtube_url: itemForm.youtube_url || "",
          content_ar: itemForm.content_ar || "",
          document_url: itemForm.document_url || "",
          document_label: itemForm.document_label || "",
          cover_image: itemForm.cover_image || "",
          thumbnail: itemForm.thumbnail || "",
          learner_instructions: itemForm.learner_instructions || "",
          lesson_goals: itemForm.lesson_goals || "",
          prerequisites: itemForm.prerequisites || "",
          is_published: itemForm.is_published,
          video_upload_placeholder: itemForm.video_upload_placeholder,
          pdf_upload_placeholder: itemForm.pdf_upload_placeholder,
          order: lessonsRepo.getAll().length + 1
        } as any);
        finalRefId = newLesson.id;
      } else {
        const newArticle = articlesRepo.create({
          title_ar: itemForm.title_override || "مقال بدون عنوان",
          excerpt_ar: itemForm.description_override || "",
          article_goal: itemForm.article_goal,
          learner_notes: itemForm.notes,
          read_time_minutes: itemForm.read_time_minutes,
          blocks: itemForm.article_style === 'blocks' ? itemForm.article_blocks : [],
          content_ar: itemForm.article_style === 'simple' ? itemForm.content_ar : "",
          is_published: itemForm.is_published,
          created_at: new Date().toISOString()
        } as any);
        finalRefId = newArticle.id;
      }
    } else if (editingItem && editingItem.reference_id) {
       if (itemType === 'lesson') {
          lessonsRepo.update(editingItem.reference_id, {
            title_ar: itemForm.title_override,
            description_ar: itemForm.description_override,
            duration_minutes: itemForm.duration_minutes,
            resource_url: itemForm.url,
            youtube_url: itemForm.youtube_url,
            content_ar: itemForm.content_ar,
            document_url: itemForm.document_url,
            document_label: itemForm.document_label,
            cover_image: itemForm.cover_image,
            thumbnail: itemForm.thumbnail,
            learner_instructions: itemForm.learner_instructions,
            lesson_goals: itemForm.lesson_goals,
            prerequisites: itemForm.prerequisites,
            is_published: itemForm.is_published,
            video_upload_placeholder: itemForm.video_upload_placeholder,
            pdf_upload_placeholder: itemForm.pdf_upload_placeholder,
          });
       } else if (itemType === 'article') {
          articlesRepo.update(editingItem.reference_id, {
            title_ar: itemForm.title_override,
            excerpt_ar: itemForm.description_override,
            article_goal: itemForm.article_goal,
            learner_notes: itemForm.notes,
            read_time_minutes: itemForm.read_time_minutes,
            blocks: itemForm.article_style === 'blocks' ? itemForm.article_blocks : [],
            content_ar: itemForm.article_style === 'simple' ? itemForm.content_ar : "",
            is_published: itemForm.is_published,
          });
       }
    }

    const itemData: Omit<PathStageItem, 'id' | 'order'> = {
      stage_id: activeStageId,
      item_type: itemType,
      reference_id: finalRefId,
      title_override: itemForm.title_override,
      description_override: itemForm.description_override,
      duration_minutes: itemForm.duration_minutes,
      notes: itemForm.notes,
      url: itemForm.url,
      youtube_url: itemForm.youtube_url,
      content_ar: itemForm.content_ar,
      document_url: itemForm.document_url,
      document_label: itemForm.document_label,
      cover_image: itemForm.cover_image,
      thumbnail: itemForm.thumbnail,
      learner_instructions: itemForm.learner_instructions,
      lesson_goals: itemForm.lesson_goals,
      prerequisites: itemForm.prerequisites,
      is_published: itemForm.is_published,
      video_upload_placeholder: itemForm.video_upload_placeholder,
      pdf_upload_placeholder: itemForm.pdf_upload_placeholder,
      article_blocks: itemForm.article_style === 'blocks' ? itemForm.article_blocks : [],
      article_goal: itemForm.article_goal,
      read_time_minutes: itemForm.read_time_minutes,
      quiz: itemType === 'quiz' ? itemForm.quiz : undefined
    };

    if (editingItem) {
      pathStageItemsRepo.update(editingItem.id, itemData);
      toast({ title: "تم تحديث العنصر" });
    } else {
      const stageItems = stages.find(s => s.id === activeStageId)?.items || [];
      pathStageItemsRepo.create({
        ...itemData,
        order: stageItems.length + 1
      } as any);
      toast({ title: "تم إضافة العنصر للمرحلة" });
    }
    
    setIsItemOpen(false);
    resetItemForm();
    loadData();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'video') {
      setItemForm(prev => ({
        ...prev,
        video_upload_placeholder: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
      }));
    } else {
      setItemForm(prev => ({
        ...prev,
        pdf_upload_placeholder: `${file.name} (${(file.size / 1024).toFixed(1)} KB)`
      }));
    }
  };

  const handleAddBlock = (type: ArticleBlockType) => {
    const newBlock: ArticleBlock = {
      id: crypto.randomUUID(),
      type: type,
      content: "",
    };
    setItemForm(prev => ({
      ...prev,
      article_blocks: [...prev.article_blocks, newBlock]
    }));
  };

  const handleUpdateBlock = (id: string, updates: Partial<ArticleBlock>) => {
    setItemForm(prev => ({
      ...prev,
      article_blocks: prev.article_blocks.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  };

  const handleRemoveBlock = (id: string) => {
    setItemForm(prev => ({
      ...prev,
      article_blocks: prev.article_blocks.filter(b => b.id !== id)
    }));
  };

  const handleMoveBlock = (id: string, direction: 'up' | 'down') => {
    const blocks = [...itemForm.article_blocks];
    const index = blocks.findIndex(b => b.id === id);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    [blocks[index], blocks[targetIndex]] = [blocks[targetIndex], blocks[index]];
    setItemForm(prev => ({ ...prev, article_blocks: blocks }));
  };

  const handleBlockFileChange = (e: React.ChangeEvent<HTMLInputElement>, blockId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    handleUpdateBlock(blockId, {
      image_url: url,
      media_url: url,
      file_name_placeholder: `${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`
    });
  };

  const resetItemForm = () => {
    setEditingItem(null);
    setSelectedRef("");
    setItemForm({
      title_override: "",
      description_override: "",
      duration_minutes: 0,
      notes: "",
      url: "",
      youtube_url: "",
      content_ar: "",
      document_url: "",
      document_label: "",
      cover_image: "",
      quiz: {
        title: "",
        description: "",
        passing_score: 80,
        duration_minutes: 10,
        attempts: 1,
        questions: []
      },
      source_mode: 'youtube',
      learner_instructions: "",
      lesson_goals: "",
      prerequisites: "",
      thumbnail: "",
      video_upload_placeholder: "",
      pdf_upload_placeholder: "",
      is_published: true,
      article_blocks: [],
      article_goal: "",
      read_time_minutes: 5,
      article_source: 'new',
      article_style: 'simple',
    });
  };

  const handleEditItem = (item: PathStageItem, stageId: string) => {
    setEditingItem(item);
    setActiveStageId(stageId);
    setItemType(item.item_type);
    setSelectedRef(item.reference_id || "");
    
    let lessonData: Partial<Lesson> = {};
    if (item.item_type === 'lesson' && item.reference_id) {
      lessonData = lessonsRepo.getById(item.reference_id) || {};
    }

    let articleData: Partial<Article> = {};
    if (item.item_type === 'article' && item.reference_id) {
      articleData = articlesRepo.getById(item.reference_id) || {};
    }

    setItemForm({
      title_override: item.title_override || lessonData.title_ar || articleData.title_ar || "",
      description_override: item.description_override || lessonData.description_ar || articleData.excerpt_ar || "",
      duration_minutes: item.duration_minutes || lessonData.duration_minutes || 0,
      notes: item.notes || articleData.learner_notes || "",
      url: item.url || lessonData.resource_url || "",
      youtube_url: item.youtube_url || lessonData.youtube_url || "",
      content_ar: item.content_ar || lessonData.content_ar || articleData.content_ar || "",
      document_url: item.document_url || lessonData.document_url || "",
      document_label: item.document_label || lessonData.document_label || "",
      cover_image: item.cover_image || lessonData.cover_image || "",
      quiz: item.quiz || {
        title: "",
        description: "",
        passing_score: 80,
        duration_minutes: 10,
        attempts: 1,
        questions: []
      },
      source_mode: (lessonData.youtube_url || item.youtube_url) ? 'youtube' : (lessonData.video_upload_placeholder || item.video_upload_placeholder ? 'upload' : 'external'),
      learner_instructions: item.learner_instructions || lessonData.learner_instructions || "",
      lesson_goals: item.lesson_goals || lessonData.lesson_goals || "",
      prerequisites: item.prerequisites || lessonData.prerequisites || "",
      thumbnail: item.thumbnail || lessonData.thumbnail || "",
      video_upload_placeholder: item.video_upload_placeholder || lessonData.video_upload_placeholder || "",
      pdf_upload_placeholder: item.pdf_upload_placeholder || lessonData.pdf_upload_placeholder || "",
      is_published: item.is_published !== undefined ? item.is_published : (lessonData.is_published !== undefined ? lessonData.is_published : (articleData.is_published !== undefined ? articleData.is_published : true)),
      article_blocks: item.article_blocks || articleData.blocks || [],
      article_goal: item.article_goal || articleData.article_goal || "",
      read_time_minutes: item.read_time_minutes || articleData.read_time_minutes || 5,
      article_source: (item.reference_id || selectedRef) ? 'link' : 'new',
      article_style: (item.article_blocks && item.article_blocks.length > 0) || (articleData.blocks && articleData.blocks.length > 0) ? 'blocks' : 'simple',
    });
    setIsItemOpen(true);
  };

  const handleMoveStage = (stageId: string, direction: 'up' | 'down') => {
    const index = stages.findIndex(s => s.id === stageId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const currentStage = stages[index];
    const targetStage = stages[targetIndex];
    
    pathStagesRepo.update(currentStage.id, { order: targetStage.order });
    pathStagesRepo.update(targetStage.id, { order: currentStage.order });
    loadData();
  };

  const handleMoveItem = (itemId: string, direction: 'up' | 'down') => {
    const allItems = pathStageItemsRepo.getAll();
    const item = allItems.find(i => i.id === itemId);
    if (!item) return;
    
    const stageItems = allItems
      .filter(i => i.stage_id === item.stage_id)
      .sort((a,b) => a.order - b.order);
      
    const index = stageItems.findIndex(i => i.id === itemId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stageItems.length) return;

    const currentItem = stageItems[index];
    const targetItem = stageItems[targetIndex];
    
    pathStageItemsRepo.update(currentItem.id, { order: targetItem.order });
    pathStageItemsRepo.update(targetItem.id, { order: currentItem.order });
    loadData();
  };

  const handleDeleteItem = (itemId: string) => {
    if(window.confirm("حذف العنصر؟")) {
      pathStageItemsRepo.delete(itemId);
      loadData();
    }
  };
  
  const handleDeleteStage = (stageId: string) => {
    if(window.confirm("حذف المرحلة سيزيل العناصر المرتبطة بها. متأكد؟")){
       pathStagesRepo.delete(stageId);
       stages.find(s => s.id === stageId)?.items.forEach(i => pathStageItemsRepo.delete(i.id));
       loadData();
    }
  }

  const getReferenceTitle = (item: PathStageItem) => {
    if (item.title_override) return item.title_override;
    
    switch(item.item_type) {
      case 'course': return availableCourses.find(c => c.id === item.reference_id)?.title_ar || "كورس محذوف";
      case 'lesson': return availableLessons.find(l => l.id === item.reference_id)?.title_ar || "درس محذوف";
      case 'article': return availableArticles.find(a => a.id === item.reference_id)?.title_ar || "مقال محذوف";
      case 'tool': return availableTools.find(t => t.id === item.reference_id)?.name || "أداة محذوفة";
      case 'external': return item.url || "رابط خارجي";
      case 'quiz': return item.quiz?.title || "اختبار تقييمي";
      case 'video': return "فيديو محتوى";
      case 'document': return "مستند PDF";
      default: return "عنصر غير معروف";
    }
  };

  const getReferenceIcon = (type: PathStageItem['item_type']) => {
    switch(type) {
      case 'course': return <Layers className="h-4 w-4"/>;
      case 'lesson': return <BookOpen className="h-4 w-4" />;
      case 'article': return <FileText className="h-4 w-4" />;
      case 'tool': return <Wrench className="h-4 w-4" />;
      case 'external': return <ExternalLink className="h-4 w-4" />;
      case 'quiz': return <Edit className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'document': return <FileText className="h-4 w-4" />;
      default: return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to={sectionId ? `/admin/sections/${sectionId}/manage-paths` : "/admin/paths"}>
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10"><ArrowRight className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">بناء المسار: {path.title_ar}</h1>
          <p className="text-muted-foreground italic">تخطيط رحلة تعلم متكاملة مبنية على مراحل.</p>
        </div>
        <Link to={`/paths/${path.slug}`} className="mr-auto" target="_blank">
          <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5 h-10 px-5">
            <BookOpen className="h-4 w-4" />
            معاينة المسار
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center bg-card/60 backdrop-blur-sm p-5 rounded-2xl border border-border shadow-sm">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            مراحل الطريق (Stages)
          </h2>
          <p className="text-xs text-muted-foreground mt-1">المحطات التي سيمر بها المتعلم في هذا المسار.</p>
        </div>
        <Button className="gap-2 h-10 shadow-lg shadow-primary/20" onClick={() => { setEditingStage(null); setStageForm({ title_ar: "", description_ar: "" }); setIsStageOpen(true); }}>
          <Plus className="h-4 w-4"/> إضافة مرحلة محورية
        </Button>
      </div>

      <div className="space-y-6">
        {stages.length === 0 && (
           <div className="text-center p-20 border-2 border-dashed rounded-3xl text-muted-foreground bg-muted/20">
             <Layers className="h-12 w-12 mx-auto mb-4 opacity-20" />
             <h3 className="text-lg font-bold text-foreground/70">المسار لا يمتلك أي محطات بعد</h3>
             <p className="mt-1">ابدأ بتقسيم المسار إلى مراحل تعليمية واضحة.</p>
           </div>
        )}
        
        {stages.map((stage, sIdx) => (
          <Card key={stage.id} className="border border-border/50 bg-card overflow-hidden rounded-2xl shadow-sm">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-border/50 bg-muted/30">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center text-sm font-black shadow-lg shadow-primary/10">
                  {sIdx + 1}
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-lg leading-none">{stage.title_ar}</h3>
                  {stage.description_ar && <p className="text-xs text-muted-foreground mt-1.5">{stage.description_ar}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex flex-col gap-0.5 ml-2">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveStage(stage.id, 'up')} disabled={sIdx === 0}><ArrowUp className="h-3 w-3"/></Button>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleMoveStage(stage.id, 'down')} disabled={sIdx === stages.length - 1}><ArrowDown className="h-3 w-3"/></Button>
                </div>
                <Button variant="outline" size="sm" className="gap-1.5 border-primary/20 text-primary hover:bg-primary/10 h-9 px-3" onClick={() => { setActiveStageId(stage.id); resetItemForm(); setItemType('lesson'); setIsItemOpen(true); }}>
                  <Plus className="h-4 w-4"/> إضافة محتوى
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleEditStage(stage)} className="text-blue-500 hover:bg-blue-50 h-9 w-9"><Edit className="h-4 w-4"/></Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteStage(stage.id)} className="text-red-500 hover:bg-red-50 h-9 w-9"><Trash2 className="h-4 w-4"/></Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-3 bg-muted/5">
              {stage.items.length === 0 && <div className="text-xs text-muted-foreground italic p-4 text-center bg-background/50 rounded-xl border border-dashed">لا توجد محتويات مرتبطة بهذه المرحلة حالياً.</div>}
              {stage.items.map((item, idx) => (
                <div key={item.id} className="flex bg-background border border-border/60 rounded-xl p-3 items-center justify-between group hover:border-primary/40 transition-all shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="bg-muted text-muted-foreground w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black group-hover:bg-primary/10 group-hover:text-primary transition-colors">{idx + 1}</div>
                    <div className="p-2 rounded-lg bg-primary/5 text-primary border border-primary/10">
                      {getReferenceIcon(item.item_type)}
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-sm text-foreground">{getReferenceTitle(item)}</div>
                      <div className="text-[10px] text-muted-foreground mt-1 flex gap-2 font-medium">
                        <span className="uppercase">{item.item_type}</span>
                        {item.duration_minutes ? <span>• {item.duration_minutes} دقيقة</span> : null}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col gap-0.5 ml-2">
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleMoveItem(item.id, 'up')} disabled={idx === 0}><ArrowUp className="h-3 w-3"/></Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleMoveItem(item.id, 'down')} disabled={idx === stage.items.length - 1}><ArrowDown className="h-3 w-3"/></Button>
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500" onClick={() => handleEditItem(item, stage.id)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => handleDeleteItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stage Dialog */}
      <Dialog open={isStageOpen} onOpenChange={setIsStageOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingStage ? "تحديث المرحلة" : "إضافة مرحلة جديدة"}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4 text-right">
            <div className="space-y-2">
              <Label className="font-bold">عنوان المرحلة</Label>
              <Input value={stageForm.title_ar} onChange={e => setStageForm({...stageForm, title_ar: e.target.value})} placeholder="مثال: الأساسيات المطلقة" className="h-11" />
            </div>
            <div className="space-y-2">
              <Label className="font-bold">وصف المرحلة (اختياري)</Label>
              <Input value={stageForm.description_ar} onChange={e => setStageForm({...stageForm, description_ar: e.target.value})} className="h-11" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveStage} className="h-11 px-10 w-full">حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Content Item Dialog */}
      <Dialog open={isItemOpen} onOpenChange={setIsItemOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-background shadow-2xl p-0">
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b p-4 flex items-center justify-between">
            <DialogTitle className="text-xl font-black">
              {editingItem ? "تعديل المحتوى" : "إضافة محتوى ذكي"} <span className="text-primary text-sm font-medium mr-2 bg-primary/10 px-2 py-0.5 rounded-full">{itemType}</span>
            </DialogTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-border" onClick={() => setIsItemOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-6 space-y-8 max-w-2xl mx-auto w-full text-right">
            {/* Header: Content Type Selection */}
            <div className="space-y-3">
              <Label className="font-bold text-muted-foreground text-xs uppercase tracking-wider">نوع الوسيلة التعليمية</Label>
              <div className="grid grid-cols-4 gap-2">
                {(['lesson', 'article', 'tool', 'quiz'] as const).map((type) => (
                  <Button key={type} variant={itemType === type ? 'default' : 'outline'} onClick={() => setItemType(type)} size="sm" className="h-10 text-xs px-1 rounded-xl transition-all">
                    {type === 'lesson' ? 'درس' : type === 'article' ? 'مقال' : type === 'tool' ? 'أداة' : 'اختبار'}
                  </Button>
                ))}
              </div>
            </div>

            <Separator className="opacity-50" />

            {/* Body: Vertical Stack */}
            <div className="space-y-10">
              
              {/* Context Section (Linking or New) */}
              {itemType === 'article' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex gap-2 p-1 bg-muted rounded-xl">
                    <Button variant={itemForm.article_source === 'new' ? 'secondary' : 'ghost'} className="flex-1 rounded-lg h-9 text-xs" onClick={() => setItemForm({...itemForm, article_source: 'new'})}>إنشاء مقال جديد</Button>
                    <Button variant={itemForm.article_source === 'link' ? 'secondary' : 'ghost'} className="flex-1 rounded-lg h-9 text-xs" onClick={() => setItemForm({...itemForm, article_source: 'link'})}>ربط مقال موجود</Button>
                  </div>

                  {itemForm.article_source === 'link' && (
                    <div className="p-4 bg-secondary/10 rounded-xl border border-secondary/20 space-y-2 animate-in zoom-in-95 duration-200">
                       <Label className="text-xs font-bold">ابحث عن المقال</Label>
                       <select dir="rtl" className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm" value={selectedRef} onChange={(e) => setSelectedRef(e.target.value)}>
                         <option value="">-- اختر المقال من القائمة --</option>
                         {availableArticles.map(a => <option key={a.id} value={a.id}>{a.title_ar}</option>)}
                       </select>
                    </div>
                  )}
                </div>
              )}

              {itemType === 'tool' && (
                <div className="space-y-2 animate-in fade-in duration-300">
                  <Label className="font-bold">اختر العنصر الموجود لربطه</Label>
                  <select dir="rtl" className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary outline-none" value={selectedRef} onChange={(e) => setSelectedRef(e.target.value)}>
                    <option value="">-- اختر من القائمة --</option>
                    {availableTools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {/* Basic Meta Info (Title, Duration) */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="font-bold text-sm">العنوان {itemType === 'tool' ? '(تسمية مخصصة - اختيارية)' : ''}</Label>
                  <Input className="h-11 rounded-xl" value={itemForm.title_override} onChange={e => setItemForm({...itemForm, title_override: e.target.value})} placeholder="اكتب العنوان هنا..." />
                </div>
                
                {itemType === 'article' && (
                    <div className="grid grid-cols-1 gap-6">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2 text-right">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">وقت القراءة (دقائق)</Label>
                            <Input className="h-11 rounded-xl" type="number" value={itemForm.read_time_minutes} onChange={e => setItemForm({...itemForm, read_time_minutes: parseInt(e.target.value) || 0})} />
                          </div>
                          <div className="space-y-2 text-right">
                            <Label className="font-bold text-xs uppercase text-muted-foreground">حالة النشر</Label>
                            <select className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm" value={itemForm.is_published ? "true" : "false"} onChange={e => setItemForm({...itemForm, is_published: e.target.value === "true"})}>
                              <option value="true">منشور</option>
                              <option value="false">مسودة</option>
                            </select>
                          </div>
                       </div>

                       <div className="space-y-3">
                          <Label className="font-bold flex justify-end">صورة غلاف المقال</Label>
                          <div className="aspect-video rounded-2xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden group relative">
                             {itemForm.cover_image ? (
                               <>
                                 <img 
                                   src={itemForm.cover_image} 
                                   alt="Cover Preview" 
                                   className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                   onError={(e) => {
                                     (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                                   }}
                                 />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button variant="secondary" size="sm" onClick={() => (document.getElementById('article-cover-picker') as HTMLInputElement)?.click()} className="h-8 gap-1">
                                       <ImageIcon className="h-3 w-3" /> تغيير
                                    </Button>
                                    <Button variant="destructive" size="sm" onClick={() => setItemForm({...itemForm, cover_image: ""})} className="h-8 gap-1">
                                       <Trash2 className="h-3 w-3" /> حذف
                                    </Button>
                                 </div>
                               </>
                             ) : (
                               <div className="flex flex-col items-center text-muted-foreground/40 cursor-pointer w-full h-full justify-center hover:bg-muted/50 transition-colors" onClick={() => (document.getElementById('article-cover-picker') as HTMLInputElement)?.click()}>
                                 <ImageIcon className="h-10 w-10 mb-2" />
                                 <span className="text-[10px] font-bold uppercase">اضغط لرفع غلاف أو ضع رابطاً</span>
                               </div>
                             )}
                          </div>
                          <div className="flex gap-2">
                             <Input 
                               value={itemForm.cover_image} 
                               onChange={e => setItemForm({...itemForm, cover_image: e.target.value})} 
                               placeholder="رابط الصورة (URL) هنا..." 
                               className="text-left ltr flex-1" 
                               dir="ltr" 
                             />
                             <Button variant="outline" size="icon" className="shrink-0 h-11 w-11" onClick={() => (document.getElementById('article-cover-picker') as HTMLInputElement)?.click()}>
                               <Plus className="h-4 w-4" />
                             </Button>
                             <input 
                               type="file" 
                               id="article-cover-picker" 
                               className="hidden" 
                               accept="image/*" 
                               onChange={(e) => {
                                 const file = e.target.files?.[0];
                                 if (file) {
                                   const url = URL.createObjectURL(file);
                                   setItemForm({...itemForm, cover_image: url});
                                 }
                               }}
                             />
                          </div>
                       </div>
                    </div>
                )}

                {itemType !== 'lesson' && itemType !== 'article' && itemType !== 'quiz' && (
                  <div className="space-y-2">
                    <Label className="font-bold">المدة المتوقعة (بالدقائق)</Label>
                    <Input className="h-11 rounded-xl" type="number" value={itemForm.duration_minutes} onChange={e => setItemForm({...itemForm, duration_minutes: parseInt(e.target.value) || 0})} />
                  </div>
                )}
              </div>

              {/* Item Specific Content Sections */}
              <div className="space-y-8 pb-10">
                {itemType === 'article' && itemForm.article_source === 'new' && (
                   <div className="space-y-8 border-t pt-8">
                      <div className="space-y-2">
                        <Label className="font-bold">الهدف من المقال</Label>
                        <textarea className="w-full h-20 p-3 rounded-xl border bg-muted/5 text-sm" value={itemForm.article_goal} onChange={e => setItemForm({...itemForm, article_goal: e.target.value})} placeholder="ماذا سيستفيد المتعلم؟" />
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                           <Label className="font-black text-lg">محتوى المقال</Label>
                           <div className="flex gap-1 p-1 bg-muted rounded-lg">
                              <Button variant={itemForm.article_style === 'simple' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-[10px] rounded" onClick={() => setItemForm({...itemForm, article_style: 'simple'})}>نص بسيط</Button>
                              <Button variant={itemForm.article_style === 'blocks' ? 'secondary' : 'ghost'} size="sm" className="h-7 text-[10px] rounded" onClick={() => setItemForm({...itemForm, article_style: 'blocks'})}>مبني على الكتل</Button>
                           </div>
                        </div>

                        {itemForm.article_style === 'simple' ? (
                          <div className="space-y-2 animate-in fade-in duration-300">
                             <textarea 
                               className="w-full h-80 p-4 rounded-xl border border-input bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none leading-relaxed"
                               value={itemForm.content_ar}
                               onChange={(e) => setItemForm({...itemForm, content_ar: e.target.value})}
                               placeholder="اكتب المقال بالكامل هنا..."
                             />
                          </div>
                        ) : (
                          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                             <div className="flex flex-wrap gap-2 justify-center pb-4 border-b">
                                {(['text', 'image', 'media', 'note', 'separator'] as ArticleBlockType[]).map(type => (
                                  <Button key={type} size="sm" variant="outline" className="h-9 px-4 rounded-full text-[11px] gap-2 border-primary/20 hover:bg-primary/5" onClick={() => handleAddBlock(type)}>
                                     <Plus className="h-3.5 w-3.5" />
                                     {type === 'text' ? 'إضافة نص' : type === 'image' ? 'إضافة صورة' : type === 'media' ? 'إضافة وسيط' : type === 'note' ? 'إضافة تنبيه' : 'إضافة فاصل'}
                                  </Button>
                                ))}
                             </div>
                             
                             <div className="space-y-4">
                                {itemForm.article_blocks.length === 0 && (
                                  <div className="text-center py-20 bg-muted/20 border-2 border-dashed rounded-3xl text-muted-foreground text-xs italic">
                                     المقال لا يحتوي على كتل بعد. استخدم الأزرار أعلاه للبدء.
                                  </div>
                                )}
                                {itemForm.article_blocks.map((block, bIdx) => (
                                   <div key={block.id} className="group relative border rounded-2xl bg-card p-5 hover:border-primary/30 transition-all shadow-sm">
                                      {/* Block Actions */}
                                      <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-3 group-hover:translate-x-0 duration-200">
                                         <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-md" onClick={() => handleMoveBlock(block.id, 'up')} disabled={bIdx === 0}><ArrowUp className="h-3.5 w-3.5" /></Button>
                                         <Button variant="secondary" size="icon" className="h-7 w-7 rounded-full shadow-md" onClick={() => handleMoveBlock(block.id, 'down')} disabled={bIdx === itemForm.article_blocks.length - 1}><ArrowDown className="h-3.5 w-3.5" /></Button>
                                         <Button variant="destructive" size="icon" className="h-7 w-7 rounded-full shadow-md" onClick={() => handleRemoveBlock(block.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                                      </div>

                                      <div className="flex items-center gap-2 mb-4">
                                         <div className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[9px] font-black uppercase">{block.type}</div>
                                         <div className="h-[1px] flex-1 bg-border/40" />
                                      </div>

                                      {block.type === 'text' && (
                                         <textarea className="w-full min-h-[100px] bg-transparent border-none focus:ring-0 p-0 text-sm leading-relaxed" value={block.content} onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })} placeholder="اكتب هنا..." />
                                      )}
                                      
                                      {block.type === 'note' && (
                                         <div className="flex gap-4 bg-primary/5 p-4 rounded-xl border-r-4 border-primary">
                                            <textarea className="w-full bg-transparent border-none focus:ring-0 p-0 text-sm italic" value={block.content} onChange={(e) => handleUpdateBlock(block.id, { content: e.target.value })} placeholder="ملاحظة هامة..." />
                                         </div>
                                      )}

                                      {block.type === 'image' && (
                                         <div className="space-y-4">
                                            
                                               
                                             <div className="aspect-video rounded-xl bg-muted border overflow-hidden group relative">
                                                {block.image_url ? (
                                                  <>
                                                    <img 
                                                      src={block.image_url} 
                                                      alt="Block Preview" 
                                                      className="w-full h-full object-cover" 
                                                      onError={(e) => {
                                                        (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                                                      }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                       <Button variant="secondary" size="sm" onClick={() => (document.getElementById(`file-${block.id}`) as HTMLInputElement)?.click()} className="h-7 text-[10px] gap-1 px-3">
                                                          تغيير
                                                       </Button>
                                                       <Button variant="destructive" size="sm" onClick={() => handleUpdateBlock(block.id, { image_url: "", file_name_placeholder: "" })} className="h-7 text-[10px] gap-1 px-3">
                                                          حذف
                                                       </Button>
                                                    </div>
                                                  </>
                                                ) : (
                                                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground/40 cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => (document.getElementById(`file-${block.id}`) as HTMLInputElement)?.click()}>
                                                     <ImageIcon className="h-8 w-8 mb-2" />
                                                     <span className="text-[10px] font-bold uppercase">اضغط لإضافة صورة</span>
                                                  </div>
                                                )}
                                             </div>

                                             <div className="flex gap-2">
                                                <Input className="h-9 rounded-lg flex-1" value={block.image_url} onChange={(e) => handleUpdateBlock(block.id, { image_url: e.target.value })} placeholder="رابط الصورة (URL)" />
                                                <Button variant="outline" className="h-9 px-4 rounded-lg gap-2" onClick={() => (document.getElementById(`file-${block.id}`) as HTMLInputElement)?.click()}>
                                                  <Upload className="h-4 w-4" /> رفع
                                               </Button>
                                               <input type="file" hidden id={`file-${block.id}`} accept="image/*" onChange={(e) => handleBlockFileChange(e, block.id)} />
                                            </div>
                                            {block.file_name_placeholder && <div className="text-[10px] text-green-600 font-black">✓ {block.file_name_placeholder}</div>}
                                            <Input className="h-8 rounded-lg text-xs italic" value={block.caption} onChange={(e) => handleUpdateBlock(block.id, { caption: e.target.value })} placeholder="شرح الصورة..." />
                                         </div>
                                      )}

                                      {block.type === 'media' && (
                                         <div className="space-y-4">
                                            <div className="flex gap-2 p-1 bg-muted rounded-lg w-fit mx-auto">
                                               <Button variant={block.media_type === 'youtube' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-3 text-[10px]" onClick={() => handleUpdateBlock(block.id, { media_type: 'youtube' })}>YouTube</Button>
                                               <Button variant={block.media_type === 'video' ? 'secondary' : 'ghost'} size="sm" className="h-7 px-3 text-[10px]" onClick={() => handleUpdateBlock(block.id, { media_type: 'video' })}>ملف فيديو</Button>
                                            </div>
                                            <Input className="h-9 rounded-lg" value={block.media_url} onChange={(e) => handleUpdateBlock(block.id, { media_url: e.target.value })} placeholder="الرابط المباشر..." />
                                            {block.media_type === 'video' && (
                                               <div className="flex flex-col items-center gap-2">
                                                  <Button variant="outline" className="w-full h-10 border-dashed gap-2" onClick={() => document.getElementById(`file-${block.id}`)?.click()}>
                                                     <Video className="h-4 w-4" /> اختر فيديو من جهازك
                                                  </Button>
                                                  <input type="file" hidden id={`file-${block.id}`} accept="video/*" onChange={(e) => handleBlockFileChange(e, block.id)} />
                                                  {block.file_name_placeholder && <div className="text-xs text-green-600 font-bold">✓ {block.file_name_placeholder}</div>}
                                               </div>
                                            )}
                                         </div>
                                      )}

                                      {block.type === 'separator' && (
                                         <div className="py-4 flex justify-center"><div className="w-2/3 h-px bg-gradient-to-r from-transparent via-border to-transparent" /></div>
                                      )}
                                   </div>
                                ))}
                             </div>
                          </div>
                        )}
                      </div>
                   </div>
                )}

                {itemType === 'lesson' && (
                   <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="space-y-3 p-5 bg-primary/5 rounded-3xl border border-primary/10">
                        <Label className="font-black text-lg text-primary">وسائط الدرس (فيديو)</Label>
                        <div className="flex gap-2 p-1 bg-muted rounded-xl">
                          <Button variant={itemForm.source_mode === 'youtube' ? 'secondary' : 'ghost'} className="flex-1 rounded-lg h-9 text-xs" onClick={() => setItemForm({...itemForm, source_mode: 'youtube'})}>YouTube</Button>
                          <Button variant={itemForm.source_mode === 'external' ? 'secondary' : 'ghost'} className="flex-1 rounded-lg h-9 text-xs" onClick={() => setItemForm({...itemForm, source_mode: 'external'})}>رابط خارجي</Button>
                          <Button variant={itemForm.source_mode === 'upload' ? 'secondary' : 'ghost'} className="flex-1 rounded-lg h-9 text-xs" onClick={() => setItemForm({...itemForm, source_mode: 'upload'})}>رفع فيديو</Button>
                        </div>
                        
                        <div className="pt-2">
                           <input type="file" accept="video/*" className="hidden" id="video-picker" onChange={(e) => handleFileChange(e, 'video')} />
                           {itemForm.source_mode === 'youtube' && <Input dir="ltr" className="h-10 rounded-xl" value={itemForm.youtube_url} onChange={e => setItemForm({...itemForm, youtube_url: e.target.value})} placeholder="https://youtube.com/..." />}
                           {itemForm.source_mode === 'external' && <Input dir="ltr" className="h-10 rounded-xl" value={itemForm.url} onChange={e => setItemForm({...itemForm, url: e.target.value})} placeholder="https://..." />}
                           {itemForm.source_mode === 'upload' && (
                             <div className="p-4 border-2 border-dashed rounded-2xl bg-background/50 flex flex-col items-center gap-3">
                                {itemForm.video_upload_placeholder ? (
                                  <div className="flex items-center gap-2 text-green-600 font-bold"><Video className="h-4 w-4" /> {itemForm.video_upload_placeholder}</div>
                                ) : (
                                  <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={() => document.getElementById('video-picker')?.click()}><Upload className="h-4 w-4" /> اختر ملف الفيديو</Button>
                                )}
                             </div>
                           )}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label className="font-bold">المحتوى التعليمي (Rich Text)</Label>
                          <textarea rows={6} className="w-full rounded-2xl border bg-muted/5 p-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none leading-relaxed" value={itemForm.content_ar} onChange={e => setItemForm({...itemForm, content_ar: e.target.value})} placeholder="اشرح الدرس بالتفصيل..." />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                             <Label className="font-bold text-xs uppercase text-muted-foreground">أهداف الدرس</Label>
                             <textarea rows={3} className="w-full rounded-xl border p-3 text-xs" value={itemForm.lesson_goals} onChange={e => setItemForm({...itemForm, lesson_goals: e.target.value})} placeholder="ماذا سيستفيد المتعلم؟" />
                           </div>
                           <div className="space-y-2">
                             <Label className="font-bold text-xs uppercase text-muted-foreground">تعليمات المذاكرة</Label>
                             <textarea rows={3} className="w-full rounded-xl border p-3 text-xs" value={itemForm.learner_instructions} onChange={e => setItemForm({...itemForm, learner_instructions: e.target.value})} placeholder="نصيحة سريعة..." />
                           </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-sm">المعرفة المطلوبة قبل البدء (اختياري)</Label>
                          <Input className="h-11 rounded-xl" value={itemForm.prerequisites} onChange={e => setItemForm({...itemForm, prerequisites: e.target.value})} placeholder="مثال: أساسيات..." />
                        </div>

                        <div className="p-4 bg-muted/30 rounded-3xl space-y-3">
                           <Label className="font-bold text-xs">مستندات PDF ملحقة</Label>
                           <input type="file" accept=".pdf" className="hidden" id="pdf-picker" onChange={(e) => handleFileChange(e, 'pdf')} />
                           <div className="flex gap-2">
                              <Input className="h-10 rounded-xl flex-1 border-none shadow-none" value={itemForm.document_url} onChange={e => setItemForm({...itemForm, document_url: e.target.value})} placeholder="رابط PDF خارجي" />
                              <Button variant="secondary" className="h-10 px-4 rounded-xl gap-2" onClick={() => document.getElementById('pdf-picker')?.click()}><FileUp className="h-4 w-4" /> رفع</Button>
                           </div>
                           {itemForm.pdf_upload_placeholder && <div className="text-[10px] text-blue-600 font-bold px-2">✓ {itemForm.pdf_upload_placeholder}</div>}
                        </div>
                      </div>
                   </div>
                )}

                {itemType === 'quiz' && (
                   <div className="space-y-8 animate-in zoom-in-95 duration-500">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                            <Label className="text-purple-700 font-bold text-xs uppercase">درجة النجاح</Label>
                            <Input type="number" className="h-10 bg-white rounded-xl mt-2" value={itemForm.quiz.passing_score} onChange={e => setItemForm({...itemForm, quiz: {...itemForm.quiz, passing_score: parseInt(e.target.value)}})} />
                         </div>
                         <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100">
                            <Label className="text-purple-700 font-bold text-xs uppercase">عدد المحاولات</Label>
                            <Input type="number" className="h-10 bg-white rounded-xl mt-2" value={itemForm.quiz.attempts} onChange={e => setItemForm({...itemForm, quiz: {...itemForm.quiz, attempts: parseInt(e.target.value)}})} />
                         </div>
                      </div>

                      <div className="space-y-6">
                         <div className="flex items-center justify-between">
                            <Label className="font-black text-lg">الأسئلة ({itemForm.quiz.questions.length})</Label>
                            <Button size="sm" className="gap-2 rounded-full px-5 bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-transform active:scale-95" onClick={() => {
                               const newQ: QuizQuestion = { id: crypto.randomUUID(), type: 'multiple_choice', question: "", options: ["", ""], correct_answers: [0] };
                               setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: [...itemForm.quiz.questions, newQ]}});
                            }}><Plus className="h-4 w-4" /> إضافة سؤال</Button>
                         </div>
                         
                         <div className="space-y-6">
                            {itemForm.quiz.questions.map((q, qIdx) => (
                               <div key={q.id} className="p-6 border-2 border-purple-100 rounded-3xl bg-card shadow-sm space-y-5 relative group">
                                  <Button variant="ghost" size="icon" className="absolute top-4 left-4 h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors" onClick={() => {
                                     const qs = [...itemForm.quiz.questions];
                                     qs.splice(qIdx, 1);
                                     setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                  }} title="حذف السؤال"><Trash2 className="h-4 w-4" /></Button>
                                  
                                  <div className="flex items-center gap-4">
                                     <div className="bg-purple-100 text-purple-700 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black shadow-inner">
                                       {qIdx + 1}
                                     </div>
                                     <select 
                                       className="h-9 px-3 rounded-xl border-2 border-purple-100 text-xs font-bold bg-background focus:ring-2 focus:ring-purple-400 focus:border-purple-400 outline-none text-purple-800" 
                                       value={q.type} 
                                       onChange={e => {
                                         const qs = [...itemForm.quiz.questions];
                                         const newType = e.target.value as any;
                                         qs[qIdx] = { ...qs[qIdx], type: newType };
                                         if (newType === 'matching' && (!qs[qIdx].pairs || qs[qIdx].pairs.length === 0)) qs[qIdx].pairs = [{left: "", right: ""}];
                                         if ((newType === 'multiple_choice' || newType === 'multiple_select') && (!qs[qIdx].options || qs[qIdx].options.length === 0)) {
                                           qs[qIdx].options = ["", ""];
                                           qs[qIdx].correct_answers = [0];
                                         }
                                         if (newType === 'true_false' && qs[qIdx].answer === undefined) qs[qIdx].answer = true;
                                         setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                       }}
                                     >
                                        <option value="multiple_choice">اختيار من متعدد</option>
                                        <option value="true_false">صح أم خطأ</option>
                                        <option value="multiple_select">اختيار متعدد الإجابات</option>
                                        <option value="matching">مطابقة (أزواج)</option>
                                     </select>
                                  </div>

                                  <div className="space-y-2">
                                     <Label className="text-[11px] font-bold text-muted-foreground uppercase">نص السؤال</Label>
                                     <textarea className="w-full p-4 rounded-2xl bg-muted/10 border-2 border-border/80 focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none text-sm font-bold resize-none transition-all placeholder:font-normal" rows={2} value={q.question} onChange={e => {
                                        const qs = [...itemForm.quiz.questions];
                                        qs[qIdx].question = e.target.value;
                                        setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                     }} placeholder="اكتب نص السؤال هنا بدقة..." />
                                  </div>

                                  {/* Dynamic UI based on question type */}
                                  <div className="pt-2 bg-gradient-to-br from-purple-50/50 to-background p-5 rounded-2xl border border-purple-100/50">
                                     
                                     {/* Multiple Choice & Multiple Select */}
                                     {(q.type === 'multiple_choice' || q.type === 'multiple_select') && (
                                        <div className="space-y-3">
                                           <div className="flex justify-between items-center mb-3">
                                              <Label className="text-[11px] font-bold text-purple-800">الخيارات (حدد الإجابة الصحيحة)</Label>
                                              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-purple-600 hover:text-purple-800 bg-purple-100/50 hover:bg-purple-200 rounded-lg px-3 transition-colors shrink-0" onClick={() => {
                                                 const qs = [...itemForm.quiz.questions];
                                                 qs[qIdx].options = [...(qs[qIdx].options || []), ""];
                                                 setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                              }}>+ إضافة خيار</Button>
                                           </div>
                                           {q.options?.map((opt, oIdx) => (
                                              <div key={oIdx} className="flex gap-3 items-center group/opt">
                                                 <div className="flex items-center justify-center p-2 rounded-xl bg-background border shadow-sm shrink-0 hover:border-purple-300 transition-colors cursor-pointer" onClick={() => {
                                                    const qs = [...itemForm.quiz.questions];
                                                    if(q.type === 'multiple_choice') {
                                                      qs[qIdx].correct_answers = [oIdx];
                                                    } else {
                                                      const currentAns = [...(qs[qIdx].correct_answers || [])];
                                                      if(currentAns.includes(oIdx)) currentAns.splice(currentAns.indexOf(oIdx), 1);
                                                      else currentAns.push(oIdx);
                                                      qs[qIdx].correct_answers = currentAns;
                                                    }
                                                    setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                                 }}>
                                                    {q.type === 'multiple_choice' ? (
                                                       <input type="radio" className="w-4 h-4 text-purple-600 focus:ring-purple-500 cursor-pointer" name={`q-${q.id}`} checked={q.correct_answers?.includes(oIdx) || false} onChange={() => {}} />
                                                    ) : (
                                                       <input type="checkbox" className="w-4 h-4 text-purple-600 focus:ring-purple-500 rounded cursor-pointer" checked={q.correct_answers?.includes(oIdx) || false} onChange={() => {}} />
                                                    )}
                                                 </div>
                                                 <Input className={`h-11 rounded-xl text-sm transition-all focus-visible:ring-purple-400 ${q.correct_answers?.includes(oIdx) ? 'border-purple-300 bg-purple-50 font-bold text-purple-900' : 'bg-background border-border shadow-sm'}`} value={opt} onChange={e => {
                                                    const qs = [...itemForm.quiz.questions];
                                                    const opts = [...(qs[qIdx].options || [])];
                                                    opts[oIdx] = e.target.value;
                                                    qs[qIdx].options = opts;
                                                    setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                                 }} placeholder={`الخيار ${oIdx + 1}`} />
                                                 {q.options && q.options.length > 2 && (
                                                   <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0 opacity-0 group-hover/opt:opacity-100 transition-opacity" onClick={() => {
                                                      const qs = [...itemForm.quiz.questions];
                                                      const opts = [...(qs[qIdx].options || [])];
                                                      opts.splice(oIdx, 1);
                                                      qs[qIdx].options = opts;
                                                      // Re-adjust correct answer indices
                                                      let newAns = qs[qIdx].correct_answers?.filter(a => a !== oIdx).map(a => a > oIdx ? a - 1 : a) || [];
                                                      if (newAns.length === 0 && q.type === 'multiple_choice') newAns = [0];
                                                      qs[qIdx].correct_answers = newAns;
                                                      setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                                   }}><Trash2 className="h-4 w-4" /></Button>
                                                 )}
                                              </div>
                                           ))}
                                        </div>
                                     )}

                                     {/* True / False */}
                                     {q.type === 'true_false' && (
                                        <div className="flex gap-4">
                                           <div className={`flex-1 flex gap-3 items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${q.answer === true ? 'border-green-400 bg-green-50 shadow-md transform scale-[1.02]' : 'border-border/60 bg-background hover:bg-muted/30 hover:border-border'}`} onClick={() => {
                                              const qs = [...itemForm.quiz.questions];
                                              qs[qIdx].answer = true;
                                              setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                           }}>
                                              <input type="radio" checked={q.answer === true} onChange={() => {}} className="w-5 h-5 text-green-600 focus:ring-green-500 cursor-pointer" />
                                              <span className={`text-sm ${q.answer === true ? 'font-black text-green-800' : 'font-medium text-muted-foreground'}`}>العبارة صحيحة (True)</span>
                                           </div>
                                           <div className={`flex-1 flex gap-3 items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${q.answer === false ? 'border-red-400 bg-red-50 shadow-md transform scale-[1.02]' : 'border-border/60 bg-background hover:bg-muted/30 hover:border-border'}`} onClick={() => {
                                              const qs = [...itemForm.quiz.questions];
                                              qs[qIdx].answer = false;
                                              setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                           }}>
                                              <input type="radio" checked={q.answer === false} onChange={() => {}} className="w-5 h-5 text-red-600 focus:ring-red-500 cursor-pointer" />
                                              <span className={`text-sm ${q.answer === false ? 'font-black text-red-800' : 'font-medium text-muted-foreground'}`}>العبارة خاطئة (False)</span>
                                           </div>
                                        </div>
                                     )}

                                     {/* Matching */}
                                     {q.type === 'matching' && (
                                        <div className="space-y-3">
                                           <div className="flex justify-between items-center mb-3">
                                              <Label className="text-[11px] font-bold text-purple-800">أزواج التطابق (العمود أ - العمود ب)</Label>
                                              <Button variant="ghost" size="sm" className="h-7 text-[10px] text-purple-600 hover:text-purple-800 bg-purple-100/50 hover:bg-purple-200 rounded-lg px-3 shrink-0" onClick={() => {
                                                 const qs = [...itemForm.quiz.questions];
                                                 qs[qIdx].pairs = [...(qs[qIdx].pairs || []), {left:"", right:""}];
                                                 setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                              }}>+ إضافة زوج جديد</Button>
                                           </div>
                                           {q.pairs?.map((pair, pIdx) => (
                                              <div key={pIdx} className="flex gap-3 items-center bg-background p-2 rounded-2xl border shadow-sm group/pair">
                                                 <div className="relative flex-1">
                                                   <span className="absolute right-3 top-[-8px] bg-background px-1 text-[9px] font-bold text-muted-foreground">العمود أ</span>
                                                   <Input className="h-11 w-full text-sm border-none shadow-none bg-muted/20 focus-visible:ring-1 focus-visible:ring-purple-200 focus-visible:bg-background rounded-xl pr-4 font-medium" value={pair.right} onChange={e => {
                                                      const qs = [...itemForm.quiz.questions];
                                                      const pairs = [...(qs[qIdx].pairs || [])];
                                                      pairs[pIdx] = {...pairs[pIdx], right: e.target.value};
                                                      qs[qIdx].pairs = pairs;
                                                      setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                                   }} placeholder="العنصر الأول..." />
                                                 </div>
                                                 <div className="px-1 text-purple-300 hidden sm:block"><ArrowRight className="h-5 w-5" /></div>
                                                 <div className="relative flex-1">
                                                   <span className="absolute right-3 top-[-8px] bg-background px-1 text-[9px] font-bold text-purple-500">العمود ب (المطابق)</span>
                                                   <Input className="h-11 w-full text-sm border-none shadow-none bg-purple-50 focus-visible:ring-1 focus-visible:ring-purple-300 focus-visible:bg-purple-100/50 rounded-xl pr-4 font-bold text-purple-900" value={pair.left} onChange={e => {
                                                      const qs = [...itemForm.quiz.questions];
                                                      const pairs = [...(qs[qIdx].pairs || [])];
                                                      pairs[pIdx] = {...pairs[pIdx], left: e.target.value};
                                                      qs[qIdx].pairs = pairs;
                                                      setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                                   }} placeholder="ما يطابق العنصر الأول..." />
                                                 </div>
                                                 {q.pairs && q.pairs.length > 1 && (
                                                   <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-red-500 hover:bg-red-50 shrink-0 opacity-0 group-hover/pair:opacity-100 transition-opacity" onClick={() => {
                                                      const qs = [...itemForm.quiz.questions];
                                                      const pairs = [...(qs[qIdx].pairs || [])];
                                                      pairs.splice(pIdx, 1);
                                                      qs[qIdx].pairs = pairs;
                                                      setItemForm({...itemForm, quiz: {...itemForm.quiz, questions: qs}});
                                                   }}><Trash2 className="h-4 w-4" /></Button>
                                                 )}
                                              </div>
                                           ))}
                                        </div>
                                     )}

                                  </div>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                )}

                {/* Legacy Catch-all for other types */}
                {!['lesson', 'article', 'quiz'].includes(itemType) && (
                   <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="space-y-2">
                        <Label className="font-bold">الوصف المختصر</Label>
                        <textarea rows={3} className="w-full rounded-2xl border bg-muted/5 p-4 text-sm" value={itemForm.description_override} onChange={e => setItemForm({...itemForm, description_override: e.target.value})} placeholder="ماذا يتوقع المتعلم..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold">الرابط المباشر (URL)</Label>
                        <Input dir="ltr" className="h-11 rounded-xl" value={itemForm.url} onChange={e => setItemForm({...itemForm, url: e.target.value})} placeholder="https://..." />
                      </div>
                      <div className="space-y-2">
                        <Label className="font-bold text-xs uppercase text-muted-foreground">ملاحظات إضافية</Label>
                        <Input className="h-11 rounded-xl" value={itemForm.notes} onChange={e => setItemForm({...itemForm, notes: e.target.value})} placeholder="تظهر بجانب الرابط..." />
                      </div>
                   </div>
                )}
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-background border-t p-6 shadow-2xl flex justify-center z-10">
            <Button onClick={handleSaveItem} size="lg" className="h-12 px-16 rounded-full font-bold transition-all hover:scale-105 active:scale-95">
              {editingItem ? "حفظ التحديثات" : "اعتماد وإضافة العنصر"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PathBuilder;
