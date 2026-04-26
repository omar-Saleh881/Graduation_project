import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toolsRepo } from "@/lib/data/repository";
import { Tool } from "@/types/tool";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ManageTools = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const { sectionId } = useParams<{ sectionId?: string }>();
  const queryClient = useQueryClient();
  
  // Form state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "", category: "", status: "published", url: ""
  });

  const loadTools = () => {
    setTools(
      toolsRepo.getAll()
        .filter(t => sectionId ? t.section_id === sectionId : !t.section_id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );
    queryClient.invalidateQueries({ queryKey: ["tools"] });
    queryClient.invalidateQueries({ queryKey: ["tool"] });
  };

  useEffect(() => {
    loadTools();
  }, [sectionId]);

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذه الأداة؟")) {
      toolsRepo.delete(id);
      loadTools();
      toast({ title: "تم الحذف بنجاح" });
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingId(tool.id);
    setFormData({
      name: tool.name, 
      category: tool.category, 
      status: tool.status, 
      url: tool.website_url
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      toolsRepo.update(editingId, {
        name: formData.name,
        category: formData.category,
        status: formData.status,
        website_url: formData.url
      });
      toast({ title: "تم التعديل بنجاح" });
    } else {
      toolsRepo.create({
        name: formData.name,
        category: formData.category,
        status: formData.status,
        website_url: formData.url,
        handle: formData.name.toLowerCase().replace(/\s+/g, '-'),
        description_ar: "أداة ذكاء اصطناعي...",
        description_en: "",
        summary_ar: "",
        tags: [],
        pricing_model: "freemium",
        target_audience: "الجميع",
        difficulty_level: 1,
        is_featured: false,
        votes_count: 0,
        is_active: formData.status === "published",
        created_at: new Date().toISOString(),
        logo_url: "",
        section_id: sectionId
      });
      toast({ title: "تمت الإضافة بنجاح" });
    }
    setIsDialogOpen(false);
    loadTools();
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: "", category: "عام", status: "published", url: "" });
    setIsDialogOpen(true);
  };

  const filteredTools = tools.filter((tool) =>
    (tool.name && tool.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (tool.category && tool.category.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">إدارة الأدوات</h1>
          <p className="text-muted-foreground">أضف، عدل، واحذف أدوات الذكاء الاصطناعي من المنصة.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0" onClick={openNew}>
              <Plus className="h-4 w-4" />
              إضافة أداة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل الأداة" : "إضافة أداة جديدة"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>الاسم</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="مثال: ChatGPT" />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="مثال: كتابة ومحادثة" />
              </div>
              <div className="space-y-2">
                <Label>الرابط</Label>
                <Input value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} placeholder="https://..." dir="ltr" />
              </div>
              <div className="space-y-2">
                <Label>الحالة</Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.status} 
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="published">منشور</option>
                  <option value="draft">مسودة</option>
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
              placeholder="ابحث عن أداة..."
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
                  <th className="px-6 py-3 font-medium">اسم الأداة</th>
                  <th className="px-6 py-3 font-medium">التصنيف</th>
                  <th className="px-6 py-3 font-medium">الحالة</th>
                  <th className="px-6 py-3 font-medium">الزيارات</th>
                  <th className="px-6 py-3 font-medium text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{tool.name}</td>
                    <td className="px-6 py-4">{tool.category}</td>
                    <td className="px-6 py-4">
                      <Badge variant={tool.status === "published" || tool.status === "نشط" ? "default" : "secondary"}>
                        {tool.status === "published" ? "منشور" : tool.status === "draft" ? "مسودة" : tool.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{tool.votes_count?.toLocaleString() || 0}</td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Button onClick={() => handleEdit(tool)} variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(tool.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredTools.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      لا توجد أدوات مطابقة لبحثك.
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

export default ManageTools;
