import { useLocation, Link } from "react-router-dom";
import { Sparkles, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ScoredToolResult {
  tool: import("@/types/tool").Tool;
  score: number;
  reasons: string[];
}

const Recommendations = () => {
  const location = useLocation();
  const results = (location.state?.results ?? []) as ScoredToolResult[];

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-3xl px-4 py-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              نتائج التوصيات
            </div>
            <h1 className="text-3xl font-bold text-foreground">🎯 الأدوات المقترحة لك</h1>
            <p className="mt-2 text-muted-foreground">بناءً على إجاباتك في مستشار الأدوات</p>
          </div>

          {results.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <p className="text-lg text-muted-foreground">لا توجد توصيات بعد</p>
                <p className="text-sm text-muted-foreground">أجب عن أسئلة مستشار الأدوات أولاً للحصول على توصيات مخصصة</p>
                <Link to="/quiz">
                  <Button className="gap-2 mt-2">
                    <Sparkles className="h-4 w-4" />
                    ابدأ الاختبار
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">عثرنا على {results.length} أداة مناسبة لك</p>
                <Link to="/quiz">
                  <Button variant="outline" size="sm" className="gap-1">
                    <RotateCcw className="h-4 w-4" />
                    أعد الاختبار
                  </Button>
                </Link>
              </div>

              {results.map(({ tool, score, reasons }, i) => (
                <div key={tool.id} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      تطابق {Math.min(Math.round((score / 100) * 100), 100)}%
                    </Badge>
                    <span className="text-xs text-muted-foreground">#{i + 1}</span>
                  </div>
                  <ToolCard tool={tool} />
                  {reasons.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {reasons.map((r, ri) => (
                        <span key={ri} className="text-xs text-muted-foreground bg-muted rounded-full px-2.5 py-0.5">
                          ✓ {r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Recommendations;
