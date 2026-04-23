import { useState, useEffect, useMemo } from "react";
import {
  Plus, Trash2, Edit, Save, X, LayoutPanelLeft, Zap, List,
  Package, ChevronDown, ChevronUp, Search, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  sectionsRepo, toolsRepo, articlesRepo, pathsRepo, coursesRepo, contentRepo,
  DEFAULT_CTA_LINKS
} from "@/lib/data/repository";
import { PlatformSection, SectionContentType, SectionPopulationMode, SectionDisplayStyle } from "@/types/platform-section";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ─────────────────────────────────────────────────────────────────────────────
   Label maps
   ───────────────────────────────────────────────────────────────────────────── */
const contentTypeLabels: Record<string, string> = {
  tools:           "🔧 الأدوات",
  paths:           "📚 المسارات التعليمية",
  courses:         "🎓 الكورسات",
  articles:        "📝 المقالات",
  content:         "🗂️ مكتبة المحتوى",
  recommendations: "🎯 التوصيات",
  mixed:           "🔀 محتوى مختلط",
};

const populationLabels: Record<SectionPopulationMode, string> = {
  automatic: "تلقائي — أحدث العناصر المنشورة",
  manual:    "يدوي — اختر العناصر بنفسك",
};

const displayStyleLabels: Record<SectionDisplayStyle, string> = {
  grid:     "شبكة",
  list:     "قائمة",
  cards:    "بطاقات",
  featured: "مميّز",
};

/* ─────────────────────────────────────────────────────────────────────────────
   Candidate item fetcher for the manual picker
   ───────────────────────────────────────────────────────────────────────────── */
interface CandidateItem { id: string; label: string; sub?: string; badge: string; }

function getCandidates(contentType: SectionContentType): CandidateItem[] {
  switch (contentType) {
    case 'tools':
      return toolsRepo.getAll().map(t => ({ id: t.id, label: t.name, sub: t.description_ar?.slice(0, 60), badge: 'أداة' }));
    case 'articles':
      return articlesRepo.getAll().filter(a => a.is_published !== false)
        .map(a => ({ id: a.id, label: a.title_ar, sub: a.excerpt_ar?.slice(0, 60), badge: 'مقال' }));
    case 'paths':
      return pathsRepo.getAll().filter(p => p.is_published !== false)
        .map(p => ({ id: p.id, label: p.title_ar, sub: p.description_ar?.slice(0, 60), badge: 'مسار' }));
    case 'courses':
      return coursesRepo.getAll().filter(c => c.is_published !== false)
        .map(c => ({ id: c.id, label: c.title_ar, sub: c.description_ar?.slice(0, 60), badge: 'كورس' }));
    case 'content':
      return contentRepo.getAll()
        .map(c => ({ id: c.id, label: c.title_ar, sub: c.description_ar?.slice(0, 60), badge: 'محتوى' }));
    case 'mixed':
    default: {
      const all: CandidateItem[] = [
        ...toolsRepo.getAll().map(t => ({ id: t.id, label: t.name, sub: t.description_ar?.slice(0, 60), badge: 'أداة' })),
        ...articlesRepo.getAll().filter(a => a.is_published !== false)
          .map(a => ({ id: a.id, label: a.title_ar, sub: a.excerpt_ar?.slice(0, 60), badge: 'مقال' })),
        ...pathsRepo.getAll().filter(p => p.is_published !== false)
          .map(p => ({ id: p.id, label: p.title_ar, sub: p.description_ar?.slice(0, 60), badge: 'مسار' })),
        ...coursesRepo.getAll().filter(c => c.is_published !== false)
          .map(c => ({ id: c.id, label: c.title_ar, sub: c.description_ar?.slice(0, 60), badge: 'كورس' })),
      ];
      return all;
    }
  }
}

/* ─────────────────────────────────────────────────────────────────────────────
   Blank form
   ───────────────────────────────────────────────────────────────────────────── */
const blankForm = (order: number): Partial<PlatformSection> => ({
  title_ar: "",
  description_ar: "",
  icon: "✨",
  content_type: 'tools',
  population_mode: 'automatic',
  display_style: 'grid',
  max_items: 6,
  linked_item_ids: [],
  empty_state_text: "لا توجد عناصر متاحة حالياً",
  order,
  is_active: true,
  cta_text: "استكشف المزيد",
  cta_link: "",
});

