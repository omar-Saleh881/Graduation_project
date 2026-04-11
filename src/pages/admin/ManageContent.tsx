import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { contentRepo } from "@/lib/data/repository";
import { ContentResource } from "@/types/content";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ManageContent = () => {
  const [content, setContent] = useState<ContentResource[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_ar: "", category: "", type: "course", url: "", is_published: true
  });

  const loadContent = () => {
    setContent(contentRepo.getAll().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    queryClient.invalidateQueries({ queryKey: ["content"] });
  };

  useEffect(() => {
    loadContent();
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المحتوى؟")) {
      contentRepo.delete(id);
      loadContent();
      toast({ title: "تم الحذف بنجاح" });
    }
  };

  const handleEdit = (item: ContentResource) => {
    setEditingId(item.id);
    setFormData({
      title_ar: item.title_ar, 
      category: item.category,
      type: item.type,
      url: item.url,
      is_published: item.is_published
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      contentRepo.update(editingId, {
        title_ar: formData.title_ar,
        category: formData.category,
        type: formData.type as any,
        url: formData.url,
        is_published: formData.is_published
      });
      toast({ title: "تم التعديل بنجاح" });
    } else {
      contentRepo.create({
        title_ar: formData.title_ar,
        category: formData.category,
        type: formData.type as any,
        url: formData.url,
        is_published: formData.is_published,
        description_ar: "وصف المحتوى...",
        tags: [],
        provider: "مستقل",
        is_free: true,
        language: "عربي",
        created_at: new Date().toISOString()
      });
      toast({ title: "تمت الإضافة بنجاح" });
    }
    setIsDialogOpen(false);
    loadContent();
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ title_ar: "", category: "عام", type: "course", url: "", is_published: true });
    setIsDialogOpen(true);
  };

  const filteredContent = content.filter((c) =>
    (c.title_ar && c.title_ar.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.category && c.category.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">إدارة المكتبة</h1>
          <p className="text-muted-foreground">أضف محتوى من مصادر متعددة للمكتبة.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0" onClick={openNew}>
              <Plus className="h-4 w-4" />
              إضافة محتوى جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل المحتوى" : "إضافة محتوى جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} placeholder="أدخل العنوان..." />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="مثال: برمجة" />
              </div>
              <div className="space-y-2">
                <Label>النوع</Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.type} 
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="course">دورة</option>
                  <option value="video">فيديو</option>
                  <option value="article">مقال</option>
                  <option value="book">كتاب</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>الرابط</Label>
                <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.is_published ? "true" : "false"} 
                  onChange={e => setFormData({...formData, is_published: e.target.value === "true"})}
                >
                  <option value="true">منشور</option>
                  <option value="false">مسودة</option>
                </select>
              </div>
              <Button onClick={handleSave} className="w-full">حفظ</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-border">
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث عن محتوى..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-3 pr-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">العنوان</th>
                  <th className="px-6 py-3 font-medium">التصنيف</th>
                  <th className="px-6 py-3 font-medium">النوع</th>
                  <th className="px-6 py-3 font-medium">الحالة</th>
                  <th className="px-6 py-3 font-medium text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredContent.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{item.title_ar}</td>
                    <td className="px-6 py-4">{item.category}</td>
                    <td className="px-6 py-4">{item.type}</td>
                    <td className="px-6 py-4">
                      <Badge variant={item.is_published ? "default" : "secondary"}>
                        {item.is_published ? "منشور" : "مسودة"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleEdit(item)} variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(item.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredContent.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                      لا يوجد محتوى مطابق لبحثك.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageContent;
