import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Globe, Save, X, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { domainsRepo } from "@/lib/data/repository";
import { Domain } from "@/types/domain";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function ManageDomains() {
  const { toast } = useToast();
  const [domains, setDomains] = useState<Domain[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  
  const [formData, setFormData] = useState<Partial<Domain>>({
    name_ar: "",
    slug: "",
    description_ar: "",
    icon: "🌐",
    is_active: true,
    content_types: ['courses', 'paths'],
    order: 0
  });

  const loadDomains = () => {
    const all = domainsRepo.getAll().sort((a, b) => a.order - b.order);
    setDomains(all);
  };

  useEffect(() => {
    loadDomains();
  }, []);

  const handleOpenAdd = () => {
    setEditingDomain(null);
    setFormData({
      name_ar: "",
      slug: "",
      description_ar: "",
      icon: "🌐",
      is_active: true,
      content_types: ['courses', 'paths'],
      order: domains.length + 1
    });
    setIsOpen(true);
  };

  const handleOpenEdit = (domain: Domain) => {
    setEditingDomain(domain);
    setFormData({ ...domain });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!formData.name_ar || !formData.slug) {
      toast({ title: "خطأ", description: "يرجى إكمال الحقول المطلوبة", variant: "destructive" });
      return;
    }

    if (editingDomain) {
      domainsRepo.update(editingDomain.id, formData as any);
      toast({ title: "تم التحديث", description: "تم تحديث بيانات النطاق بنجاح" });
    } else {
      domainsRepo.create({
        ...formData,
        created_at: new Date().toISOString()
      } as any);
      toast({ title: "تم الإضافة", description: "تم إضافة النطاق الجديد للمنصة" });
    }

    setIsOpen(false);
    loadDomains();
  };

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا النطاق؟ لن يتم حذف المحتوى المرتبط به ولكن لن يظهر كقسم منفصل.")) {
      domainsRepo.delete(id);
      loadDomains();
      toast({ title: "تم الحذف" });
    }
  };

  const toggleStatus = (domain: Domain) => {
    domainsRepo.update(domain.id, { is_active: !domain.is_active });
    loadDomains();
  };

  const contentTypeLabels: Record<string, string> = {
    courses: "الكورسات",
    paths: "المسارات",
    articles: "المقالات",
    tools: "الأدوات"
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">نطاقات المنصة (Domains)</h1>
          <p className="text-muted-foreground">قم بإدارة الأقسام الرئيسية للمنصة وأنواع المحتوى التي تظهر في كل قسم.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus className="h-4 w-4" /> إضافة نطاق جديد
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <Card key={domain.id} className={`${!domain.is_active ? 'opacity-60 border-dashed' : 'border-border'} transition-all hover:shadow-md relative overflow-hidden`}>
            {!domain.is_active && (
              <div className="absolute top-2 left-2">
                <Badge variant="outline" className="bg-background/80">غير نشط</Badge>
              </div>
            )}
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <span className="text-4xl mb-2">{domain.icon || "🌐"}</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(domain)}><Edit className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(domain.id)} className="text-red-500 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <CardTitle>{domain.name_ar}</CardTitle>
              <CardDescription className="line-clamp-2">{domain.description_ar}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {domain.content_types.map(type => (
                    <Badge key={type} variant="secondary" className="text-[10px] font-medium">
                      {contentTypeLabels[type]}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between pt-2 border-t text-sm">
                  <div className="flex items-center gap-2">
                    <Switch checked={domain.is_active} onCheckedChange={() => toggleStatus(domain)} />
                    <span>{domain.is_active ? "نشط حالياً" : "معطل"}</span>
                  </div>
                  <span className="text-muted-foreground">الترتيب: {domain.order}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDomain ? "تعديل النطاق" : "إضافة نطاق جديد"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>اسم النطاق (عربي)</Label>
                <Input value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} placeholder="مثال: الذكاء الاصطناعي" />
              </div>
              <div className="space-y-2">
                <Label>الاسم اللطيف (Slug) - بالإنجليزية</Label>
                <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} placeholder="ai-machine-learning" />
              </div>
              <div className="space-y-2">
                <Label>الوصف</Label>
                <Input value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>الأيقونة (Emoji)</Label>
                <Input value={formData.icon} onChange={e => setFormData({...formData, icon: e.target.value})} className="text-2xl h-12 w-20 text-center" />
              </div>
            </div>

            <div className="space-y-6 border-r pr-4">
              <div className="space-y-3">
                <Label>أنواع المحتوى المدعومة</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(contentTypeLabels).map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Checkbox 
                        id={`type-${key}`} 
                        checked={formData.content_types?.includes(key as any)}
                        onCheckedChange={(checked) => {
                          const current = formData.content_types || [];
                          if (checked) {
                            setFormData({...formData, content_types: [...current, key as any]});
                          } else {
                            setFormData({...formData, content_types: current.filter(t => t !== key)});
                          }
                        }}
                      />
                      <label htmlFor={`type-${key}`} className="text-sm font-medium leading-none cursor-pointer">
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>حالة النطاق</Label>
                  <Switch 
                    checked={formData.is_active} 
                    onCheckedChange={(checked) => setFormData({...formData, is_active: checked})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>ترتيب الظهور</Label>
                  <Input type="number" value={formData.order} onChange={e => setFormData({...formData, order: parseInt(e.target.value) || 0})} />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>إلغاء</Button>
            <Button onClick={handleSave}>حفظ التغييرات</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
