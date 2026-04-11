import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Save, X, Check, Eye, EyeOff, LayoutPanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { sectionsRepo } from "@/lib/data/repository";
import { PlatformSection } from "@/types/platform-section";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function ManagePlatformSections() {
  const { toast } = useToast();
  const [sections, setSections] = useState<PlatformSection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PlatformSection | null>(null);
  
  const [formData, setFormData] = useState<Partial<PlatformSection>>({
    title_ar: "",
    description_ar: "",
    icon: "✨",
    content_type: 'tools',
    order: 0,
    is_active: true,
    cta_text: "استكشف المزيد",
    cta_link: "/"
  });

  const loadSections = () => {
    const all = sectionsRepo.getAll().sort((a, b) => a.order - b.order);
    setSections(all);
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleOpenAdd = () => {
    setEditingSection(null);
    setFormData({
      title_ar: "",
      description_ar: "",
      icon: "✨",
      content_type: 'tools',
      order: sections.length + 1,
      is_active: true,
      cta_text: "استكشف المزيد",
      cta_link: "/"
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (section: PlatformSection) => {
    setEditingSection(section);
    setFormData({ ...section });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.title_ar || !formData.content_type) {
      toast({ title: "خطأ", description: "يرجى إكمال الحقول المطلوبة", variant: "destructive" });
      return;
    }

    if (editingSection) {
      sectionsRepo.update(editingSection.id, formData as any);
      toast({ title: "تم التحديث", description: "تم تحديث بيانات القسم بنجاح" });
    } else {
      sectionsRepo.create(formData as any);
      toast({ title: "تم الإضافة", description: "تم إضافة القسم الجديد للمنصة" });
    }

    setIsOpen(false);
    loadSections();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا القسم من الصفحة الرئيسية؟")) {
      sectionsRepo.delete(id);
      loadSections();
      toast({ title: "تم الحذف" });
    }
  };

  const toggleStatus = (section: PlatformSection) => {
    sectionsRepo.update(section.id, { is_active: !section.is_active });
    loadSections();
  };

  const contentTypeLabels: Record<string, string> = {
    tools: "الأدوات",
    paths: "المسارات",
    courses: "الكورسات",
    articles: "المقالات",
    content: "مكتبة المحتوى",
    recommendations: "التوصيات",
    mixed: "محتوى مختلط"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <LayoutPanelLeft className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">مدير أقسام المنصة</h1>
            <p className="text-muted-foreground">قم بإدارة البطاقات والأقسام التي تظهر في الصفحة الرئيسية للمنصة.</p>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 h-11 px-6 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> إضافة قسم جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card key={section.id} className={`${!section.is_active ? 'opacity-60 border-dashed grayscale-[0.5]' : 'border-border'} group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 relative overflow-hidden bg-card/60 backdrop-blur-sm`}>
            <div className="absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenEdit(section)}><Edit className="h-4 w-4" /></Button>
              <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDelete(section.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
            
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex justify-between items-start mb-2">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center text-3xl">
                  {section.icon || "✨"}
                </div>
                <Badge variant={section.is_active ? "default" : "outline"} className={section.is_active ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}>
                  {section.is_active ? "نشط" : "معطل"}
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold">{section.title_ar}</CardTitle>
              <CardDescription className="line-clamp-2 text-sm">{section.description_ar}</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground font-medium">نوع المحتوى:</span>
                  <Badge variant="outline" className="font-semibold text-primary">
                    {contentTypeLabels[section.content_type] || section.content_type}
                  </Badge>
                </div>
                
                <div className="p-3 rounded-lg bg-muted/40 border border-muted text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الرابط الموجه:</span>
                    <span className="font-mono text-primary font-bold">{section.cta_link}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">نص الزر:</span>
                    <span>{section.cta_text}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch checked={section.is_active} onCheckedChange={() => toggleStatus(section)} />
                    <span className="text-xs font-bold">{section.is_active ? "سيظهر للجمهور" : "مخفي حالياً"}</span>
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">الترتيب: {section.order}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl bg-background/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {editingSection ? <Edit className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
              {editingSection ? "تعديل قسم المنصة" : "تحضير قسم جديد"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm font-bold">العنوان (عربي)</Label>
                <Input value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} placeholder="مثال: دليل الأدوات الذكية" className="h-11" />
              </div>
              
              <div className="space-y-2">
                <Label className="text-sm font-bold">الوصف التعريفي</Label>
                <Textarea value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} placeholder="اكتب وصفاً جذاباً للقسم..." className="min-h-[100px] leading-relaxed" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">الأيقونة (Emoji)</Label>
                  <Input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="text-2xl h-11 text-center" />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-bold">الترتيب</Label>
                  <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} className="h-11" />
                </div>
              </div>
            </div>

            <div className="space-y-6 border-r pr-6 border-border/50">
              <div className="space-y-2">
                <Label className="text-sm font-bold">نوع المحتوى المرتبط</Label>
                <Select value={formData.content_type} onValueChange={(v: any) => setFormData({...formData, content_type: v})}>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="اختر نوع المحتوى" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(contentTypeLabels).map(([val, label]) => (
                      <SelectItem key={val} value={val}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">نص الخيار التفاعلي (CTA)</Label>
                <Input value={formData.cta_text} onChange={e => setFormData({...formData, cta_text: e.target.value})} placeholder="مثال: استكشف الآن" className="h-11" />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold">رابط التوجيه</Label>
                <Input value={formData.cta_link} onChange={e => setFormData({...formData, cta_link: e.target.value})} placeholder="مثال: /tools" className="h-11 font-mono text-sm" />
              </div>

              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-foreground">عرض في المنصة</p>
                  <p className="text-[10px] text-muted-foreground italic">تفعيل ظهور هذا القسم للجمهور</p>
                </div>
                <Switch 
                  checked={formData.is_active} 
                  onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="h-11 px-6">إلغاء</Button>
            <Button onClick={handleSave} className="h-11 px-8 shadow-lg shadow-primary/20">حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
