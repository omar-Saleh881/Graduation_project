import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ToolCard from "@/components/ToolCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Sparkles, RotateCcw } from "lucide-react";
import { externalSupabase } from "@/lib/external-supabase";
import type { Tool } from "@/types/tool";

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string }[];
}

const questions: Question[] = [
  {
    id: "task",
    text: "ما الذي تريد القيام به؟",
    options: [
      { label: "كتابة", value: "كتابة" },
      { label: "تصميم", value: "تصميم" },
      { label: "إنشاء صور", value: "صور" },
      { label: "إنشاء فيديو", value: "فيديو" },
      { label: "برمجة", value: "برمجة" },
      { label: "تسويق", value: "تسويق" },
      { label: "إنتاجية", value: "إنتاجية" },
      { label: "تعليم", value: "تعليم" },
    ],
  },
  {
    id: "experience",
    text: "ما مستوى خبرتك؟",
    options: [
      { label: "مبتدئ", value: "beginner" },
      { label: "متوسط", value: "intermediate" },
      { label: "متقدم", value: "advanced" },
    ],
  },
  {
    id: "pricing",
    text: "ما نوع التسعير الذي تفضله؟",
    options: [
      { label: "مجاني", value: "free" },
      { label: "فريميوم", value: "freemium" },
      { label: "مدفوع", value: "paid" },
      { label: "لا يهم", value: "any" },
    ],
  },
  {
    id: "role",
    text: "من أنت؟",
    options: [
      { label: "طالب", value: "طالب" },
      { label: "معلم", value: "معلم" },
      { label: "منشئ محتوى", value: "منشئ محتوى" },
      { label: "مسوق", value: "مسوق" },
      { label: "مطور", value: "مطور" },
      { label: "صاحب مشروع", value: "صاحب مشروع" },
      { label: "مستخدم عام", value: "مستخدم عام" },
    ],
  },
  {
    id: "difficulty",
    text: "ما درجة السهولة التي تريدها؟",
    options: [
      { label: "سهل جداً", value: "1" },
      { label: "متوسط", value: "3" },
      { label: "متقدم", value: "5" },
    ],
  },
];

// Maps quiz answer values to possible category/tag matches
const taskCategoryMap: Record<string, string[]> = {
  "كتابة": ["writing", "copywriting", "content", "text", "كتابة"],
  "تصميم": ["design", "ui", "ux", "graphic", "تصميم"],
  "صور": ["image", "photo", "art", "illustration", "صور"],
  "فيديو": ["video", "animation", "فيديو"],
  "برمجة": ["coding", "programming", "developer", "code", "برمجة"],
  "تسويق": ["marketing", "seo", "ads", "تسويق"],
  "إنتاجية": ["productivity", "automation", "workflow", "إنتاجية"],
  "تعليم": ["education", "learning", "research", "تعليم"],
};

const roleLabelMap: Record<string, string[]> = {
  "طالب": ["student", "طالب", "students"],
  "معلم": ["teacher", "educator", "معلم"],
  "منشئ محتوى": ["creator", "content creator", "منشئ محتوى"],
  "مسوق": ["marketer", "marketing", "مسوق"],
  "مطور": ["developer", "engineer", "مطور"],
  "صاحب مشروع": ["entrepreneur", "business", "صاحب مشروع", "startup"],
  "مستخدم عام": ["general", "everyone", "مستخدم عام", "all"],
};

const pricingMap: Record<string, string[]> = {
  free: ["free", "مجاني", "open source"],
  freemium: ["freemium", "فريميوم", "free trial"],
  paid: ["paid", "مدفوع", "premium", "enterprise"],
};

interface ScoredTool {
  tool: Tool;
  score: number;
  reasons: string[];
}

