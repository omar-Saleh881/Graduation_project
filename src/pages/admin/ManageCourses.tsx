import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { coursesRepo } from "@/lib/data/repository";
import { Course } from "@/types/builder";

export default function ManageCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { sectionId } = useParams<{ sectionId?: string }>();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ title_ar: "", category: "", description_ar: "" });

  const loadCourses = () => {
    setCourses(
      coursesRepo.getAll()
        .filter(c => sectionId ? c.section_id === sectionId : !c.section_id) // If undefined, it will only match global courses!
        .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    );
  };

  useEffect(() => { loadCourses(); }, []);

  const handleSave = () => {
    const slug = formData.title_ar.toLowerCase().replace(/\s+/g, '-');
    const newCourse = coursesRepo.create({
      title_ar: formData.title_ar,
      category: formData.category,
      description_ar: formData.description_ar,
      slug,
      level: "beginner",
      is_published: false,
      created_at: new Date().toISOString(),
      section_id: sectionId
    });
    toast({ title: "تم إنشاء الكورس بنجاح" });
    setIsDialogOpen(false);
    loadCourses();
    const basePath = sectionId ? `/admin/sections/${sectionId}/courses` : `/admin/courses`;
    navigate(`${basePath}/${newCourse.id}/builder`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("حذف الكورس نهائياً؟")) {
      coursesRepo.delete(id);
      loadCourses();
      toast({ title: "تم الحذف" });
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">إدارة الكورسات</h1>
          <p className="text-muted-foreground">قم بإدراج دورات تعليمية مفصلة تحتوي على وحدات ودروس</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="h-4 w-4"/> إنشاء كورس منفصل</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>تسجيل كورس مسودّة</DialogTitle></DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>عنوان الكورس</Label>
                <Input value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} placeholder="الذكاء الاصطناعي للمطورين..." />
              </div>
              <div className="space-y-2">
                <Label>التصنيف</Label>
                <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>وصف مبسط</Label>
                <Input value={formData.description_ar} onChange={e => setFormData({...formData, description_ar: e.target.value})} />
              </div>
              <Button onClick={handleSave} className="w-full">موافق، افتح الباني</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {courses.map(course => (
          <Card key={course.id} className="group relative">
            <CardContent className="p-6">
              <h3 className="font-bold text-xl mb-2">{course.title_ar}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description_ar}</p>
              
              <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={() => handleDelete(course.id)} className="h-8 w-8 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <Link to={sectionId ? `/admin/sections/${sectionId}/courses/${course.id}/builder` : `/admin/courses/${course.id}/builder`}>
                  <Button size="sm" className="gap-2">افتح الباني <ArrowLeft className="h-3 w-3" /></Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {courses.length === 0 && <div className="text-center p-12 bg-card rounded-lg border border-dashed border-border text-muted-foreground">لا توجد كورسات حالياً. ابدأ بإنشاء كورس جديد.</div>}
    </div>
  );
}
