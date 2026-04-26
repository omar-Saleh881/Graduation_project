import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, Clock, BarChart3 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLearningPaths } from "@/hooks/use-learning-paths";

const levelLabels: Record<string, string> = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
};
const levelColors: Record<string, string> = {
  beginner: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  intermediate: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  advanced: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const Paths = () => {
  const { data: allPaths, isLoading } = useLearningPaths();
  const paths = allPaths?.filter((path) => !path.section_id);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-bl from-accent/10 via-background to-primary/5 py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-4">
              <GraduationCap className="h-4 w-4" />
              مسارات تعليمية
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
              تعلّم خطوة بخطوة مع
              <span className="text-primary"> مسارات مُنظّمة</span>
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              اختر مسارك حسب مستواك واهتماماتك وابدأ رحلة التعلّم بأسلوب مُنظّم واحترافي
            </p>
          </div>
        </section>

        {/* Paths Grid */}
        <section className="py-10 md:py-14">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-60 rounded-lg" />
                ))}
              </div>
            ) : paths && paths.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paths.map((path) => (
                  <Card key={path.id} className="group overflow-hidden transition-all hover:shadow-lg hover:border-primary/30">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <span className="text-4xl">{path.icon}</span>
                        <div className="flex-1 min-w-0">
                          <Link to={`/paths/${path.slug}`}>
                            <h3 className="font-bold text-foreground text-lg leading-tight group-hover:text-primary transition-colors">
                              {path.title_ar}
                            </h3>
                          </Link>
                          <Badge className={`mt-2 text-xs ${levelColors[path.level]}`} variant="secondary">
                            {levelLabels[path.level]}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed mb-4">
                        {path.description_ar}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {path.estimated_hours} ساعات
                        </span>
                        <span className="flex items-center gap-1">
                          <BarChart3 className="h-3.5 w-3.5" />
                          {path.steps_count} خطوات
                        </span>
                      </div>
                      <Link to={`/paths/${path.slug}`}>
                        <Button variant="outline" size="sm" className="w-full gap-1.5">
                          ابدأ المسار
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-foreground">لا توجد مسارات حالياً</p>
                <p className="text-sm text-muted-foreground mt-1">سيتم إضافة مسارات تعليمية قريباً</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Paths;
