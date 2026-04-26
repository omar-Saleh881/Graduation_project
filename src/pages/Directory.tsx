import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SearchX } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import SearchFilters from "@/components/SearchFilters";
import ToolsPagination from "@/components/ToolsPagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useTools } from "@/hooks/use-tools";
import type { ToolsQuery } from "@/types/tool";

const Directory = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState<ToolsQuery>({
    search: searchParams.get("search") ?? undefined,
    category: searchParams.get("category") ?? undefined,
    pricing_model: searchParams.get("pricing") ?? undefined,
    target_audience: searchParams.get("audience") ?? undefined,
    sort: (searchParams.get("sort") as ToolsQuery["sort"]) ?? "newest",
    page: Number(searchParams.get("page")) || 1,
  });

  const { data: rawData, isLoading } = useTools(query);

  const data = rawData ? {
    ...rawData,
    tools: rawData.tools.filter((t: any) => !t.section_id)
  } : undefined;

  const handleQueryChange = (partial: Partial<ToolsQuery>) => {
    const next = { ...query, ...partial };
    setQuery(next);
    const params = new URLSearchParams();
    if (next.search) params.set("search", next.search);
    if (next.category) params.set("category", next.category);
    if (next.pricing_model) params.set("pricing", next.pricing_model);
    if (next.target_audience) params.set("audience", next.target_audience);
    if (next.sort && next.sort !== "newest") params.set("sort", next.sort);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-bl from-primary/10 via-background to-accent/5 py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Search className="h-4 w-4" />
              دليل الأدوات
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
              استكشف منصات
              <span className="text-primary"> الذكاء الاصطناعي</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              تصفّح وابحث في مكتبة أدوات الذكاء الاصطناعي للعثور على الأداة المناسبة لمهامك بسهولة وسرعة.
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <SearchFilters query={query} onQueryChange={handleQueryChange} />

          {isLoading ? (
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-14 w-14 rounded-xl" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : data && data.tools.length > 0 ? (
            <>
              <p className="mt-6 text-sm text-muted-foreground">
                عرض {data.tools.length} من {data.total} أداة
              </p>
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.tools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
              <ToolsPagination
                page={data.page}
                totalPages={data.totalPages}
                onPageChange={(p) => handleQueryChange({ page: p })}
              />
            </>
          ) : (
            <div className="mt-16 flex flex-col items-center text-center py-8">
              <SearchX className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-foreground">لا توجد نتائج</p>
              <p className="text-sm text-muted-foreground mt-1">لم نعثر على أدوات تطابق بحثك — جرّب كلمات أو فلاتر مختلفة</p>
            </div>
          )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Directory;
