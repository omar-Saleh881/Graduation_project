import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, Tag, FileText } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useArticle } from "@/hooks/use-articles";

const ArticleDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-96 rounded-lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">المقال غير موجود</h1>
          <Link to="/articles">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للمقالات
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground transition-colors">الرئيسية</Link>
            <span className="mx-1">/</span>
            <Link to="/articles" className="hover:text-foreground transition-colors">المقالات</Link>
            <span className="mx-1">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{article.title_ar}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-6">
                <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted border border-border shadow-sm relative group">
                  {article.cover_image ? (
                    <img 
                      src={article.cover_image} 
                      alt={article.title_ar} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/20 italic">
                      <FileText className="h-20 w-20 mb-4" />
                      <span className="text-lg">مقال تعليمي شامل</span>
                    </div>
                  )}
                  <Badge variant="secondary" className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm">{article.category}</Badge>
                </div>
                
                <div>
                  <h1 className="text-4xl font-bold text-foreground leading-tight">{article.title_ar}</h1>
                  <p className="mt-4 text-xl text-muted-foreground leading-relaxed font-medium">{article.excerpt_ar}</p>
                </div>
              </div>

              <Card>
                <CardContent className="p-6 md:p-8 prose-container">
                  <div className="text-foreground leading-relaxed whitespace-pre-line text-base">
                    {article.content_ar.split("\n").map((line, i) => {
                      if (line.startsWith("## ")) {
                        return <h2 key={i} className="text-xl font-bold text-foreground mt-6 mb-3">{line.replace("## ", "")}</h2>;
                      }
                      if (line.startsWith("### ")) {
                        return <h3 key={i} className="text-lg font-semibold text-foreground mt-5 mb-2">{line.replace("### ", "")}</h3>;
                      }
                      if (line.startsWith("- **")) {
                        const content = line.replace("- **", "").replace("**", "");
                        const parts = content.split(":");
                        return (
                          <div key={i} className="flex gap-2 mt-1">
                            <span className="text-primary">•</span>
                            <span><strong>{parts[0]}</strong>{parts.length > 1 ? ":" + parts.slice(1).join(":") : ""}</span>
                          </div>
                        );
                      }
                      if (line.startsWith("- ")) {
                        return (
                          <div key={i} className="flex gap-2 mt-1">
                            <span className="text-primary">•</span>
                            <span>{line.replace("- ", "")}</span>
                          </div>
                        );
                      }
                      if (line.trim() === "") return <div key={i} className="h-3" />;
                      return <p key={i} className="mt-2">{line}</p>;
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      وقت القراءة
                    </span>
                    <span className="text-sm font-medium text-foreground">{article.read_time_minutes} دقائق</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">الكاتب</span>
                    <span className="text-sm font-medium text-foreground">{article.author_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">تاريخ النشر</span>
                    <span className="text-sm font-medium text-foreground">
                      {new Date(article.published_at).toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {article.tags && article.tags.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      الوسوم
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ArticleDetails;
