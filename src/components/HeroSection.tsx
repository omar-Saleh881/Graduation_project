import { Link } from "react-router-dom";
import { Search, Sparkles, ArrowLeft, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-primary/10 via-background to-accent/5 py-20 md:py-28">
      <div className="container mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-6">
          <Sparkles className="h-4 w-4" />
          دليلك العربي الأول لأدوات الذكاء الاصطناعي
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
          اكتشف أفضل أدوات
          <span className="text-primary"> الذكاء الاصطناعي</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          تصفّح مئات الأدوات الذكية، قارن بينها، واختر الأنسب لاحتياجاتك — كل ذلك باللغة العربية
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/tools">
            <Button size="lg" className="gap-2 text-base">
              <Search className="h-5 w-5" />
              تصفّح الأدوات
            </Button>
          </Link>
          <Link to="/quiz">
            <Button variant="outline" size="lg" className="gap-2 text-base">
              <MessageCircleQuestion className="h-5 w-5" />
              مستشار الأدوات
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
