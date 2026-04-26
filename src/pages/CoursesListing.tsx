import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft, Clock, Layers } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { coursesRepo } from "@/lib/data/repository";

const CoursesListing = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = coursesRepo.getAll().filter(c => c.is_published !== false && !c.section_id);
    setCourses(data);
    setIsLoading(false);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <section className="bg-gradient-to-bl from-primary/10 via-background to-accent/5 py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">كورسات تعليمية متكاملة</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">دورات تدريبية مكثفة تأخذك من الصفر إلى الاحتراف في مختلف مجالات الذكاء الاصطناعي</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}
              </div>
            ) : courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <Card key={course.id} className="group hover:shadow-xl transition-all border-2 hover:border-primary/20">
                    <CardContent className="p-6">
                      <Badge className="mb-4">{course.category}</Badge>
                      <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{course.title_ar}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{course.description_ar}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                        <span className="flex items-center gap-1"><Clock size={14} /> {course.level}</span>
                      </div>
                      <Link to={`/courses/${course.slug}`}>
                        <Button className="w-full gap-2">
                          عرض تفاصيل الكورس
                          <ArrowLeft size={16} />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                <h3 className="text-xl font-bold">لا توجد كورسات متاحة حالياً</h3>
                <p className="text-muted-foreground">قم بإضافة كورسات من لوحة الإدارة لتظهر هنا.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CoursesListing;
