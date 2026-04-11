import { useState } from "react";
import { Library, Search, ExternalLink, SearchX } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContent, useContentCategories, useContentTypes } from "@/hooks/use-content";

const typeLabels: Record<string, string> = {
  course: "دورة",
  video: "فيديو",
  article: "مقال",
  book: "كتاب",
  podcast: "بودكاست",
  tool: "أداة",
};
const typeEmoji: Record<string, string> = {
  course: "🎓",
  video: "🎥",
  article: "📄",
  book: "📚",
  podcast: "🎙️",
  tool: "🛠️",
};

const ContentLibrary = () => {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data, isLoading } = useContent({ search: search || undefined, type, category });
  const { data: categories } = useContentCategories();
  const { data: types } = useContentTypes();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-bl from-accent/10 via-background to-primary/5 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-4">
              <Library className="h-4 w-4" />
              مكتبة المحتوى
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
              مصادر تعليمية
              <span className="text-primary"> مُنتقاة بعناية</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              دورات، فيديوهات، كتب، وأدوات من أفضل المصادر العالمية — مرتّبة ومُصنّفة لتسهيل رحلتك التعليمية
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row gap-3 max-w-3xl">
              <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 flex-1">
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث في المكتبة..."
                  className="h-10 text-sm"
                />
                <Button type="submit" size="sm" className="shrink-0 gap-1.5">
                  <Search className="h-4 w-4" />
                  بحث
                </Button>
              </form>
              {types && types.length > 0 && (
                <Select
                  value={type ?? "all"}
                  onValueChange={(v) => setType(v === "all" ? undefined : v)}
                >
                  <SelectTrigger className="w-full sm:w-40 h-10">
                    <SelectValue placeholder="جميع الأنواع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    {types.map((t) => (
                      <SelectItem key={t} value={t}>{typeLabels[t] || t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {categories && categories.length > 0 && (
                <Select
                  value={category ?? "all"}
                  onValueChange={(v) => setCategory(v === "all" ? undefined : v)}
                >
                  <SelectTrigger className="w-full sm:w-44 h-10">
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

        {/* Content Grid */}
        <section className="pb-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-52 rounded-lg" />
                ))}
              </div>
            ) : data && data.items.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-4">
                  عرض {data.items.length} من {data.total} مصدر
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {data.items.map((item) => (
                    <Card key={item.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <span className="text-2xl">{typeEmoji[item.type] || "📦"}</span>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                              {item.title_ar}
                            </h3>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                          {item.description_ar}
                        </p>
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="text-xs">{typeLabels[item.type] || item.type}</Badge>
                          <Badge variant="outline" className="text-xs">{item.category}</Badge>
                          {item.is_free && (
                            <Badge className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" variant="secondary">
                              مجاني
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">{item.provider} · {item.language}</span>
                          <a href={item.url} target="_blank" rel="noopener noreferrer">
                            <Button variant="outline" size="sm" className="gap-1.5">
                              افتح المصدر
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <div className="mt-8 flex flex-col items-center text-center py-8">
                <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">لا توجد نتائج</p>
                <p className="text-sm text-muted-foreground mt-1">لم نعثر على مصادر تطابق بحثك — جرّب كلمات أو فلاتر مختلفة</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContentLibrary;