/* ─────────────────────────────────────────────────────────────────────────────
   Main component
   ───────────────────────────────────────────────────────────────────────────── */
export default function ManagePlatformSections() {
  const { toast } = useToast();
  const [sections, setSections] = useState<PlatformSection[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<PlatformSection | null>(null);
  const [formData, setFormData] = useState<Partial<PlatformSection>>(blankForm(1));

  // manual picker state
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);

  const loadSections = () => {
    setSections(sectionsRepo.getAll().sort((a, b) => a.order - b.order));
  };

  useEffect(() => { loadSections(); }, []);

  /* ── Candidates for manual picker ────────────────────────────── */
  const candidates = useMemo(
    () => getCandidates(formData.content_type ?? 'tools'),
    [formData.content_type]
  );

  const filteredCandidates = useMemo(
    () => candidates.filter(c => c.label.includes(pickerSearch) || c.badge.includes(pickerSearch)),
    [candidates, pickerSearch]
  );

  const selectedIds = formData.linked_item_ids ?? [];

  const toggleItem = (id: string) => {
    const current = formData.linked_item_ids ?? [];
    setFormData({
      ...formData,
      linked_item_ids: current.includes(id) ? current.filter(x => x !== id) : [...current, id],
    });
  };

  /* ── Auto-suggest CTA link from content_type ─────────────────── */
  const suggestedCtaLink = (type: SectionContentType) =>
    type === 'mixed' ? `/section/NEW` : DEFAULT_CTA_LINKS[type] ?? '/';

  const handleContentTypeChange = (v: SectionContentType) => {
    const ctaLink = formData.cta_link || suggestedCtaLink(v);
    setFormData(prev => ({ ...prev, content_type: v, cta_link: ctaLink, linked_item_ids: [] }));
  };

  /* ── Open/close dialog ───────────────────────────────────────── */
  const handleOpenAdd = () => {
    setEditingSection(null);
    setFormData({
      ...blankForm(sections.length + 1),
      module_mode: false
    });
    setPickerSearch("");
    setPickerOpen(false);
    setIsOpen(true);
  };

  const handleOpenEdit = (section: PlatformSection) => {
    setEditingSection(section);
    setFormData({ ...section });
    setPickerSearch("");
    setPickerOpen(false);
    setIsOpen(true);
  };

  /* ── Save ────────────────────────────────────────────────────── */
  const handleSave = () => {
    if (!formData.title_ar?.trim() || !formData.content_type) {
      toast({ title: "خطأ", description: "يرجى إكمال الحقول المطلوبة", variant: "destructive" });
      return;
    }

    // Auto-derive cta_link if still empty or still placeholder
    let cta_link = formData.cta_link || "";
    if (!cta_link || cta_link === "/section/NEW") {
      cta_link = editingSection
        ? `/section/${editingSection.id}`
        : DEFAULT_CTA_LINKS[formData.content_type!] || "/";
    }

    const payload = { ...formData, cta_link } as PlatformSection;

    if (editingSection) {
      sectionsRepo.update(editingSection.id, payload);
      toast({ title: "تم التحديث" });
    } else {
      const created = sectionsRepo.create(payload);
      // Fix /section/NEW now we have the real ID
      if (payload.content_type === 'mixed' && cta_link === '/') {
        sectionsRepo.update(created.id, { cta_link: `/section/${created.id}` });
      }
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

  /* ───────────────────────────────────────────────────────────────
     Render
     ─────────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <LayoutPanelLeft className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">مدير أقسام المنصة</h1>
            <p className="text-muted-foreground text-sm">
              كل قسم لديه نوع محتوى، طريقة تعبئة، وعناصر حقيقية — لا مجرد بطاقات شكلية.
            </p>
          </div>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 h-11 px-6 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> إضافة قسم جديد
        </Button>
      </div>

      {/* Info banner */}
      <div className="rounded-xl bg-primary/5 border border-primary/15 p-4 flex gap-3 items-start text-sm">
        <Zap className="h-5 w-5 text-primary shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-foreground">كيف يعمل مدير الأقسام الوظيفي؟</p>
          <p className="text-muted-foreground leading-relaxed">
            أعطِ القسم أي اسم تريد (مثل «كورسات الطبخ»)، ثم حدّد نوع المحتوى الداخلي (كورسات / مسارات / أدوات...).
            في الوضع التلقائي تُجلب أحدث العناصر المنشورة تلقائيًا، وفي الوضع اليدوي تختار العناصر بنفسك.
            زر CTA يوجّه المستخدم إلى صفحة القائمة المناسبة فعليًا.
          </p>
        </div>
      </div>

      {/* Sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section) => (
          <Card
            key={section.id}
            className={`${!section.is_active ? 'opacity-60 border-dashed grayscale-[0.4]' : ''} group transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/20 relative overflow-hidden bg-card/60 backdrop-blur-sm`}
          >
            {/* action buttons */}
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
              {/* Content type + population mode */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs font-semibold text-primary">
                  {contentTypeLabels[section.content_type] || section.content_type}
                </Badge>
                <Badge variant="secondary" className="text-xs gap-1">
                  {section.population_mode === 'manual' ? (
                    <><List className="h-3 w-3" /> يدوي ({section.linked_item_ids?.length ?? 0} عنصر)</>
                  ) : (
                    <><Zap className="h-3 w-3" /> تلقائي</>
                  )}
                </Badge>
                {section.display_style && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    <Package className="h-3 w-3 mr-1" />
                    {displayStyleLabels[section.display_style]}
                  </Badge>
                )}
              </div>

              {/* CTA info */}
              <div className="p-3 rounded-lg bg-muted/40 border border-muted text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">الرابط الموجه:</span>
                  <span className="font-mono text-primary font-bold truncate max-w-[140px]">
                    {section.cta_link || DEFAULT_CTA_LINKS[section.content_type]}
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

              {/* Toggle + order */}
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

      {/* ──────────────────────────────────────────────────────
          Dialog — Add / Edit
          ────────────────────────────────────────────────────── */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl bg-background/95 backdrop-blur-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              {editingSection ? <Edit className="h-6 w-6 text-primary" /> : <Plus className="h-6 w-6 text-primary" />}
              {editingSection ? "تعديل القسم" : "إضافة قسم جديد"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">

            {/* ── Block 1: Display info ──────────────────────────── */}
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">معلومات العرض</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">اسم القسم (عربي) *</Label>
                  <Input
                    value={formData.title_ar}
                    onChange={e => setFormData({ ...formData, title_ar: e.target.value })}
                    placeholder="مثال: كورسات الطبخ، أدوات التصميم، أخبار الذكاء الاصطناعي..."
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">الاسم ظاهر للمستخدم — منفصل تمامًا عن نوع المحتوى الداخلي</p>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">الوصف التعريفي</Label>
                  <Textarea
                    value={formData.description_ar}
                    onChange={e => setFormData({ ...formData, description_ar: e.target.value })}
                    placeholder="اكتب وصفاً جذاباً..."
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

            {/* ── Block 1.5: Module Mode ──────────────────────────── */}
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">وضع الاستقلالية</p>
              <div className="flex flex-row items-center justify-between rounded-lg border border-border p-4 mb-6">
                <div className="space-y-0.5">
                  <Label className="text-base font-bold text-primary">نظام الموديول المستقل (Admin Module)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    تفعيل هذا الخيار يحوّل القسم إلى قسم إداري مستقل في القائمة الجانبية لإدارة محتواه الخاص بمعزل عن المحتوى العام.
                  </p>
                </div>
                <Switch
                  checked={formData.module_mode || false}
                  onCheckedChange={(checked) => setFormData({ ...formData, module_mode: checked })}
                />
              </div>
            </div>

            <Separator />

            {/* ── Block 2: Content behavior ─────────────────────── */}
            <div>
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">سلوك المحتوى</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="space-y-2">
                  <Label className="text-sm font-bold">نوع المحتوى الداخلي *</Label>
                  <Select
                    value={formData.content_type}
                    onValueChange={(v: SectionContentType) => handleContentTypeChange(v)}
                  >
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(contentTypeLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">يحدّد من أي مستودع تأتي العناصر — الاسم الظاهر منفصل عنه</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">طريقة التعبئة</Label>
                  <Select
                    value={formData.population_mode}
                    onValueChange={(v: SectionPopulationMode) => setFormData({ ...formData, population_mode: v })}
                  >
                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(populationLabels).map(([val, label]) => (
                        <SelectItem key={val} value={val}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-bold">أسلوب العرض</Label>
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

                <div className="space-y-2">
                  <Label className="text-sm font-bold">الحد الأقصى للعناصر المعروضة</Label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={formData.max_items ?? 6}
                    onChange={e => setFormData({ ...formData, max_items: parseInt(e.target.value) || 6 })}
                    className="h-11"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-sm font-bold">رسالة الحالة الفارغة (اختيارية)</Label>
                  <Input
                    value={formData.empty_state_text ?? ""}
                    onChange={e => setFormData({ ...formData, empty_state_text: e.target.value })}
                    placeholder="مثال: لا توجد عناصر متاحة حالياً، سيتم الإضافة قريباً"
                    className="h-11"
                  />
                </div>
              </div>

              {/* ── Manual item picker (only when mode=manual) ── */}
              {formData.population_mode === 'manual' && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold">
                      اختيار العناصر يدويًا
                      {selectedIds.length > 0 && (
                        <Badge className="mr-2 text-xs">{selectedIds.length} محدد</Badge>
                      )}
                    </Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      onClick={() => setPickerOpen(!pickerOpen)}
                    >
                      {pickerOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      {pickerOpen ? "إخفاء القائمة" : "عرض القائمة"}
                    </Button>
                  </div>

                  {pickerOpen && (
                    <div className="rounded-xl border border-border bg-card overflow-hidden">
                      {/* Search */}
                      <div className="p-3 border-b border-border flex gap-2 items-center">
                        <Search className="h-4 w-4 text-muted-foreground shrink-0" />
                        <Input
                          value={pickerSearch}
                          onChange={e => setPickerSearch(e.target.value)}
                          placeholder="ابحث في العناصر..."
                          className="h-8 text-sm border-none shadow-none focus-visible:ring-0 p-0"
                        />
                      </div>

                      {candidates.length === 0 ? (
                        <p className="text-center p-6 text-sm text-muted-foreground">
                          لا توجد عناصر منشورة في هذا النوع من المحتوى بعد. أضف عناصر من الأقسام المخصصة لها في لوحة الإدارة.
                        </p>
                      ) : (
                        <ScrollArea className="h-56">
                          <div className="p-2 space-y-1">
                            {filteredCandidates.map(c => {
                              const isSelected = selectedIds.includes(c.id);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => toggleItem(c.id)}
                                  className={`w-full text-right px-3 py-2.5 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                                    isSelected
                                      ? 'bg-primary/10 border border-primary/30'
                                      : 'hover:bg-muted/60'
                                  }`}
                                >
                                  <div className={`h-5 w-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                    isSelected ? 'bg-primary border-primary' : 'border-border'
                                  }`}>
                                    {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{c.label}</p>
                                    {c.sub && <p className="text-xs text-muted-foreground truncate">{c.sub}</p>}
                                  </div>
                                  <Badge variant="outline" className="text-xs shrink-0">{c.badge}</Badge>
                                </button>
                              );
                            })}
                          </div>
                        </ScrollArea>
                      )}
                    </div>
                  )}

                  {/* Selected items summary */}
                  {selectedIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedIds.map(id => {
                        const found = candidates.find(c => c.id === id);
                        return found ? (
                          <span key={id} className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-1">
                            {found.label}
                            <button type="button" onClick={() => toggleItem(id)} className="hover:text-destructive">
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* ── Block 3: CTA / Visibility ─────────────────────── */}
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
                    placeholder={`سيُستخدم تلقائيًا: ${suggestedCtaLink(formData.content_type ?? 'tools')}`}
                    className="h-11 font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">اتركه فارغًا ليتمّ المل تلقائيًا حسب نوع المحتوى</p>
                </div>

                <div className="md:col-span-2 p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-foreground">عرض في المنصة</p>
                    <p className="text-[10px] text-muted-foreground italic">تفعيل ظهور هذا القسم للجمهور</p>
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
            <Button onClick={handleSave} className="h-11 px-8 shadow-lg shadow-primary/20">حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
