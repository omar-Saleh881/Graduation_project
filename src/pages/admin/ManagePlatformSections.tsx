import { useState, useEffect } from "react";
import {
  Plus, Trash2, Edit, LayoutPanelLeft, Zap, Package, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  sectionsRepo, DEFAULT_CTA_LINKS
} from "@/lib/data/repository";
import { PlatformSection, SectionTemplateType, SectionDisplayStyle } from "@/types/platform-section";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const templateTypeLabels: Record<string, string> = {
  tools: "🔧 الأدوات",
  paths: "📚 المسارات التعليمية",
  courses: "🎓 الكورسات",
  articles: "📝 المقالات",
  content: "🔗 المصادر الخارجية",
};

const displayStyleLabels: Record<SectionDisplayStyle, string> = {
  grid: "شبكة",
  list: "قائمة",
  cards: "بطاقات",
  featured: "مميّز",
};

const blankForm = (order: number): Partial<PlatformSection> => ({
  title_ar: "",
  description_ar: "",
  icon: "✨",
  template_type: 'tools',
  display_style: 'grid',
  max_items: 6,
  empty_state_text: "لا توجد عناصر متاحة حالياً",
  order,
  is_active: true,
  cta_text: "استكشف المزيد",
  cta_link: "",
  module_mode: true // Enforcement: Every custom section is an isolated module by default
});

