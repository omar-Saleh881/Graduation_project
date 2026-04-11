import { useParams, Link } from "react-router-dom";
import { ArrowRight, Clock, Video, BookOpen, Layers, Play } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { getCourseWithStructure } from "@/lib/data/repository";

const CourseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const data = getCourseWithStructure(id);
      setCourse(data);
      setIsLoading(false);
    }
  }, [id]);

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

  if (!course) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">الكورس غير موجود</h1>
          <Link to="/courses">
            <Button variant="outline"><ArrowRight className="ml-2 h-4 w-4" /> العودة للكورسات</Button>
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
        <section className="bg-muted/30 py-12 md:py-16">
          <div className="container mx-auto px-4">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">{course.category}</Badge>
            <h1 className="text-3xl md:text-5xl font-bold mb-4">{course.title_ar}</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mb-6">{course.description_ar}</p>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> {course.level}</span>
              <span className="flex items-center gap-1.5"><Layers className="h-4 w-4" /> {course.modules.length} وحدات</span>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-8">منهج الكورس</h2>
            <div className="space-y-6 max-w-3xl">
              {course.modules.map((module: any, mIdx: number) => (
                <Card key={module.id} className="border-2">
                  <CardHeader className="bg-muted/50 py-4">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span className="bg-primary text-primary-foreground w-6 h-6 rounded flex items-center justify-center text-xs">{mIdx + 1}</span>
                      {module.title_ar}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y border-t">
                      {module.lessons.map((lesson: any) => (
                        <li key={lesson.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="text-muted-foreground">
                              {lesson.resource_type === 'video' ? <Video size={18} /> : <BookOpen size={18} />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{lesson.title_ar}</p>
                              <p className="text-xs text-muted-foreground">{lesson.duration_minutes} دقيقة</p>
                            </div>
                          </div>
                          <Link to={`/courses/${course.slug || course.id}/lesson/${lesson.id}`}>
                            <Button size="sm" variant="ghost" className="gap-1">
                              <Play className="h-3 w-3" />
                              بدأ
                            </Button>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}

              {course.unassignedLessons && course.unassignedLessons.length > 0 && (
                <Card className="border-2 border-dashed">
                  <CardHeader className="bg-muted/30 py-4">
                    <CardTitle className="text-lg flex items-center gap-3">
                      <span className="bg-muted-foreground text-white w-6 h-6 rounded flex items-center justify-center text-xs">?</span>
                      دروس إضافية
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ul className="divide-y border-t">
                      {course.unassignedLessons.map((lesson: any) => (
                        <li key={lesson.id} className="p-4 flex items-center justify-between hover:bg-muted/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="text-muted-foreground">
                              {lesson.resource_type === 'video' ? <Video size={18} /> : <BookOpen size={18} />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{lesson.title_ar}</p>
                              <p className="text-xs text-muted-foreground">{lesson.duration_minutes} دقيقة</p>
                            </div>
                          </div>
                          <Link to={`/courses/${course.slug || course.id}/lesson/${lesson.id}`}>
                            <Button size="sm" variant="ghost" className="gap-1">
                              <Play className="h-3 w-3" />
                              بدأ
                            </Button>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CourseDetails;
