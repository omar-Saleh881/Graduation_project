import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { pathsRepo } from "@/lib/data/repository";
import { LearningPath } from "@/types/learning-path";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const ManagePaths = () => {
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title_ar: "", category: "", level: "beginner", is_published: true
  });

  const loadPaths = () => {
    setPaths(pathsRepo.getAll().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    queryClient.invalidateQueries({ queryKey: ["paths"] });
  };

  useEffect(() => {
    loadPaths();
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المسار؟")) {
      pathsRepo.delete(id);
      loadPaths();
      toast({ title: "تم الحذف بنجاح" });
    }
  };

  const handleEdit = (path: LearningPath) => {
    setEditingId(path.id);
    setFormData({
      title_ar: path.title_ar, 
      category: path.category,
      level: path.level,
      is_published: path.is_published
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      pathsRepo.update(editingId, {
        title_ar: formData.title_ar,
        category: formData.category,
        level: formData.level as any,
        is_published: formData.is_published
      });
      toast({ title: "تم التعديل بنجاح" });
    } else {
      pathsRepo.create({
        title_ar: formData.title_ar,
        category: formData.category,
        level: formData.level as any,
        is_published: formData.is_published,
        description_ar: "وصف المسار...",
        slug: formData.title_ar.toLowerCase().replace(/\s+/g, '-'),
        estimated_hours: 5,
        icon: "🎓",
        steps_count: 0,
        created_at: new Date().toISOString()
      });
      toast({ title: "تمت الإضافة بنجاح" });
    }
    setIsDialogOpen(false);
    loadPaths();
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ title_ar: "", category: "عام", level: "beginner", is_published: true });
    setIsDialogOpen(true);
  };

  const filteredPaths = paths.filter((p) =>
    (p.title_ar && p.title_ar.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (p.category && p.category.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">إدارة المسارات التعليمية</h1>
          <p className="text-muted-foreground">صمم ونظم مسارات تعلم للطلاب.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shrink-0" onClick={openNew}>
              <Plus className="h-4 w-4" />
              إضافة مسار جديد
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "تعديل المسار" : "إضافة مسار جديد"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>عنوان المسار</Label>
                <Input value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} placeholder="أدخل العنوان..." />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="مثال: ذكاء اصطناعي" />
              </div>
              <div className="space-y-2">
                <Label>المستوى</Label>
                <select 
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm"
                  value={formData.level} 
                  onChange={e => setFormData({...formData, level: e.target.value})}
                >
                  <option value="beginner">مبتدئ</option>
                  <option value="intermediate">متوسط</option>
                  <option value="advanced">متقدم</option>
                </select>
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
              placeholder="ابحث عن مسار..."
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
                  <th className="px-6 py-3 font-medium">المستوى</th>
                  <th className="px-6 py-3 font-medium">خطوات</th>
                  <th className="px-6 py-3 font-medium">الحالة</th>
                  <th className="px-6 py-3 font-medium text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPaths.map((path) => (
                  <tr key={path.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 font-medium text-foreground">{path.title_ar}</td>
                    <td className="px-6 py-4">{path.category}</td>
                    <td className="px-6 py-4">
                      {path.level === "beginner" ? "مبتدئ" : path.level === "intermediate" ? "متوسط" : "متقدم"}
                    </td>
                    <td className="px-6 py-4">{path.steps_count}</td>
                    <td className="px-6 py-4">
                      <Badge variant={path.is_published ? "default" : "secondary"}>
                        {path.is_published ? "منشور" : "مسودة"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-left">
                      <div className="flex items-center justify-end gap-2">
                        <Link to={`/admin/paths/${path.id}/builder`}>
                          <Button variant="outline" size="sm" className="gap-2 border-primary/50 text-primary">
                            الباني <ArrowLeft className="h-3 w-3" />
                          </Button>
                        </Link>
                        <Button onClick={() => handleEdit(path)} variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(path.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredPaths.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      لا توجد مسارات مطابقة لبحثك.
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

export default ManagePaths;