export default function ManagePlatformSections() {
  const { toast } = useToast();
  const [sections, setSections] = useState<PlatformSection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PlatformSection | null>(null);
  const [formData, setFormData] = useState<Partial<PlatformSection>>(blankForm(1));

  const loadSections = () => {
    setSections(sectionsRepo.getAll().sort((a, b) => a.order - b.order));
  };

  useEffect(() => { loadSections(); }, []);

  const suggestedCtaLink = (type: SectionTemplateType) => DEFAULT_CTA_LINKS[type] ?? '/';

  const handleTemplateTypeChange = (v: SectionTemplateType) => {
    setFormData(prev => ({ ...prev, template_type: v }));
  };

  const handleOpenAdd = () => {
    setEditingSection(null);
    setFormData({
      ...blankForm(sections.length + 1),
      module_mode: true,
      cta_link: ""
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (section: PlatformSection) => {
    setEditingSection(section);
    setFormData({ ...section });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.title_ar?.trim() || !formData.template_type) {
      toast({ title: "خطأ", description: "يرجى إكمال الحقول المطلوبة", variant: "destructive" });
      return;
    }

    const payload = { ...formData } as PlatformSection;

    // Fix: If it's a generic un-scoped section, and cta_link is empty, we can fallback.
    // BUT if it's module_mode, it must remain empty so repository.ts generates /section/:id
    if (!payload.module_mode && !payload.cta_link) {
       payload.cta_link = DEFAULT_CTA_LINKS[payload.template_type] || "/";
    }

    if (editingSection) {
      sectionsRepo.update(editingSection.id, payload);
      toast({ title: "تم التحديث" });
    } else {
      sectionsRepo.create(payload);
      toast({ title: "تم إضافة القسم" });
    }

    setIsOpen(false);
    loadSections();
  };

  const handleDelete = (id: string) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    sectionsRepo.delete(id);
    loadSections();
    toast({ title: "تم الحذف" });
  };

  const toggleStatus = (section: PlatformSection) => {
    sectionsRepo.update(section.id, { is_active: !section.is_active });
    loadSections();
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
            <p className="text-muted-foreground text-sm">
              كل قسم يُنشأ هنا سيكون موديول مستقل بذاته له محتواه الخاص المعزول والمحمي.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 h-11 px-6 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> بناء قسم مخصص
        </Button>
      </div>

      <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 flex gap-3 items-start text-sm">
        <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">المعمارية المعزولة (Isolated Modules)</p>
          <p className="text-muted-foreground leading-relaxed">
            كل قسم مخصص يحتوي على بياناته المستقلة بالكامل. بمجرد إنشاء القسم، سيظهر في القائمة الجانبية للإدارة لكي تقوم بإضافة محتوى (كورسات، مسارات، أدوات...) مخصص له فقط. محتوى هذا القسم لن يختلط أبدًا مع المحتويات العامة للمنصة.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card
            key={section.id}
            className={`${!section.is_active ? 'opacity-60 border-dashed grayscale-[0.4]' : ''} group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 relative overflow-hidden bg-card/60 backdrop-blur-sm`}
          >
            <div className="absolute top-0 right-0 p-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleOpenEdit(section)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="destructive" size="icon" className="h-8 w-8 rounded-full" onClick={() => handleDelete(section.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
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

            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs font-semibold text-primary">
                  {templateTypeLabels[section.template_type] || section.template_type}
                </Badge>
                {section.module_mode ? (
                  <Badge variant="secondary" className="text-xs gap-1">موديول معزول</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs gap-1 border-dashed">قسم عام</Badge>
                )}
                {section.display_style && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    <Package className="h-3 w-3 mr-1" />
                    {displayStyleLabels[section.display_style]}
                  </Badge>
                )}
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-muted text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الرابط الموجه:</span>
                  <span className="font-mono text-primary font-bold truncate max-w-[140px]">
                    {section.cta_link || DEFAULT_CTA_LINKS[section.template_type]}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">نص الزر:</span>
                  <span>{section.cta_text}</span>
                </div>
                {section.max_items && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">حد العناصر:</span>
                    <span>{section.max_items}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Switch checked={section.is_active} onCheckedChange={() => toggleStatus(section)} />
                  <span className="text-xs font-bold">{section.is_active ? "يظهر للجمهور" : "مخفي حالياً"}</span>
                </div>
                <span className="text-xs font-bold text-muted-foreground">ترتيب: {section.order}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {editingSection ? <Edit className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
              {editingSection ? "تعديل القسم" : "إضافة قسم جديد (موديول مستقل)"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">بيانات الموديول</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">اسم القسم المخصص (عربي) *</Label>
                  <Input
                    value={formData.title_ar}
                    onChange={e => setFormData({ ...formData, title_ar: e.target.value })}
                    placeholder="مثال: أكاديمية الطبخ، مسار التصميم 2024..."
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">الاسم الظاهر للمستخدم في القوائم الرئيسية.</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">الوصف التعريفي</Label>
                  <Textarea
                    value={formData.description_ar}
                    onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                    placeholder="اكتب وصفاً جذاباً يوضح هدف هذا القسم..."
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">الأيقونة (Emoji)</Label>
                  <Input
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    className="text-2xl h-11 text-center"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">الترتيب</Label>
                  <Input
                    type="number"
                    value={formData.order}
                    onChange={e => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">إعدادات العزل والقالب</p>

              <div className="flex flex-row items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-4 mb-6">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-primary">قسم مستقل (Isolated Module)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    يعني أن هذا القسم له بياناته الخاصة المنفصلة كلياً. سيظهر القسم في شريط الإدارة الجانبي المخصص له.
                  </p>
                </div>
                <Switch
                  checked={formData.module_mode || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, module_mode: checked })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">قالب هيكلة البيانات *</Label>
                  <Select
                    value={formData.template_type}
                    onValueChange={(v: SectionTemplateType) => handleTemplateTypeChange(v)}
                  >
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(templateTypeLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">يحدد الشاشات والأدوات الإدارية التي ستتاح لهذا القسم.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">أسلوب العرض الافتراضي</Label>
                  <Select
                    value={formData.display_style}
                    onValueChange={(v: SectionDisplayStyle) => setFormData({ ...formData, display_style: v })}
                  >
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(displayStyleLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">رسالة الحالة الفارغة (اختيارية)</Label>
                  <Input
                    value={formData.empty_state_text ?? ""}
                    onChange={e => setFormData({ ...formData, empty_state_text: e.target.value })}
                    placeholder="مثال: يرجى الانتظار، سيتم إضافة الدورات قريباً..."
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">الخيار الموجّه (CTA) والظهور</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-bold">نص الزر</Label>
                  <Input
                    value={formData.cta_text ?? ""}
                    onChange={e => setFormData({ ...formData, cta_text: e.target.value })}
                    placeholder="مثال: استكشف الآن"
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">رابط التوجيه</Label>
                  <Input
                    value={formData.cta_link ?? ""}
                    onChange={e => setFormData({ ...formData, cta_link: e.target.value })}
                    placeholder={`سيُستخدم تلقائيًا: ${suggestedCtaLink(formData.template_type ?? 'tools')}`}
                    className="h-11 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">اتركه فارغًا ليتمّ التوجيه تلقائياً إلى صفحة القسم المخصصة.</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">الحد الأقصى للعناصر على الرئيسية</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.max_items ?? 6}
                    onChange={e => setFormData({ ...formData, max_items: parseInt(e.target.value) || 6 })}
                    className="h-11"
                  />
                </div>

                <div className="md:col-span-2 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between mt-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">عرض القسم في منصة الجمهور</p>
                    <p className="text-[10px] text-muted-foreground italic">تفعيل ظهور هذا القسم للجمهور على الصفحة الرئيسية</p>
                  </div>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={checked => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="h-11 px-6">إلغاء</Button>
            <Button onClick={handleSave} className="h-11 px-8 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white">حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
