import { useParams, Link } from "react-router-dom";
import { ExternalLink, ArrowRight, Tag, Users, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ToolLogo from "@/components/ToolLogo";
import { useToolByHandle, useSimilarTools } from "@/hooks/use-tools";

const ToolDetails = () => {
  const { handle } = useParams<{ handle: string }>();
  const { data: tool, isLoading, error } = useToolByHandle(handle ?? "");
  const { data: similar } = useSimilarTools(tool?.category ?? "", tool?.id ?? "");

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-64 rounded-lg" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">الأداة غير موجودة</h1>
          <Link to="/tools">
            <Button variant="outline" className="gap-2">
              <ArrowRight className="h-4 w-4" />
              العودة للأدوات
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
            <Link to="/tools" className="hover:text-foreground transition-colors">الأدوات</Link>
            <span className="mx-1">/</span>
            <span className="text-foreground font-medium truncate max-w-[200px]">{tool.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-start gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted border border-border">
                  <ToolLogo name={tool.name} logoUrl={tool.logo_url} websiteUrl={tool.website_url} letterClassName="text-2xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">{tool.name}</h1>
                  <p className="mt-2 text-lg text-muted-foreground leading-relaxed">
                    {tool.summary_ar || tool.description_ar || tool.description_en || "أداة ذكاء اصطناعي"}
                  </p>
                </div>
              </div>

              <Card>
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-foreground">الوصف</h2>
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {tool.description_ar || tool.description_en || "لا يوجد وصف متاح."}
                  </p>
                </CardContent>
              </Card>

              {tool.tags && tool.tags.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      الوسوم
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {tool.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {tool.website_url && (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full gap-2 text-base" size="lg">
                    زيارة الموقع
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </a>
              )}

              <Card>
                <CardContent className="p-5 space-y-4">
                  {tool.category && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">التصنيف</span>
                      <Badge>{tool.category}</Badge>
                    </div>
                  )}
                  {tool.pricing_model && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">التسعير</span>
                      <Badge variant="outline">{tool.pricing_model}</Badge>
                    </div>
                  )}
                  {tool.target_audience && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        الجمهور
                      </span>
                      <span className="text-sm font-medium text-foreground">{tool.target_audience}</span>
                    </div>
                  )}
                  {tool.difficulty_level != null && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <BarChart3 className="h-3.5 w-3.5" />
                        الصعوبة
                      </span>
                      <span className="text-sm font-medium text-foreground">{tool.difficulty_level}/5</span>
                    </div>
                  )}
                  {tool.votes_count > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">التصويتات</span>
                      <span className="text-sm font-medium text-foreground">{tool.votes_count}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Similar tools */}
          {similar && similar.length > 0 && (
            <section className="mt-12">
              <h2 className="text-2xl font-bold text-foreground mb-6">أدوات مشابهة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {similar.map((t) => (
                  <ToolCard key={t.id} tool={t} />
                ))}
              </div>
            </section>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ToolDetails;
