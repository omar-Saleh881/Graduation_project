import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, PackageOpen } from "lucide-react";
import { sectionsRepo, getSectionItems, getSectionCtaLink, SectionItem } from "@/lib/data/repository";
import { PlatformSection } from "@/types/platform-section";

/* ─────────────────────────────────────────────────────────────────────────────
   SectionListing — public page for /section/:id
   Shows all items belonging to a dynamic platform section.
   Handles mixed / manual / any content_type using the shared getSectionItems().
   ───────────────────────────────────────────────────────────────────────────── */

const SectionListing = () => {
  const { id } = useParams<{ id: string }>();
  const [section, setSection] = useState<PlatformSection | null>(null);
  const [items, setItems] = useState<SectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const found = sectionsRepo.getById(id);
    if (found) {
      setSection(found);
      // For listing page, use a higher limit (all items)
      const all = getSectionItems({ ...found, max_items: 100 });
      setItems(all);
    }
    setIsLoading(false);
  }, [id]);

  if (!isLoading && !section) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-24">
          <div className="text-center">
            <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground/30 mb-4" />
            <h1 className="text-2xl font-bold mb-2">القسم غير موجود</h1>
            <p className="text-muted-foreground mb-6">تعذّر إيجاد القسم المطلوب.</p>
            <Link to="/"><Button variant="outline">العودة للرئيسية</Button></Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">

        {/* Hero */}
        <section className="bg-gradient-to-bl from-primary/10 via-background to-accent/5 py-16">
          <div className="container mx-auto px-4 text-center">
            {isLoading ? (
              <div className="space-y-4 max-w-lg mx-auto">
                <Skeleton className="h-12 w-3/4 mx-auto rounded-full" />
                <Skeleton className="h-6 w-full rounded-full" />
              </div>
            ) : (
              <>
                <div className="text-5xl mb-4">{section?.icon || "📦"}</div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{section?.title_ar}</h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                  {section?.description_ar}
                </p>
                <div className="mt-4 flex items-center justify-center gap-3 text-sm text-muted-foreground">
                  <Badge variant="secondary">
                    {section?.population_mode === 'manual' ? 'عناصر مختارة يدويًا' : 'تُجلب تلقائيًا'}
                  </Badge>
                  {items.length > 0 && (
                    <span>{items.length} عنصر</span>
                  )}
                </div>
              </>
            )}
          </div>
        </section>

        {/* Items */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-xl" />
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link key={item.id} to={item.href}>
                    <Card className="group h-full hover:shadow-xl hover:border-primary/30 transition-all duration-300 cursor-pointer border-border/50">
                      <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex items-start gap-3 mb-3">
                          {item.icon && (
                            <span className="text-2xl shrink-0 group-hover:scale-110 transition-transform">
                              {item.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {item.badge && (
                                <Badge variant="outline" className="text-xs shrink-0">
                                  {item.badge}
                                </Badge>
                              )}
                              {item.meta && (
                                <span className="text-xs text-muted-foreground">{item.meta}</span>
                              )}
                            </div>
                            <h3 className="font-bold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                              {item.title_ar}
                            </h3>
                          </div>
                        </div>

                        {item.description_ar && (
                          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed flex-1">
                            {item.description_ar}
                          </p>
                        )}

                        <div className="mt-4 flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          عرض التفاصيل
                          <ArrowLeft className="h-4 w-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-24">
                <PackageOpen className="mx-auto h-16 w-16 text-muted-foreground/20 mb-6" />
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  {section?.empty_state_text || "لا توجد عناصر حالياً"}
                </h2>
                <p className="text-muted-foreground mb-8">
                  {section?.population_mode === 'manual'
                    ? "لم يتم اختيار عناصر لهذا القسم بعد. يمكن للمشرف رفع العناصر من لوحة الإدارة."
                    : "لم يتم نشر أي عناصر في هذا النوع من المحتوى بعد."}
                </p>
                <Link to="/">
                  <Button variant="outline" className="gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    العودة للرئيسية
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default SectionListing;
