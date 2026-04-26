import { useState } from "react";
import { Link } from "react-router-dom";
import { FileText, Search, SearchX } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useArticles, useArticleCategories } from "@/hooks/use-articles";

const Articles = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const { data: rawData, isLoading } = useArticles({ search: search || undefined, category, page });
  const { data: categories } = useArticleCategories();

  const data = rawData ? {
    ...rawData,
    articles: rawData.articles.filter(a => !a.section_id)
  } : undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-bl from-primary/10 via-background to-accent/5 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <FileText className="h-4 w-4" />
              مقالات تعليمية
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
              مقالات مبسّطة عن
              <span className="text-primary"> الذكاء الاصطناعي</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              اقرأ مقالات عربية مبسّطة تساعدك على فهم أدوات ومفاهيم الذكاء الاصطناعي
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl">
              <form onSubmit={handleSearch} className="flex gap-2 flex-1">
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="ابحث في المقالات..."
                  className="h-10 text-sm"
                />
                <Button type="submit" size="sm" className="shrink-0 gap-1.5">
                  <Search className="h-4 w-4" />
                  بحث
                </Button>
              </form>
              {categories && categories.length > 0 && (
                <Select
                  value={category ?? "all"}
                  onValueChange={(v) => { setCategory(v === "all" ? undefined : v); setPage(1); }}
                >
                  <SelectTrigger className="w-full sm:w-48 h-10">
                    <SelectValue placeholder="جميع التصنيفات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="pb-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : data && data.articles.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  عرض {data.articles.length} من {data.total} مقال
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.articles.map((article) => (
                    <Card key={article.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30 flex flex-col">
                      <Link to={`/article/${article.slug}`} className="block aspect-video overflow-hidden relative bg-muted/50">
                        {article.cover_image ? (
                          <img 
                            src={article.cover_image} 
                            alt={article.title_ar} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/30 italic transition-colors group-hover:bg-primary/5">
                            <FileText className="h-10 w-10 mb-2" />
                            <span className="text-xs">مقال تعليمي</span>
                          </div>
                        )}
                        <Badge className="absolute top-3 right-3 bg-background/80 backdrop-blur-sm text-foreground hover:bg-background border-border shadow-sm">
                          {article.category}
                        </Badge>
                      </Link>
                      <CardContent className="p-5 flex-1 flex flex-col">
                        <Link to={`/article/${article.slug}`}>
                          <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2 mb-2">
                            {article.title_ar}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                          {article.excerpt_ar}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{article.read_time_minutes} دقائق قراءة</span>
                          <Link to={`/article/${article.slug}`}>
                            <Button variant="ghost" size="sm">اقرأ المزيد</Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-8 flex flex-col items-center text-center py-8">
                <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">لا توجد مقالات</p>
                <p className="text-sm text-muted-foreground mt-1">لم نعثر على مقالات تطابق بحثك — جرّب كلمات مختلفة</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Articles;
