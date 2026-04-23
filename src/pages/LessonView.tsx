import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowLeft, BookOpen, Clock, ChevronRight, Video, ExternalLink, GraduationCap, FileText, PenTool } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useLearningPath } from "@/hooks/use-learning-paths";
import { getCourseWithStructure } from "@/lib/data/repository";

const LessonView = () => {
  const { slug, id, lessonId } = useParams<{ slug?: string; id?: string; lessonId: string }>();
  const navigate = useNavigate();
  
  const contextId = slug || id || "";
  const { data: path, isLoading: isPathLoading } = useLearningPath(contextId);
  const [course, setCourse] = useState<any>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  // Quiz State
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [quizResults, setQuizResults] = useState<{ score: number; passed: boolean; correctCount: number; totalCount: number } | null>(null);
  const [matchingSelection, setMatchingSelection] = useState<{ questionId: string; leftIndex?: number; rightIndex?: number }>({ questionId: "" });

  useEffect(() => {
    if (!path && id) {
      setIsLoadingCourse(true);
      const data = getCourseWithStructure(id);
      if (data) setCourse(data);
      setIsLoadingCourse(false);
    }
  }, [id, path]);

  const isLoading = isPathLoading || isLoadingCourse;

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 flex flex-col items-center">
          <Skeleton className="h-[400px] w-full max-w-4xl rounded-3xl mb-8" />
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-20 w-full max-w-2xl" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!path && !course) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 text-muted-foreground opacity-20" />
          <h1 className="text-3xl font-bold mb-4">هذا المحتوى غير متاح حالياً</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">ربما تم نقله أو حذفه من قبل المشرفين.</p>
          <Button onClick={() => navigate('/')} variant="default" className="px-10 h-12 shadow-xl shadow-primary/20">العودة للرئيسية</Button>
        </main>
        <Footer />
      </div>
    );
  }

  const allSteps = path 
    ? path.courses?.flatMap(c => c.steps) || []
    : course?.modules?.flatMap((m: any) => m.lessons) || [];

  const currentStepIndex = allSteps.findIndex(s => s.id === lessonId);
  const currentStep = allSteps[currentStepIndex];

  if (!currentStep) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">الدرس غير موجود</h1>
          <Link to={slug ? `/paths/${slug}` : `/courses/${id}`}>
            <Button variant="outline" className="h-12 px-8">العودة لخطة الدراسة</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const prevStep = currentStepIndex > 0 ? allSteps[currentStepIndex - 1] : null;
  const nextStep = currentStepIndex < allSteps.length - 1 ? allSteps[currentStepIndex + 1] : null;

  const renderMedia = () => {
    // Video rendering
    const youtubeUrl = currentStep.youtube_url || (currentStep.resource_type === 'video' ? currentStep.resource_url : "");
    const isVideo = currentStep.resource_type === 'video' || (youtubeUrl && (youtubeUrl.includes("youtube.com") || youtubeUrl.includes("youtu.be")));
    
    if (isVideo && youtubeUrl && youtubeUrl !== "#") {
      let videoId = "";
      if (youtubeUrl.includes("v=")) {
        videoId = youtubeUrl.split("v=")[1].split("&")[0];
      } else if (youtubeUrl.includes("youtu.be/")) {
        videoId = youtubeUrl.split("youtu.be/")[1].split("?")[0];
      } else {
        videoId = youtubeUrl.split("/").pop() || "";
      }
      return (
        <div className="aspect-video w-full rounded-3xl overflow-hidden border-4 border-background shadow-2xl mb-10 bg-black group relative">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title="Lesson Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      );
    }

    // PDF/document rendering
    const docUrl = currentStep.document_url || (currentStep.resource_type === 'document' ? currentStep.resource_url : "");
    if ((currentStep.resource_type === 'document' || currentStep.resource_type === 'article') && docUrl && docUrl !== "#") {
      return (
        <div className="mb-10 p-10 bg-card rounded-3xl border-2 border-border/50 border-dashed flex flex-col items-center justify-center text-center shadow-inner">
          <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
            <FileText className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{currentStep.document_label || 'عرض المستند التعليمي'}</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">يمكنك فتح المستند في نافذة جديدة للمراجعة أو التحميل.</p>
          <a href={docUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full max-w-xs">
            <Button className="w-full h-13 text-lg font-bold gap-3 shadow-xl shadow-primary/20">
              فتح الآن
              <ExternalLink className="h-5 w-5" />
            </Button>
          </a>
        </div>
      );
    }

    // Quiz rendering
    if (currentStep.resource_type === 'quiz') {
      const quizData = currentStep.quiz;
      const questions = quizData?.questions || [];

      if (questions.length === 0) {
        return (
          <div className="mb-10 p-10 bg-card rounded-3xl border-2 border-dashed border-muted flex flex-col items-center justify-center text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mb-4 opacity-30" />
            <h3 className="text-xl font-bold mb-2">هذا الاختبار لا يحتوي على أسئلة بعد</h3>
            <p className="text-muted-foreground">لم يقم المدرب بإضافة أسئلة لهذا الاختبار حتى الآن.</p>
          </div>
        );
      }

      // 1. Results Screen
      if (quizResults) {
        return (
          <div className="mb-10 p-10 bg-card rounded-3xl border-2 border-purple-400 shadow-xl overflow-hidden relative">
            <div className={`absolute top-0 right-0 left-0 h-2 ${quizResults.passed ? 'bg-green-500' : 'bg-red-500'}`} />
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${quizResults.passed ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {quizResults.passed ? <GraduationCap className="h-10 w-10" /> : <PenTool className="h-10 w-10" />}
              </div>
              <h2 className="text-3xl font-black mb-2">{quizResults.passed ? 'أحسنت! لقد اجتزت الاختبار' : 'للأسف لم تجتز الاختبار هذه المرة'}</h2>
              <p className="text-muted-foreground mb-8">لقد حصلت على {quizResults.score}% (أجبت على {quizResults.correctCount} من أصل {quizResults.totalCount} أسئلة صحيحة)</p>
              
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm mb-10">
                <div className="p-4 bg-muted/50 rounded-2xl">
                  <div className="text-[10px] uppercase font-black text-muted-foreground mb-1">النتيجة</div>
                  <div className={`text-2xl font-black ${quizResults.passed ? 'text-green-600' : 'text-red-600'}`}>{quizResults.score}%</div>
                </div>
                <div className="p-4 bg-muted/50 rounded-2xl">
                  <div className="text-[10px] uppercase font-black text-muted-foreground mb-1">الحالة</div>
                  <div className={`text-2xl font-black ${quizResults.passed ? 'text-green-600' : 'text-red-600'}`}>{quizResults.passed ? 'ناجح' : 'راسب'}</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button variant="outline" className="flex-1 h-12 rounded-2xl font-bold" onClick={() => {
                  setQuizResults(null);
                  setQuizStarted(false);
                  setCurrentQuestionIndex(0);
                  setUserAnswers({});
                }}>إعادة المحاولة</Button>
                {nextStep && quizResults.passed && (
                  <Button className="flex-1 h-12 rounded-2xl font-bold bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20" onClick={() => navigate(slug ? `/paths/${slug}/lesson/${nextStep.id}` : `/courses/${id}/lesson/${nextStep.id}`)}>الدرس التالي</Button>
                )}
              </div>
            </div>
          </div>
        );
      }

      // 2. Question View
      if (quizStarted) {
        const q = questions[currentQuestionIndex];
        const isLast = currentQuestionIndex === questions.length - 1;

        const handleSelectAnswer = (answer: any) => {
          setUserAnswers(prev => ({ ...prev, [q.id]: answer }));
        };

        const handleSubmitQuiz = () => {
          let correctCount = 0;
          questions.forEach(question => {
            const userAns = userAnswers[question.id];
            if (!userAns) return;

            if (question.type === 'multiple_choice') {
              if (userAns === question.correct_answers?.[0]) correctCount++;
            } else if (question.type === 'true_false') {
              if (userAns === question.answer) correctCount++;
            } else if (question.type === 'multiple_select') {
              const correct = question.correct_answers || [];
              if (Array.isArray(userAns) && userAns.length === correct.length && userAns.every(v => correct.includes(v))) {
                correctCount++;
              }
            } else if (question.type === 'matching') {
               // Simple validation for matching: all pairs must match perfectly
               const pairs = question.pairs || [];
               if (userAns && typeof userAns === 'object') {
                 const isCorrect = pairs.every((p: any) => userAns[p.right] === p.left);
                 if (isCorrect) correctCount++;
               }
            }
          });

          const score = Math.round((correctCount / questions.length) * 100);
          setQuizResults({
            score,
            passed: score >= (quizData?.passing_score || 80),
            correctCount,
            totalCount: questions.length
          });
        };

        return (
          <div className="mb-10 bg-card rounded-3xl border border-purple-100 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-purple-600 p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-black uppercase opacity-60 block mb-1 tracking-widest">السؤال {currentQuestionIndex + 1} / {questions.length}</span>
                <h3 className="text-lg font-bold">{q.question}</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black">{Math.round(((currentQuestionIndex) / questions.length) * 100)}%</div>
                <div className="text-[10px] font-bold opacity-60">التقدم</div>
              </div>
            </div>
            
            <div className="p-8 md:p-10 space-y-6">
               {(q.type === 'multiple_choice' || q.type === 'multiple_select') && (
                 <div className="grid grid-cols-1 gap-3">
                   {q.options?.map((opt, i) => {
                     const isSelected = q.type === 'multiple_choice' 
                       ? userAnswers[q.id] === i 
                       : (userAnswers[q.id] || []).includes(i);
                     
                     return (
                       <div 
                         key={i} 
                         className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 group ${isSelected ? 'border-purple-500 bg-purple-50 shadow-md ring-2 ring-purple-500/10' : 'border-border/60 hover:border-purple-200 hover:bg-purple-50/30'}`}
                         onClick={() => {
                           if (q.type === 'multiple_choice') {
                             handleSelectAnswer(i);
                           } else {
                             const current = userAnswers[q.id] || [];
                             if (current.includes(i)) handleSelectAnswer(current.filter((v: number) => v !== i));
                             else handleSelectAnswer([...current, i]);
                           }
                         }}
                       >
                         <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-purple-500 bg-purple-500 text-white' : 'border-muted-foreground/30'}`}>
                           {isSelected && <div className="w-2 h-2 rounded-full bg-white animate-in zoom-in duration-200" />}
                         </div>
                         <span className={`text-base flex-1 ${isSelected ? 'font-bold text-purple-900' : 'text-foreground/80'}`}>{opt}</span>
                       </div>
                     );
                   })}
                 </div>
               )}

               {q.type === 'true_false' && (
                 <div className="grid grid-cols-2 gap-4">
                    {[true, false].map((val) => {
                      const isSelected = userAnswers[q.id] === val;
                      return (
                        <div 
                          key={String(val)}
                          className={`p-8 rounded-3xl border-2 flex flex-col items-center justify-center gap-4 transition-all cursor-pointer ${isSelected ? (val ? 'border-green-500 bg-green-50 ring-4 ring-green-500/10' : 'border-red-500 bg-red-50 ring-4 ring-red-500/10') : 'border-border/60 hover:bg-muted/30'}`}
                          onClick={() => handleSelectAnswer(val)}
                        >
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? (val ? 'bg-green-500 text-white' : 'bg-red-500 text-white') : 'bg-muted text-muted-foreground'}`}>
                             {val ? <Badge className="bg-transparent text-white border-white">✓</Badge> : <Badge className="bg-transparent text-white border-white">✕</Badge>}
                          </div>
                          <span className={`text-lg font-black ${isSelected ? (val ? 'text-green-800' : 'text-red-800') : 'text-muted-foreground'}`}>{val ? 'صح (True)' : 'خطأ (False)'}</span>
                        </div>
                      );
                    })}
                 </div>
               )}

               {q.type === 'matching' && (
                 <div className="space-y-6">
                    <div className="text-center text-sm font-bold text-purple-600 bg-purple-50 py-2 rounded-lg mb-4">انقر على عنصر من اليمين ثم ما يناسبه من اليسار</div>
                    <div className="grid grid-cols-2 gap-10 relative">
                       {/* Left column (Keys) */}
                       <div className="space-y-3">
                          <div className="text-[10px] font-black uppercase text-center text-muted-foreground mb-2">العمود أ</div>
                          {q.pairs?.map((p, i) => {
                            const isSelected = matchingSelection.leftIndex === i;
                            const isMatched = !!(userAnswers[q.id]?.[p.right]);
                            return (
                              <div 
                                key={i} 
                                className={`p-4 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer text-center ${isMatched ? 'bg-green-50 border-green-200 text-green-700 opacity-50' : isSelected ? 'border-purple-500 bg-purple-600 text-white shadow-lg scale-105' : 'border-border/60 bg-background hover:border-purple-300'}`}
                                onClick={() => {
                                  if (isMatched) return;
                                  if (matchingSelection.rightIndex !== undefined) {
                                     // Pair from Right selection
                                     const leftKey = p.right;
                                     const rightValue = q.pairs![matchingSelection.rightIndex].left;
                                     const currentAnswers = userAnswers[q.id] || {};
                                     handleSelectAnswer({ ...currentAnswers, [leftKey]: rightValue });
                                     setMatchingSelection({ questionId: "" });
                                  } else {
                                     setMatchingSelection(prev => ({ ...prev, leftIndex: i, rightIndex: undefined }));
                                  }
                                }}
                              >
                                {p.right}
                              </div>
                            );
                          })}
                       </div>
                       {/* Right column (Values) */}
                       <div className="space-y-3">
                          <div className="text-[10px] font-black uppercase text-center text-muted-foreground mb-2">العمود ب</div>
                          {q.pairs?.map((p, i) => {
                            const isSelected = matchingSelection.rightIndex === i;
                            const isMatched = Object.values(userAnswers[q.id] || {}).includes(p.left);
                            return (
                              <div 
                                key={i} 
                                className={`p-4 rounded-xl border-2 text-sm font-bold transition-all cursor-pointer text-center ${isMatched ? 'bg-green-50 border-green-200 text-green-700 opacity-50' : isSelected ? 'border-purple-500 bg-purple-600 text-white shadow-lg scale-105' : 'border-border/60 bg-background hover:border-purple-300'}`}
                                onClick={() => {
                                  if (isMatched) return;
                                  if (matchingSelection.leftIndex !== undefined) {
                                     // Pair from Left selection
                                     const leftKey = q.pairs![matchingSelection.leftIndex].right;
                                     const rightValue = p.left;
                                     const currentAnswers = userAnswers[q.id] || {};
                                     handleSelectAnswer({ ...currentAnswers, [leftKey]: rightValue });
                                     setMatchingSelection({ questionId: "" });
                                  } else {
                                     setMatchingSelection(prev => ({ ...prev, rightIndex: i, leftIndex: undefined }));
                                  }
                                }}
                              >
                                {p.left}
                              </div>
                            );
                          })}
                       </div>
                    </div>
                    {userAnswers[q.id] && Object.keys(userAnswers[q.id]).length > 0 && (
                      <div className="pt-4 border-t flex flex-wrap gap-2">
                         {Object.entries(userAnswers[q.id]).map(([k, v], idx) => (
                           <Badge key={idx} variant="secondary" className="px-3 py-1 bg-green-100 text-green-700 border-green-200 flex items-center gap-2">
                             {k} <ArrowLeft className="h-3 w-3" /> {v as string}
                             <button className="hover:text-red-500 mr-1" onClick={() => {
                               const newAns = { ...userAnswers[q.id] };
                               delete newAns[k];
                               handleSelectAnswer(newAns);
                             }}>✕</button>
                           </Badge>
                         ))}
                      </div>
                    )}
                 </div>
               )}
            </div>

            <div className="p-8 bg-muted/20 border-t flex justify-between gap-4">
              <Button variant="ghost" className="h-12 px-6 rounded-2xl font-bold" disabled={currentQuestionIndex === 0} onClick={() => setCurrentQuestionIndex(i => i - 1)}>
                <ArrowRight className="h-5 w-5 ml-2" /> السابق
              </Button>
              
              {isLast ? (
                <Button className="h-12 px-12 rounded-2xl font-bold bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-500/20" onClick={handleSubmitQuiz}>إنهاء وتصحيح</Button>
              ) : (
                <Button className="h-12 px-8 rounded-2xl font-bold bg-purple-600 hover:bg-purple-700" onClick={() => setCurrentQuestionIndex(i => i + 1)}>
                  التالي <ArrowLeft className="h-5 w-5 mr-2" />
                </Button>
              )}
            </div>
          </div>
        );
      }

      // 3. Intro Screen
      return (
        <div className="mb-10 p-10 bg-card rounded-3xl border-2 border-purple-400/50 border-dashed flex flex-col items-center justify-center text-center shadow-inner">
          <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-6">
            <GraduationCap className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{quizData?.title || 'اختبار تقييمي'}</h3>
          <p className="text-muted-foreground max-w-sm mb-4">{quizData?.description || 'قم بإجراء هذا الاختبار للتحقق من فهمك للمادة العلمية.'}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8 w-full max-w-sm">
             <div className="p-3 bg-muted/50 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">درجة النجاح</div>
                <div className="text-lg font-bold text-primary">{quizData?.passing_score || 80}%</div>
             </div>
             <div className="p-3 bg-muted/50 rounded-xl">
                <div className="text-[10px] uppercase font-bold text-muted-foreground">عدد الأسئلة</div>
                <div className="text-lg font-bold text-primary">{questions.length}</div>
             </div>
          </div>

          <Button className="w-full max-w-xs h-13 text-lg font-bold gap-3 shadow-xl shadow-purple-500/20 bg-purple-600 hover:bg-purple-700" onClick={() => setQuizStarted(true)}>
            ابدأ الاختبار الآن
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>
      );
    }

    // External link rendering
    const extUrl = currentStep.resource_url;
    if (currentStep.resource_type === 'external' && extUrl && extUrl !== "#") {
      return (
        <div className="mb-10 p-10 bg-card rounded-3xl border-2 border-border/50 border-dashed flex flex-col items-center justify-center text-center shadow-inner">
          <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-6">
            <ExternalLink className="h-8 w-8" />
          </div>
          <h3 className="text-2xl font-bold mb-3">مصدر تعليمي خارجي</h3>
          <p className="text-muted-foreground max-w-sm mb-8">هذا الدرس يتطلب الانتقال إلى منصة أو موقع خارجي لإكمال المحتوى.</p>
          <a href={extUrl} target="_blank" rel="noopener noreferrer" className="inline-block w-full max-w-xs">
            <Button className="w-full h-13 text-lg font-bold gap-3 shadow-xl shadow-primary/20">
              فتح المصدر الآن
              <ExternalLink className="h-5 w-5" />
            </Button>
          </a>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      {/* Dynamic top bar for learning context */}
      <div className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-20 transition-all duration-300">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to={slug ? `/paths/${slug}` : `/courses/${id}`} className="flex items-center text-sm font-bold text-muted-foreground hover:text-primary transition-all group">
            <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-primary/5 mr-2">
              <ChevronRight className="h-4 w-4" />
            </div>
            <span className="truncate max-w-[200px]">العودة لـ: {path?.title_ar || course?.title_ar}</span>
          </Link>
          <div className="hidden md:flex items-center gap-2">
             <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary px-3">{path ? 'مسار تعلم' : 'كورس تدريبي'}</Badge>
             <span className="text-xs font-bold text-muted-foreground/60">خطوة {currentStepIndex + 1} / {allSteps.length}</span>
          </div>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-10 max-w-5xl">
        <div className="flex flex-col">
          
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-primary/10 text-primary border-primary/20 px-4 h-8 flex items-center gap-2 font-bold text-xs ring-0">
              {currentStep.resource_type === 'video' ? <Video className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
              {currentStep.resource_type === 'video' ? 'درس مرئي' : 
               currentStep.resource_type === 'quiz' ? 'تقييم مرحلي' : 
               currentStep.resource_type === 'document' ? 'مستند PDF' : 'محتوى تعليمي'}
            </Badge>
            <div className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground/80 bg-muted/40 px-3 h-8 rounded-full border border-border/40">
              <Clock className="h-4 w-4 text-primary/60" />
              {currentStep.duration_minutes} دقيقة تقريباً
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-foreground mb-6 leading-tight max-w-4xl">
            {currentStep.title_ar}
          </h1>
          
          {currentStep.description_ar && (
            <p className="text-xl text-muted-foreground leading-relaxed mb-10 border-r-4 border-primary/20 pr-6 italic">
              {currentStep.description_ar}
            </p>
          )}

          {renderMedia()}

          {(currentStep.content_ar || currentStep.notes) && (
            <div className="bg-card rounded-3xl border border-border shadow-sm p-8 md:p-12 mb-12">
              <div className="max-w-none text-right">
                <h4 className="text-lg font-bold mb-6 flex items-center gap-2 text-primary">
                  {currentStep.resource_type === 'quiz' ? 'تفاصيل الاختبار' : 
                   currentStep.resource_type === 'document' ? 'تفاصيل المستند' : 'الشرح والمحتوى'} <BookOpen className="h-4 w-4" />
                </h4>
                <div className="prose prose-lg prose-slate dark:prose-invert max-w-none leading-loose">
                  {currentStep.content_ar ? (
                    <div dangerouslySetInnerHTML={{ __html: currentStep.content_ar.replace(/\n/g, '<br/>') }} className="text-foreground/90 font-medium whitespace-pre-wrap" />
                  ) : (
                    <p className="text-muted-foreground italic">لا يوجد محتوى نصي إضافي لهذا العنصر.</p>
                  )}
                  
                  {currentStep.notes && (
                     <div className="mt-8 p-4 bg-muted/30 border-r-4 border-orange-400 text-sm font-bold flex items-start gap-2">
                        <span className="text-orange-500">💡 ملاحظة:</span>
                        <span>{currentStep.notes}</span>
                     </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 mb-20 flex flex-col sm:flex-row items-stretch justify-between gap-6">
            {prevStep ? (
              <Link to={slug ? `/paths/${slug}/lesson/${prevStep.id}` : `/courses/${id}/lesson/${prevStep.id}`} className="flex-1 group">
                <div className="h-full border border-border rounded-2xl p-5 flex items-center justify-between hover:bg-card hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer">
                  <ArrowRight className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                  <div className="text-right">
                    <span className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest block mb-1">السابق</span>
                    <span className="font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">{prevStep.title_ar}</span>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex-1 hidden sm:block"></div>
            )}

            {nextStep ? (
              <Link to={slug ? `/paths/${slug}/lesson/${nextStep.id}` : `/courses/${id}/lesson/${nextStep.id}`} className="flex-1 group">
                <div className="h-full border border-primary/20 bg-primary/5 rounded-2xl p-5 flex items-center justify-between hover:bg-primary hover:shadow-xl hover:shadow-primary/20 transition-all cursor-pointer">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase text-primary/60 group-hover:text-primary-foreground/60 tracking-widest block mb-1">التالي</span>
                    <span className="font-bold text-foreground group-hover:text-primary-foreground transition-colors line-clamp-1">{nextStep.title_ar}</span>
                  </div>
                  <ArrowLeft className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
              </Link>
            ) : (
              <Link to={slug ? `/paths/${slug}` : `/courses/${id}`} className="flex-1 group">
                <div className="h-full bg-green-600 rounded-2xl p-5 flex items-center justify-between shadow-xl shadow-green-500/20 hover:bg-green-700 transition-all cursor-pointer">
                  <div className="text-left">
                    <span className="text-[10px] font-black uppercase text-green-100/60 tracking-widest block mb-1">النهاية</span>
                    <span className="font-bold text-white">إكمال الوحدة بنجاح</span>
                  </div>
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
              </Link>
            )}
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LessonView;
