import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Plus, Trash2, Edit, Save, ArrowRight, BookOpen, Layers, ArrowUp, ArrowDown, ExternalLink, FileText, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { 
  pathsRepo, 
  pathStagesRepo, 
  pathStageItemsRepo,
  coursesRepo,
  lessonsRepo,
  articlesRepo,
  toolsRepo
} from "@/lib/data/repository";
import { PathStage, PathStageItem, Course, Lesson } from "@/types/builder";
import { Article } from "@/types/article";
import { Tool } from "@/types/tool";

export default function PathBuilder() {
  const { slug } = useParams<{slug: string}>();
  const { toast } = useToast();
  
  const [pathId, setPathId] = useState<string>("");
  const [path, setPath] = useState<any>(null);
  const [stages, setStages] = useState<(PathStage & { items: PathStageItem[] })[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [availableLessons, setAvailableLessons] = useState<Lesson[]>([]);
  const [availableArticles, setAvailableArticles] = useState<Article[]>([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);

  // Stage Dialog
  const [isStageOpen, setIsStageOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PathStage | null>(null);
  const [stageForm, setStageForm] = useState({ title_ar: "", description_ar: "" });

  // Add/Edit Item Dialog
  const [isItemOpen, setIsItemOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PathStageItem | null>(null);
  const [activeStageId, setActiveStageId] = useState<string>("");
  const [itemType, setItemType] = useState<PathStageItem['item_type']>("course");
  const [selectedRef, setSelectedRef] = useState<string>("");
  const [itemForm, setItemForm] = useState({
    title_override: "",
    description_override: "",
    duration_minutes: 0,
    notes: "",
    url: ""
  });

  const loadData = () => {
    const allPaths = pathsRepo.getAll();
    const targetPath = allPaths.find(p => p.id === slug || p.slug === slug);
    if (!targetPath) return;

    setPathId(targetPath.id);
    setPath(targetPath);

    const allStages = pathStagesRepo.getAll()
      .filter(s => s.path_id === targetPath.id)
      .sort((a,b) => a.order - b.order);
      
    const allItems = pathStageItemsRepo.getAll();

    const populatedStages = allStages.map(s => ({
      ...s,
      items: allItems.filter(i => i.stage_id === s.id).sort((a,b) => a.order - b.order)
    }));

    setStages(populatedStages);
    setAvailableCourses(coursesRepo.getAll());
    setAvailableLessons(lessonsRepo.getAll());
    setAvailableArticles(articlesRepo.getAll());
    setAvailableTools(toolsRepo.getAll());
  };

  useEffect(() => { loadData(); }, [slug]);

  if (!path) return <div className="p-8">جاري التحميل...</div>;

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
    if (!selectedRef && itemType !== 'external' && itemType !== 'quiz' && !editingItem) return;
    
    const itemData = {
      stage_id: activeStageId,
      item_type: itemType,
      reference_id: selectedRef,
      title_override: itemForm.title_override,
      description_override: itemForm.description_override,
      duration_minutes: itemForm.duration_minutes,
      notes: itemForm.notes,
      url: itemForm.url
    };

    if (editingItem) {
      pathStageItemsRepo.update(editingItem.id, itemData);
      toast({ title: "تم تحديث العنصر" });
    } else {
      const stageItems = stages.find(s => s.id === activeStageId)?.items || [];
      pathStageItemsRepo.create({
        ...itemData,
        order: stageItems.length + 1
      });
      toast({ title: "تم إضافة العنصر للمرحلة" });
    }
    
    setSelectedRef("");
    setItemForm({ title_override: "", description_override: "", duration_minutes: 0, notes: "", url: "" });
    setEditingItem(null);
    setIsItemOpen(false);
    loadData();
  };

  const handleEditItem = (item: PathStageItem, stageId: string) => {
    setEditingItem(item);
    setActiveStageId(stageId);
    setItemType(item.item_type);
    setSelectedRef(item.reference_id || "");
    setItemForm({
      title_override: item.title_override || "",
      description_override: item.description_override || "",
      duration_minutes: item.duration_minutes || 0,
      notes: item.notes || "",
      url: item.url || ""
    });
    setIsItemOpen(true);
  };

  const handleMoveStage = (stageId: string, direction: 'up' | 'down') => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;
    const index = stages.findIndex(s => s.id === stageId);
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stages.length) return;

    const otherStage = stages[targetIndex];
    pathStagesRepo.update(stage.id, { order: otherStage.order });
    pathStagesRepo.update(otherStage.id, { order: stage.order });
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

    const otherItem = stageItems[targetIndex];
    pathStageItemsRepo.update(item.id, { order: otherItem.order });
    pathStageItemsRepo.update(otherItem.id, { order: item.order });
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
      case 'quiz': return "اختبار تقييمي";
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
      default: return <Layers className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/admin/paths">
          <Button variant="outline" size="icon" className="rounded-full h-10 w-10"><ArrowRight className="h-5 w-5" /></Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">بناء المسار: {path.title_ar}</h1>
          <p className="text-muted-foreground italic">تخطيط رحلة تعلم متكاملة مبنية على مراحل.</p>
        </div>
        <Link to={`/paths/${path.slug}`} className="mr-auto">
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
                <Button variant="outline" size="sm" className="gap-1.5 border-primary/20 text-primary hover:bg-primary/10 h-9 px-3" onClick={() => { setEditingItem(null); setActiveStageId(stage.id); setItemType('course'); setSelectedRef(""); setItemForm({ title_override: "", description_override: "", duration_minutes: 0, notes: "", url: "" }); setIsItemOpen(true); }}>
                  <Plus className="h-4 w-4"/> ربط محتوى
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
                        <span className="uppercase">{item.item_type === 'course' ? 'كورس' : item.item_type === 'lesson' ? 'درس' : item.item_type === 'article' ? 'مقال' : item.item_type === 'tool' ? 'أداة' : item.item_type === 'external' ? 'رابط' : 'اختبار'}</span>
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
        <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-md shadow-2xl">
          <DialogHeader><DialogTitle className="text-xl font-bold">{editingItem ? "تعديل محتوى" : "ربط محتوى جديد"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-5 text-right">
              <div className="space-y-2">
                <Label className="font-bold">نوع المحتوى</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(['course', 'lesson', 'article', 'tool', 'external', 'quiz'] as const).map((type) => (
                    <Button key={type} variant={itemType === type ? 'default' : 'outline'} onClick={() => setItemType(type)} size="sm" className="h-10 text-xs py-0">
                      {type === 'course' ? 'كورس' : type === 'lesson' ? 'درس' : type === 'article' ? 'مقال' : type === 'tool' ? 'أداة' : type === 'external' ? 'رابط' : 'اختبار'}
                    </Button>
                  ))}
                </div>
              </div>
              
              {itemType !== 'external' && itemType !== 'quiz' && (
                <div className="space-y-2">
                  <Label className="font-bold">اختر العنصر</Label>
                  <select dir="rtl" className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm focus:ring-1 focus:ring-primary outline-none" value={selectedRef} onChange={(e) => setSelectedRef(e.target.value)}>
                    <option value="">-- اختر من القائمة --</option>
                    {itemType === 'course' && availableCourses.map(c => <option key={c.id} value={c.id}>{c.title_ar}</option>)}
                    {itemType === 'lesson' && availableLessons.map(l => <option key={l.id} value={l.id}>{l.title_ar}</option>)}
                    {itemType === 'article' && availableArticles.map(a => <option key={a.id} value={a.id}>{a.title_ar}</option>)}
                    {itemType === 'tool' && availableTools.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
              )}

              {itemType === 'external' && (
                <div className="space-y-2 text-right">
                  <Label className="font-bold">الرابط المباشر (URL)</Label>
                  <Input dir="ltr" className="text-left h-11" value={itemForm.url} onChange={e => setItemForm({...itemForm, url: e.target.value})} placeholder="https://..." />
                </div>
              )}
            </div>

            <div className="space-y-5 border-r pr-8 border-border/50 text-right">
              <div className="space-y-2">
                <Label className="font-bold">تسمية مخصصة للظهور (اختياري)</Label>
                <Input className="h-11" value={itemForm.title_override} onChange={e => setItemForm({...itemForm, title_override: e.target.value})} placeholder="اتركه فارغاً للافتراضي" />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">المدة المتوقعة (بالدقائق)</Label>
                <Input className="h-11" type="number" value={itemForm.duration_minutes} onChange={e => setItemForm({...itemForm, duration_minutes: parseInt(e.target.value) || 0})} />
              </div>
              <div className="space-y-2">
                <Label className="font-bold">توجيهات للمتعلم</Label>
                <Input className="h-11" value={itemForm.notes} onChange={e => setItemForm({...itemForm, notes: e.target.value})} placeholder="ملاحظة سريعة للمتعلم..." />
              </div>
            </div>
          </div>
          <DialogFooter className="mt-2">
            <Button onClick={handleSaveItem} className="w-full h-11 shadow-lg shadow-primary/20">{editingItem ? "حفظ التحديثات" : "اعتماد الربط بالمسار"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
