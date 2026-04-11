import { useEffect, useState } from "react";
import { 
  Users, Wrench, FileText, Library, 
  TrendingUp, Activity, MousePointerClick
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toolsRepo, articlesRepo, contentRepo } from "@/lib/data/repository";

const AdminDashboard = () => {
  const [counts, setCounts] = useState({ tools: 0, articles: 0, content: 0 });

  useEffect(() => {
    // Get real counts from repository
    setCounts({
      tools: toolsRepo.getAll().length,
      articles: articlesRepo.getAll().length,
      content: contentRepo.getAll().length,
    });
  }, []);

  const stats = [
    { title: "إجمالي الأدوات", value: counts.tools.toString(), icon: Wrench, color: "text-blue-500", trend: "+12 هذا الشهر" },
    { title: "المقالات النشطة", value: counts.articles.toString(), icon: FileText, color: "text-purple-500", trend: "+3 هذا الشهر" },
    { title: "مواد المكتبة", value: counts.content.toString(), icon: Library, color: "text-orange-500", trend: "+15 هذا الشهر" },
    { title: "المستخدمين المسجلين", value: "1,240", icon: Users, color: "text-green-500", trend: "+120 هذا الشهر" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">الرئيسية</h1>
        <p className="text-muted-foreground">نظرة عامة على أداء ومحتوى المنصة.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1 text-green-500 font-medium">
                {stat.trend}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts & Activity placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              نشاط الزوار
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center border-2 border-dashed border-border rounded-lg bg-muted/20">
              <div className="text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">مساحة لعرض رسم بياني (Chart.js / Recharts)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MousePointerClick className="h-5 w-5 text-primary" />
              أحدث التفاعلات
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { user: "أحمد", action: "أضاف تقييم جديد لأداة ChatGPT", time: "منذ 10 دقائق" },
                { user: "سارة", action: "أكملت مسار تعلم البرمجة", time: "منذ 3 ساعات" },
                { user: "محمد", action: "بحث عن أدوات التصميم بالذكاء الاصطناعي", time: "منذ 5 ساعات" },
                { user: "نورة", action: "قرأت مقال 'مقدمة في الذكاء الاصطناعي'", time: "منذ يوم" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="mt-0.5 h-2 w-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.user}</p>
                    <p className="text-muted-foreground">{activity.action}</p>
                    <span className="text-xs text-muted-foreground/70">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