function scoreTool(tool: Tool, answers: Record<string, string>): ScoredTool {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category/task match (weight: 30)
  const taskAnswer = answers.task;
  if (taskAnswer && taskCategoryMap[taskAnswer]) {
    const keywords = taskCategoryMap[taskAnswer];
    const cat = (tool.category || "").toLowerCase();
    const tags = (tool.tags || []).map((t) => t.toLowerCase());
    const name = (tool.name || "").toLowerCase();
    const desc = (tool.description_en || "").toLowerCase();

    for (const kw of keywords) {
      if (cat.includes(kw)) { score += 30; reasons.push(`تدعم مجال ${taskAnswer}`); break; }
      if (tags.some((t) => t.includes(kw))) { score += 25; reasons.push(`مرتبطة بمجال ${taskAnswer}`); break; }
      if (name.includes(kw) || desc.includes(kw)) { score += 15; reasons.push(`تتعلق بـ${taskAnswer}`); break; }
    }
  }

  // 2. Pricing match (weight: 25)
  const pricingAnswer = answers.pricing;
  const pricingLabelMap: Record<string, string> = { free: "مجانية", freemium: "مجانية جزئياً (فريميوم)", paid: "مدفوعة" };
  if (pricingAnswer && pricingAnswer !== "any") {
    const pricingKeywords = pricingMap[pricingAnswer] || [];
    const toolPricing = (tool.pricing_model || "").toLowerCase();
    if (pricingKeywords.some((kw) => toolPricing.includes(kw))) {
      score += 25;
      reasons.push(pricingLabelMap[pricingAnswer] || "تناسب ميزانيتك");
    }
  } else if (pricingAnswer === "any") {
    score += 10;
  }

  // 3. Target audience/role match (weight: 25)
  const roleAnswer = answers.role;
  if (roleAnswer && roleLabelMap[roleAnswer]) {
    const roleKw = roleLabelMap[roleAnswer];
    const audience = (tool.target_audience || "").toLowerCase();
    if (roleKw.some((kw) => audience.includes(kw))) {
      score += 25;
      reasons.push(`ملائمة لـ${roleAnswer === "مستخدم عام" ? "الجميع" : roleAnswer === "طالب" ? "الطلاب" : roleAnswer === "معلم" ? "المعلمين" : roleAnswer === "مطور" ? "المطورين" : roleAnswer === "مسوق" ? "المسوقين" : roleAnswer}`);
    }
  }

  // 4. Difficulty match (weight: 20)
  const diffAnswer = answers.difficulty;
  const diffLabelMap: Record<string, string> = { "1": "مناسبة للمبتدئين", "3": "تناسب مستوى الاستخدام الذي اخترته", "5": "مناسبة للمستخدمين المتقدمين" };
  if (diffAnswer && tool.difficulty_level != null) {
    const target = parseInt(diffAnswer);
    const diff = Math.abs(tool.difficulty_level - target);
    if (diff === 0) { score += 20; reasons.push(diffLabelMap[diffAnswer] || "تناسب مستواك"); }
    else if (diff <= 1) { score += 12; reasons.push("قريبة من مستوى الاستخدام الذي اخترته"); }
    else if (diff <= 2) { score += 5; }
  }

  // 5. Bonus: featured / high votes
  if (tool.is_featured) { score += 5; }
  if (tool.votes_count > 50) { score += 3; }

  // Cap reasons at 4
  reasons.splice(4);

  return { tool, score, reasons };
}

const Quiz = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<ScoredTool[] | null>(null);
  const [loading, setLoading] = useState(false);

  const currentQuestion = questions[step];
  const progress = results ? 100 : ((step) / questions.length) * 100;

  const handleSelect = (value: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = async () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Compute results
      setLoading(true);
      try {
        const { data, error } = await externalSupabase
          .from("mbx")
          .select("*")
          .eq("is_active", true)
          .eq("status", "published");

        if (error) throw error;
        const tools = (data ?? []) as Tool[];
        const scored = tools
          .map((t) => scoreTool(t, answers))
          .filter((s) => s.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        setResults(scored);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleReset = () => {
    setStep(0);
    setAnswers({});
    setResults(null);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-10">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Sparkles className="h-4 w-4" />
              مستشار الأدوات
            </div>
            <h1 className="text-3xl font-bold text-foreground">نساعدك تختار الأداة المناسبة</h1>
            <p className="mt-2 text-muted-foreground">أجب عن بضعة أسئلة وسنقترح عليك أفضل الأدوات</p>
          </div>

          <Progress value={progress} className="mb-8 h-2" />

          {!results && !loading && (
            <Card>
              <CardContent className="p-6 md:p-8">
                <p className="text-sm text-muted-foreground mb-2">السؤال {step + 1} من {questions.length}</p>
                <h2 className="text-xl font-bold text-foreground mb-6">{currentQuestion.text}</h2>

                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((opt) => {
                    const selected = answers[currentQuestion.id] === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleSelect(opt.value)}
                        className={`rounded-lg border-2 p-4 text-center text-sm font-medium transition-all ${
                          selected
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-card text-foreground hover:border-primary/40"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Button variant="ghost" onClick={handleBack} disabled={step === 0} className="gap-1">
                    <ArrowRight className="h-4 w-4" />
                    السابق
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!answers[currentQuestion.id]}
                    className="gap-1"
                  >
                    {step === questions.length - 1 ? "اعرض النتائج" : "التالي"}
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="text-center py-16">
              <p className="text-lg text-muted-foreground animate-pulse">جاري تحليل إجاباتك...</p>
            </div>
          )}

          {results && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-foreground">
                  🎯 الأدوات المقترحة لك ({results.length})
                </h2>
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
                  <RotateCcw className="h-4 w-4" />
                  أعد الاختبار
                </Button>
              </div>

              {results.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-lg text-muted-foreground">لم نجد أدوات مطابقة — جرّب إجابات مختلفة</p>
                  </CardContent>
                </Card>
              ) : (
                results.map(({ tool, score, reasons }, i) => (
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
                ))
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Quiz;
