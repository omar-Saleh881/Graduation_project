import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  domainsRepo, 
  coursesRepo, 
  pathsRepo, 
  articlesRepo, 
  toolsRepo 
} from "@/lib/data/repository";
import { Domain } from "@/types/domain";
import { ArrowRight, BookOpen, FileText, Wrench, Layout, ChevronLeft, Sparkles } from "lucide-react";

export default function DomainListing() {
  const { slug } = useParams<{slug: string}>();
  const [domain, setDomain] = useState<Domain | null>(null);
  
  // Content
  const [courses, setCourses] = useState<any[]>([]);
  const [paths, setPaths] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    const d = domainsRepo.getAll().find(item => item.slug === slug);
    if (d) {
      setDomain(d);
      
      // Filter content by domain name or keywords (simple mapping for demo)
      // In a real app, items would have a domain_id
      const allCourses = coursesRepo.getAll();
      const allPaths = pathsRepo.getAll();
      const allArticles = articlesRepo.getAll();
      const allTools = toolsRepo.getAll();

      // For the demo, we'll show items that match the domain name in their category or title
      // or just show a subset if no match
      const filteredCourses = allCourses.filter(c => 
        c.category?.includes(d.name_ar) || d.name_ar.includes(c.category || "")
      );
      const filteredPaths = allPaths.filter(p => 
        p.category?.includes(d.name_ar) || d.name_ar.includes(p.category || "")
      );

      setCourses(filteredCourses.length > 0 ? filteredCourses : allCourses.slice(0, 3));
      setPaths(filteredPaths.length > 0 ? filteredPaths : allPaths.slice(0, 2));
      setArticles(allArticles.slice(0, 4));
      setTools(allTools.slice(0, 4));
    }
  }, [slug]);

  if (!domain) return <div className="p-20 text-center">جاري تحميل النطاق...</div>;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Header Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background border-b pt-16 pb-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-6 mb-6">
              <span className="text-6xl">{domain.icon || "🌐"}</span>
              <div className="text-right">
                <Badge className="mb-2">نطاق مخصص</Badge>
                <h1 className="text-4xl font-bold text-foreground mb-2">{domain.name_ar}</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">{domain.description_ar}</p>
              </div>
            </div>
            
            <div className="flex gap-4 mt-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border">
                <Layout className="h-4 w-4" />
                {courses.length} كورسات
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border">
                <BookOpen className="h-4 w-4" />
                {paths.length} مسارات
              </div>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            {/* Learning Paths */}
            {domain.content_types.includes('paths') && (
              <div className="mb-16">
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="h-6 w-6 text-primary" />
                    المسارات التعليمية في {domain.name_ar}
                  </h2>
                  <Link to="/paths" className="text-primary text-sm font-bold flex items-center gap-1">
                    تصفح كل المسارات <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {paths.map(path => (
                    <Link key={path.id} to={`/paths/${path.slug}`}>
                      <Card className="group overflow-hidden border-border/50 hover:border-primary/30 transition-all hover:shadow-xl">
                        <CardHeader className="p-6 pb-2">
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-4xl">{path.icon || "🎓"}</span>
                            <Badge variant="secondary">{path.level === 'beginner' ? 'مبتدئ' : 'متقدم'}</Badge>
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">{path.title_ar}</CardTitle>
                          <CardDescription className="line-clamp-2 mt-2">{path.description_ar}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-6 pt-2">
                          <div className="flex items-center justify-between text-sm text-muted-foreground mt-4 border-t pt-4">
                            <span>{path.steps_count} خطوة تعليمية</span>
                            <Button variant="ghost" size="sm" className="gap-2 group-hover:pr-4 transition-all">
                              ابدأ الآن <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Courses */}
            {domain.content_types.includes('courses') && (
              <div className="mb-16">
                <div className="flex justify-between items-end mb-8">
                  <h2 className="text-2xl font-bold">كورسات مقترحة</h2>
                  <Link to="/courses" className="text-primary text-sm font-bold flex items-center gap-1">
                    كل الكورسات <ChevronLeft className="h-4 w-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {courses.map(course => (
                    <Link key={course.id} to={`/courses/${course.slug}`}>
                      <Card className="h-full border-border/50 hover:shadow-lg transition-all">
                        <div className="h-32 bg-primary/5 flex items-center justify-center border-b italic text-primary/40">
                           {course.title_ar}
                        </div>
                        <CardHeader className="p-4">
                          <CardTitle className="text-lg line-clamp-1">{course.title_ar}</CardTitle>
                          <CardDescription className="line-clamp-2 text-xs">{course.description_ar}</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                           <Badge variant="outline" className="text-[10px]">{course.level}</Badge>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
               {/* Articles */}
               {domain.content_types.includes('articles') && (
                 <div>
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
                     <FileText className="h-5 w-5 text-blue-500" /> مقالات النطاق
                   </h3>
                   <div className="space-y-4">
                     {articles.map(article => (
                       <Link key={article.id} to={`/article/${article.slug}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all">
                         <div className="h-12 w-12 rounded bg-muted flex items-center justify-center shrink-0">📄</div>
                         <div>
                           <h4 className="font-bold text-sm line-clamp-1">{article.title_ar}</h4>
                           <p className="text-xs text-muted-foreground line-clamp-1">{article.excerpt_ar}</p>
                         </div>
                       </Link>
                     ))}
                   </div>
                 </div>
               )}

               {/* Tools */}
               {domain.content_types.includes('tools') && (
                 <div>
                   <h3 className="text-xl font-bold mb-6 flex items-center gap-2 border-b pb-2">
                     <Wrench className="h-5 w-5 text-orange-500" /> أدوات ذكية
                   </h3>
                   <div className="grid grid-cols-2 gap-4">
                     {tools.map(tool => (
                       <Link key={tool.id} to={`/tool/${tool.id}`} className="p-4 rounded-xl border border-border bg-card hover:shadow-md transition-all text-center">
                          <div className="text-3xl mb-2">{tool.icon || "🛠️"}</div>
                          <h4 className="font-bold text-sm mb-1">{tool.name}</h4>
                          <Badge variant="outline" className="text-[9px]">{tool.category}</Badge>
                       </Link>
                     ))}
                   </div>
                 </div>
               )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
