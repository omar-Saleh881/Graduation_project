import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Image as ImageIcon, ExternalLink, User, Clock, CheckCircle2, AlertCircle, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { articlesRepo } from "@/lib/data/repository";
import { Article } from "@/types/article";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const ManageArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Article>>({
    title_ar: "", 
    category: "", 
    is_published: true, 
    author_name: "فريق المنصة", 
    cover_image: "", 
    excerpt_ar: "", 
    content_ar: "",
    read_time_minutes: 5
  });

  const loadArticles = () => {
    setArticles(articlesRepo.getAll().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    queryClient.invalidateQueries({ queryKey: ["articles"] });
  };

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = (id: string) => {
    if (window.confirm("هل أنت متأكد من حذف هذا المقال بصورة نهائية؟")) {
      articlesRepo.delete(id);
      loadArticles();
      toast({ title: "تم الحذف بنجاح" });
    }
  };

  const handleEdit = (article: Article) => {
    setEditingId(article.id);
    setFormData({ ...article });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.title_ar) return;

    if (editingId) {
      articlesRepo.update(editingId, formData as any);
      toast({ title: "تم تحديث المقال بنجاح" });
    } else {
      articlesRepo.create({
        ...formData,
        slug: formData.title_ar?.toLowerCase().replace(/\s+/g, '-') || `article-${Date.now()}`,
        author_name: formData.author_name || "فريق المنصة",
        tags: [],
        published_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      } as any);
      toast({ title: "تمت إضافة المقال بنجاح" });
    }
    setIsDialogOpen(false);
    loadArticles();
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ 
      title_ar: "", 
      category: "عام", 
      is_published: true, 
      author_name: "فريق المنصة", 
      cover_image: "", 
      excerpt_ar: "", 
      content_ar: "",
      read_time_minutes: 5
    });
    setIsDialogOpen(true);
  };

  const filteredArticles = articles.filter((a) =>
    (a.title_ar && a.title_ar.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (a.category && a.category.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-foreground">المقالات والمدونة</h1>
          <p className="text-muted-foreground mt-1">قم بإدارة المحتوى المعرفي للمنصة.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 h-11 px-6 shadow-lg shadow-primary/20" onClick={openNew}>
              <Plus className="h-5 w-5" />
              إرساء مقال جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur-md shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                 {editingId ? "تعديل محتوى المقال" : "كتابة مقال جديد"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 py-6">
              
              <div className="lg:col-span-2 space-y-6">
                <div className="space-y-2 text-right">
                  <Label className="font-bold flex items-center justify-end gap-2 text-primary">عنوان المقال <AlertCircle className="h-3 w-3" /></Label>
                  <Input value={formData.title_ar} onChange={e => setFormData({...formData, title_ar: e.target.value})} placeholder="أدخل العنوان المثير هنا..." className="h-12 text-lg font-bold" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 text-right">
                    <Label className="font-bold">التصنيف</Label>
                    <Input value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} placeholder="مثال: ذكاء اصطناعي" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Label className="font-bold">اسم الكاتب</Label>
                    <Input value={formData.author_name} onChange={e => setFormData({...formData, author_name: e.target.value})} />
                  </div>
                </div>

                <div className="space-y-2 text-right">
                  <Label className="font-bold">وصف مختصر (Excerpt)</Label>
                  <Textarea value={formData.excerpt_ar} onChange={e => setFormData({...formData, excerpt_ar: e.target.value})} placeholder="ملخص يظهر في صفحة القائمة..." rows={2} className="resize-none" />
                </div>

                <div className="space-y-2 text-right">
                  <Label className="font-bold">المحتوى الكامل (Markdown)</Label>
                  <Textarea 
                    className="min-h-[300px] leading-loose text-lg"
                    value={formData.content_ar}
                    onChange={e => setFormData({...formData, content_ar: e.target.value})}
                    placeholder="ابدأ بكتابة إبداعك... يدعم التنسيق النصي."
                  />
                </div>
              </div>

              <div className="space-y-6 lg:border-r lg:pr-8 border-border/50">
                <div className="space-y-3">
                   <Label className="font-bold flex justify-end">صورة الغلاف</Label>
                   <div className="aspect-video rounded-2xl bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden group relative">
                      {formData.cover_image ? (
                        <>
                          <img 
                            src={formData.cover_image} 
                            alt="Cover Preview" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "https://placehold.co/600x400?text=Invalid+Image+URL";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <Button variant="secondary" size="sm" onClick={() => (document.getElementById('cover-image-picker') as HTMLInputElement)?.click()} className="h-8 gap-1">
                                <ImageIcon className="h-3 w-3" /> تغيير
                             </Button>
                             <Button variant="destructive" size="sm" onClick={() => setFormData({...formData, cover_image: ""})} className="h-8 gap-1">
                                <Trash2 className="h-3 w-3" /> حذف
                             </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center text-muted-foreground/40 cursor-pointer w-full h-full justify-center hover:bg-muted/50 transition-colors" onClick={() => (document.getElementById('cover-image-picker') as HTMLInputElement)?.click()}>
                          <ImageIcon className="h-10 w-10 mb-2" />
                          <span className="text-[10px] font-bold uppercase">اضغط لرفع غلاف أو ضع رابطاً</span>
                        </div>
                      )}
                   </div>
                   <div className="flex gap-2">
                      <Input 
                        value={formData.cover_image} 
                        onChange={e => setFormData({...formData, cover_image: e.target.value})} 
                        placeholder="رابط الصورة (URL) هنا..." 
                        className="text-left ltr flex-1" 
                        dir="ltr" 
                      />
                      <Button variant="outline" size="icon" className="shrink-0 h-10 w-10" onClick={() => (document.getElementById('cover-image-picker') as HTMLInputElement)?.click()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                      <input 
                        type="file" 
                        id="cover-image-picker" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const url = URL.createObjectURL(file);
                            setFormData({...formData, cover_image: url});
                          }
                        }}
                      />
                   </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                   <div className="flex items-center justify-between text-right">
                      <Label className="font-bold">الحالة</Label>
                      <Badge variant={formData.is_published ? "default" : "outline"} className="cursor-pointer" onClick={() => setFormData({...formData, is_published: !formData.is_published})}>
                         {formData.is_published ? "منشور ومتاج" : "مسودة خاصة"}
                      </Badge>
                   </div>
                   
                   <div className="space-y-2 text-right">
                    <Label className="font-bold">وقت القراءة (دقائق)</Label>
                    <div className="flex items-center gap-3">
                       <Input type="number" value={formData.read_time_minutes} onChange={e => setFormData({...formData, read_time_minutes: parseInt(e.target.value) || 0})} className="text-center font-black h-11" />
                       <Clock className="text-muted-foreground h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10">
                   <h5 className="font-bold text-xs text-primary mb-2">تلميحات الإدارة</h5>
                   <ul className="text-[10px] space-y-2 text-muted-foreground">
                      <li className="flex items-start gap-2">
                         <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                         العناوين القوية تزيد نسبة النقر بنسبة 40%.
                      </li>
                      <li className="flex items-start gap-2">
                         <CheckCircle2 className="h-3 w-3 text-green-500 mt-0.5 shrink-0" />
                         استخدم صور غلاف عالية الجودة (16:9).
                      </li>
                   </ul>
                </div>
              </div>

            </div>
            <DialogFooter className="gap-2 border-t pt-4">
               <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-11 px-8">تجاهل</Button>
               <Button onClick={handleSave} className="h-11 px-12 shadow-xl shadow-primary/30 gap-2">
                 <Save className="h-4 w-4" />
                 حفظ المقال الآن
               </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="py-5 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث بالعنوان، الكاتب، أو المذكرة..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-4 pr-11 h-11 bg-background rounded-xl border-border/40 focus:ring-primary/20"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                <tr>
                  <th className="px-6 py-4">المقال</th>
                  <th className="px-6 py-4">الكاتب</th>
                  <th className="px-6 py-4">التصنيف</th>
                  <th className="px-6 py-4">الحالة</th>
                  <th className="px-6 py-4 text-left">التفاعل</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filteredArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-muted/10 transition-colors group">
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-muted border border-border/30 overflow-hidden shrink-0 shadow-inner">
                             {article.cover_image && <img src={article.cover_image} className="w-full h-full object-cover" />}
                          </div>
                          <div>
                             <div className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{article.title_ar}</div>
                             <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(article.created_at).toLocaleDateString('ar-EG')}</div>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <div className="flex items-center gap-2 justify-end">
                          <span className="font-medium">{article.author_name}</span>
                          <User className="h-3 w-3 text-muted-foreground" />
                       </div>
                    </td>
                    <td className="px-6 py-5">
                       <Badge variant="outline" className="text-[10px] font-medium border-border/60">{article.category}</Badge>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-end gap-2">
                        {article.is_published ? (
                           <>
                            <span className="text-[10px] font-bold text-green-600">منشور</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                           </>
                        ) : (
                          <>
                            <span className="text-[10px] font-bold text-amber-500">مسودة</span>
                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          </>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-left">
                      <div className="flex items-center justify-end gap-1 opacity-20 group-hover:opacity-100 transition-opacity">
                        <Link to={`/articles/${article.slug}`} target="_blank">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground"><ExternalLink className="h-4 w-4" /></Button>
                        </Link>
                        <Button onClick={() => handleEdit(article)} variant="ghost" size="icon" className="h-8 w-8 text-blue-500">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button onClick={() => handleDelete(article.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredArticles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-muted-foreground bg-muted/5">
                      <Search className="h-10 w-10 mx-auto mb-4 opacity-10" />
                      <p className="font-bold">لم نعثر على أي مقالات تطابق هذا البحث</p>
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

export default ManageArticles;
