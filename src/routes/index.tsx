import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import vocabRaw from "../data/vocabulary.json";
import { arabicMatches } from "../lib/arabic";
import { playCorrectSound, playWrongSound } from "../lib/sounds";
import { useSpeechRecognition } from "../lib/useSpeechRecognition";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { SiteFooter } from "../components/site-footer";
import { SiteLogo } from "../components/site-logo";
import {
  Mic, MicOff, Send, SkipForward, RotateCcw, Check, X,
  Flame, Trophy, Volume2, Sparkles, Target, Award, Home,
  PenLine, BarChart3, ArrowLeft, Play,
} from "lucide-react";

type Word = { arabic: string; uccharon: string; bangla: string };
const VOCAB = vocabRaw as Word[];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "esho.arbi.sikhi — تعلّم المفردات العربية" },
      { name: "description", content: "Interactive Arabic vocabulary trainer with speech recognition. Practice typing and speaking Arabic words with instant feedback." },
      { property: "og:title", content: "esho.arbi.sikhi — تعلّم المفردات العربية" },
      { property: "og:description", content: "Practice Arabic vocabulary by typing or speaking. Quizzes, streaks, and progress tracking." },
    ],
  }),
  component: QuizPage,
});

type Stats = {
  bestStreak: number;
  lifetimeCorrect: number;
  lifetimeAttempted: number;
  wrongIds: number[];
  highScores: Record<string, number>; // keyed by quiz length
};
const STORAGE_KEY = "arabic-trainer-stats-v2";

function blankStats(): Stats {
  return { bestStreak: 0, lifetimeCorrect: 0, lifetimeAttempted: 0, wrongIds: [], highScores: {} };
}
function loadStats(): Stats {
  if (typeof window === "undefined") return blankStats();
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return { ...blankStats(), ...JSON.parse(s) };
  } catch {}
  return blankStats();
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ar-SA";
  u.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

type Screen = "menu" | "quiz" | "done";
type QuizMode = { length: number; practice: boolean };

const PRESETS: { length: number; labelAr: string; labelBn: string; subtitle: string; icon: typeof Sparkles }[] = [
  { length: 10, labelAr: "اختبار سريع", labelBn: "১০ পয়েন্ট", subtitle: "দ্রুত শুরু করুন", icon: Sparkles },
  { length: 20, labelAr: "اختبار قياسي", labelBn: "২০ পয়েন্ট", subtitle: "নিয়মিত অনুশীলন", icon: Target },
  { length: 50, labelAr: "اختبار مكثّف", labelBn: "৫০ পয়েন্ট", subtitle: "গভীর অনুশীলন", icon: Award },
  { length: VOCAB.length, labelAr: "اختبار شامل", labelBn: `সম্পূর্ণ (${VOCAB.length})`, subtitle: "সব শব্দ", icon: Trophy },
];

const STEPS = [
  { step: 1, titleAr: "اقْرَأِ المَعْنَى", titleBn: "অর্থ পড়ুন", desc: "বাংলায় শব্দের অর্থ দেখুন" },
  { step: 2, titleAr: "اكْتُبْ أَوْ تَكَلَّم", titleBn: "লিখুন বা বলুন", desc: "আরবি শব্দ টাইপ করুন বা মাইক দিয়ে উচ্চারণ করুন" },
  { step: 3, titleAr: "تَعَلَّمْ وَتَقَدَّم", titleBn: "শিখুন ও এগিয়ে যান", desc: "তাৎক্ষণিক ফলাফল, স্ট্রিক ও ভুল শব্দের অনুশীলন" },
] as const;

const FEATURES = [
  { icon: Mic, titleAr: "التعرّف الصوتي", titleBn: "কথ্য অনুশীলন", desc: "মাইক্রোফোন দিয়ে আরবি উচ্চারণ করুন" },
  { icon: PenLine, titleAr: "الكتابة", titleBn: "লিখে অনুশীলন", desc: "আরবি বানান টাইপ করে শিখুন" },
  { icon: BarChart3, titleAr: "تتبّع التقدّم", titleBn: "অগ্রগতি", desc: "স্ট্রিক, স্কোর ও ভুল শব্দ ট্র্যাক করুন" },
] as const;

function QuizPage() {
  const [stats, setStats] = useState<Stats>(blankStats());
  const [screen, setScreen] = useState<Screen>("menu");
  const [mode, setMode] = useState<QuizMode | null>(null);
  const [queue, setQueue] = useState<number[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0); // 0-based
  const [session, setSession] = useState({ correct: 0, incorrect: 0, streak: 0 });
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<null | { ok: boolean }>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sr = useSpeechRecognition("ar-SA");

  useEffect(() => { setStats(loadStats()); }, []);
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    if (sr.transcript && screen === "quiz" && !feedback) {
      setAnswer(sr.transcript);
      submitAnswer(sr.transcript);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sr.transcript]);

  function startQuiz(length: number, practice = false) {
    const sourceIds = practice && stats.wrongIds.length > 0
      ? [...stats.wrongIds]
      : VOCAB.map((_, i) => i);
    shuffle(sourceIds);
    const finalLen = Math.min(length, sourceIds.length);
    const ids = sourceIds.slice(0, finalLen);
    setMode({ length: finalLen, practice });
    setQueue(ids);
    setQuestionIndex(0);
    setSession({ correct: 0, incorrect: 0, streak: 0 });
    setAnswer("");
    setFeedback(null);
    sr.reset();
    setScreen("quiz");
    setTimeout(() => inputRef.current?.focus(), 80);
  }

  function submitAnswer(raw: string) {
    if (feedback || !mode) return;
    const id = queue[questionIndex];
    const word = VOCAB[id];
    const ok = arabicMatches(raw, word.arabic);
    setFeedback({ ok });
    setSession((s) => {
      const streak = ok ? s.streak + 1 : 0;
      return {
        correct: s.correct + (ok ? 1 : 0),
        incorrect: s.incorrect + (ok ? 0 : 1),
        streak,
      };
    });
    setStats((st) => {
      const wrongIds = ok
        ? st.wrongIds.filter((x) => x !== id)
        : st.wrongIds.includes(id) ? st.wrongIds : [...st.wrongIds, id];
      const newStreak = ok ? session.streak + 1 : 0;
      return {
        ...st,
        lifetimeAttempted: st.lifetimeAttempted + 1,
        lifetimeCorrect: st.lifetimeCorrect + (ok ? 1 : 0),
        bestStreak: Math.max(st.bestStreak, newStreak),
        wrongIds,
      };
    });
    if (ok) {
      playCorrectSound();
      speak(word.arabic);
    } else {
      playWrongSound();
    }
  }

  function nextQuestion() {
    if (!mode) return;
    const nextIdx = questionIndex + 1;
    if (nextIdx >= mode.length) {
      // finish
      setStats((st) => {
        const key = String(mode.length);
        const prev = st.highScores[key] ?? 0;
        return { ...st, highScores: { ...st.highScores, [key]: Math.max(prev, session.correct) } };
      });
      setScreen("done");
      return;
    }
    setQuestionIndex(nextIdx);
    setAnswer("");
    setFeedback(null);
    sr.reset();
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function skip() {
    if (feedback || !mode) return;
    playWrongSound();
    setFeedback({ ok: false });
    const id = queue[questionIndex];
    setSession((s) => ({ ...s, incorrect: s.incorrect + 1, streak: 0 }));
    setStats((st) => ({
      ...st,
      lifetimeAttempted: st.lifetimeAttempted + 1,
      wrongIds: st.wrongIds.includes(id) ? st.wrongIds : [...st.wrongIds, id],
    }));
  }

  function backToMenu() {
    setScreen("menu");
    setMode(null);
    setAnswer("");
    setFeedback(null);
  }

  if (screen === "menu") return <MenuScreen stats={stats} onStart={startQuiz} onReset={() => setStats(blankStats())} />;
  if (screen === "done" && mode) return <ResultsScreen mode={mode} session={session} stats={stats} onAgain={() => startQuiz(mode.length, mode.practice)} onMenu={backToMenu} onPracticeWrong={() => startQuiz(Math.min(20, stats.wrongIds.length || 1), true)} />;

  // QUIZ SCREEN
  if (!mode) return null;
  const id = queue[questionIndex];
  const word = VOCAB[id];
  const progressPct = ((questionIndex) / mode.length) * 100;

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 px-3 py-4 sm:px-4 sm:py-8 md:py-12">
      <div className="mx-auto w-full max-w-3xl space-y-4 sm:space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="ghost" size="sm" onClick={backToMenu} className="w-fit shrink-0">
            <ArrowLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">পিছনে</span>
          </Button>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm">
              <Trophy className="h-3.5 w-3.5 shrink-0 text-gold" /> {session.correct}/{mode.length}
            </Badge>
            <Badge variant="secondary" className="gap-1 px-2.5 py-1 text-xs sm:px-3 sm:py-1.5 sm:text-sm">
              <Flame className="h-3.5 w-3.5 shrink-0 text-orange-500" /> {session.streak}
            </Badge>
          </div>
        </header>

        <Card className="overflow-hidden border-0 p-0 shadow-[var(--shadow-soft)]" style={{ background: "var(--gradient-card)" }}>
          <div className="h-1.5 w-full bg-secondary">
            <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPct}%` }} />
          </div>

          <div className="space-y-5 p-4 sm:space-y-6 sm:p-6 md:p-10">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Badge variant="outline" className="w-fit font-mono text-[11px] sm:text-xs">
                {mode.practice ? "Practice" : "Quiz"} · Question {questionIndex + 1}/{mode.length}
              </Badge>
              <Badge variant="outline" className="w-fit text-[11px] sm:text-xs">
                {mode.length}-Point Quiz
              </Badge>
            </div>

            <div className="rounded-2xl bg-secondary/60 p-4 text-center sm:p-6 md:p-8">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground sm:text-xs">Meaning</p>
              <p className="mt-2 text-2xl font-semibold leading-snug sm:mt-3 sm:text-3xl md:text-4xl">{word.bangla}</p>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">Type or speak the Arabic word</p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); submitAnswer(answer); }} className="flex flex-col gap-3">
              <Input
                ref={inputRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="اكتب الكلمة العربية..."
                dir="rtl"
                autoFocus
                disabled={!!feedback}
                className="font-arabic h-12 flex-1 rounded-xl text-xl sm:h-14 sm:text-2xl"
              />
              <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
                <Button type="button" size="lg" variant={sr.listening ? "destructive" : "secondary"}
                  onClick={() => (sr.listening ? sr.stop() : sr.start())}
                  disabled={!sr.supported || !!feedback} className="h-12 rounded-xl sm:h-14 sm:min-w-14"
                  title={sr.supported ? "Speak" : "Speech not supported"}>
                  {sr.listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </Button>
                <Button type="submit" size="lg" disabled={!answer.trim() || !!feedback} className="h-12 rounded-xl sm:h-14 sm:min-w-14">
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </form>

            {sr.listening && <p className="text-center text-xs text-primary sm:text-sm">🎙️ Listening… speak now</p>}
            {!sr.supported && <p className="text-center text-[11px] text-muted-foreground sm:text-xs">Mic requires Chrome/Edge with HTTPS.</p>}

            {feedback && (
              <div className={`rounded-xl border p-4 sm:p-5 ${feedback.ok ? "border-success/30 bg-success/10" : "border-destructive/30 bg-destructive/10"}`}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    {feedback.ok ? <Check className="h-5 w-5 shrink-0 text-success" /> : <X className="h-5 w-5 shrink-0 text-destructive" />}
                    <span className="text-sm font-semibold sm:text-base">
                      {feedback.ok ? "চমৎকার! সঠিক উত্তর" : "ভুল উত্তর"}
                    </span>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => speak(word.arabic)} className="w-fit self-start sm:self-auto">
                    <Volume2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap items-baseline gap-2 sm:gap-3">
                  <span className="font-arabic text-2xl sm:text-3xl" dir="rtl">{word.arabic}</span>
                  <span className="text-xs text-muted-foreground sm:text-sm">{word.uccharon}</span>
                </div>
                {!feedback.ok && answer && (
                  <p className="mt-2 text-xs text-muted-foreground sm:text-sm">
                    Your answer: <span className="font-arabic" dir="rtl">{answer}</span>
                  </p>
                )}
                <Button onClick={nextQuestion} className="mt-4 w-full" size="lg">
                  {questionIndex + 1 >= mode.length ? "See results →" : "Next question →"}
                </Button>
              </div>
            )}

            {!feedback && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={skip} className="text-xs sm:text-sm">
                  <SkipForward className="mr-1 h-4 w-4" /> Skip / show answer
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
      </div>
      <SiteFooter compact />
    </div>
  );
}

function MenuScreen({ stats, onStart, onReset }: { stats: Stats; onStart: (length: number, practice?: boolean) => void; onReset: () => void }) {
  const lifetimeAcc = stats.lifetimeAttempted ? Math.round((stats.lifetimeCorrect / stats.lifetimeAttempted) * 100) : 0;

  return (
    <div className="min-h-dvh">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-3 pb-12 pt-6 sm:px-4 sm:pb-16 sm:pt-8 md:pb-20 md:pt-10 lg:px-8 xl:px-12"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="pointer-events-none absolute inset-0 opacity-[0.12]" aria-hidden>
          <p className="font-arabic absolute -right-6 top-8 text-[7rem] leading-none text-primary-foreground sm:-right-8 sm:top-10 sm:text-[9rem] lg:-right-4 lg:top-12 lg:text-[11rem] xl:text-[14rem]">
            عربي
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-6xl xl:max-w-7xl">
          <nav className="relative z-10 mb-8 flex w-full flex-nowrap items-center justify-between gap-4 sm:mb-10 lg:mb-12">
            <SiteLogo className="h-14 w-14 shrink-0 sm:h-16 sm:w-16 lg:h-[4.5rem] lg:w-[4.5rem]" />
            <div className="flex shrink-0 items-center gap-3 sm:gap-4 lg:gap-6">
              <div className="hidden items-center gap-5 text-sm text-primary-foreground/85 min-[480px]:flex lg:gap-8 lg:text-base">
                <a href="#features" className="transition hover:text-primary-foreground">বৈশিষ্ট্য</a>
                <a href="#how-it-works" className="transition hover:text-primary-foreground">পদ্ধতি</a>
                <a href="#quizzes" className="transition hover:text-primary-foreground">কুইজ</a>
              </div>
              {stats.lifetimeAttempted > 0 && (
                <Badge className="border-0 bg-primary-foreground/15 text-primary-foreground backdrop-blur">
                  <Flame className="mr-1 h-3.5 w-3.5 text-gold" />
                  {stats.bestStreak} streak
                </Badge>
              )}
            </div>
          </nav>

          <div className="relative z-10 mx-auto max-w-2xl text-center lg:max-w-3xl">
            <p className="font-arabic text-sm tracking-wide text-primary-foreground/80 sm:text-base" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="font-arabic mt-4 text-4xl font-bold leading-tight text-primary-foreground sm:text-5xl md:text-6xl" dir="rtl">
              تَعَلَّمِ المُفْرَدَاتِ العَرَبِيَّة
            </h1>
            <p className="mt-4 text-lg font-semibold text-primary-foreground/95 sm:text-xl">
              আরবি শব্দভাণ্ডার অনুশীলন
            </p>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-primary-foreground/80 sm:text-base">
              বাংলা অর্থ দেখে আরবি শব্দ লিখুন বা বলুন। তাৎক্ষণিক প্রতিক্রিয়া, স্ট্রিক ও অগ্রগতি ট্র্যাকিং।
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 min-[480px]:flex-row">
              <Button
                size="lg"
                onClick={() => onStart(20)}
                className="h-12 w-full min-w-[200px] rounded-xl bg-primary-foreground text-primary shadow-lg hover:bg-primary-foreground/90 min-[480px]:w-auto"
              >
                <Play className="mr-2 h-5 w-5" />
                অনুশীলন শুরু করুন
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => onStart(Math.min(20, stats.wrongIds.length || 1), true)}
                disabled={stats.wrongIds.length === 0}
                className="h-12 w-full min-w-[200px] rounded-xl border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 min-[480px]:w-auto"
              >
                ভুল শব্দ অনুশীলন ({stats.wrongIds.length})
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-5xl scroll-mt-6 px-3 py-10 sm:px-4 sm:py-12">
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-3 sm:gap-6">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.titleAr} className="border-0 p-5 text-center shadow-sm" style={{ background: "var(--gradient-card)" }}>
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-arabic mt-3 text-lg font-semibold" dir="rtl">{f.titleAr}</p>
                <p className="mt-0.5 text-sm font-medium">{f.titleBn}</p>
                <p className="mt-2 text-xs text-muted-foreground">{f.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-y bg-secondary/30 scroll-mt-6">
        <div className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-4 sm:py-12">
          <div className="mb-8 text-center sm:mb-10">
            <p className="font-arabic text-xl font-bold text-primary sm:text-2xl" dir="rtl">
              كَيْفَ يَعْمَلُ؟
            </p>
            <h2 className="mt-1 text-lg font-semibold sm:text-xl">কীভাবে কাজ করে</h2>
          </div>
          <div className="grid grid-cols-1 gap-6 min-[480px]:grid-cols-3 sm:gap-8">
            {STEPS.map((s) => (
              <div key={s.step} className="relative text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground shadow-[var(--shadow-soft)]">
                  {s.step}
                </div>
                <p className="font-arabic mt-4 text-lg font-semibold" dir="rtl">{s.titleAr}</p>
                <p className="mt-0.5 text-sm font-medium">{s.titleBn}</p>
                <p className="mt-2 text-xs text-muted-foreground sm:text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quiz modes */}
      <section id="quizzes" className="mx-auto w-full max-w-5xl scroll-mt-6 px-3 pb-6 pt-10 sm:px-4 sm:pb-8 sm:pt-12">
        <div className="mb-6 text-center sm:mb-8">
          <p className="font-arabic text-xl font-bold text-primary sm:text-2xl" dir="rtl">اخْتَرِ الاِخْتِبَار</p>
          <h2 className="mt-1 text-lg font-semibold sm:text-xl">কুইজ বেছে নিন</h2>
        </div>

        <div className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const best = stats.highScores[String(p.length)] ?? 0;
            return (
              <button
                key={p.length}
                onClick={() => onStart(p.length)}
                className="group relative overflow-hidden rounded-2xl border bg-card p-4 text-left shadow-sm transition active:scale-[0.98] hover:-translate-y-0.5 hover:border-primary hover:shadow-[var(--shadow-soft)] sm:p-5"
              >
                <div className="flex items-start gap-3 sm:block">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground sm:h-11 sm:w-11">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 sm:mt-4">
                    <p className="font-arabic text-base font-bold leading-snug sm:text-lg" dir="rtl">{p.labelAr}</p>
                    <p className="text-sm font-medium">{p.labelBn}</p>
                    <p className="text-xs text-muted-foreground">{p.subtitle}</p>
                    <p className="mt-2 text-xs text-muted-foreground sm:mt-3">
                      সেরা: <span className="font-semibold text-foreground">{best}/{p.length}</span>
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Progress */}
      <section id="progress" className="scroll-mt-6 border-y bg-secondary/30">
        <div className="mx-auto w-full max-w-5xl px-3 py-10 sm:px-4 sm:py-12">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-arabic text-lg font-bold text-primary sm:text-xl" dir="rtl">إِحْصَائِيَّاتُك</p>
              <p className="text-sm font-medium text-muted-foreground">আপনার অগ্রগতি</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onReset} className="shrink-0 text-xs sm:text-sm">
              <RotateCcw className="mr-1 h-4 w-4" /> রিসেট
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
            <StatCell label="চেষ্টা" longLabel="মোট চেষ্টা" value={stats.lifetimeAttempted} />
            <StatCell label="সঠিক" value={stats.lifetimeCorrect} tone="success" />
            <StatCell label="নির্ভুলতা" value={`${lifetimeAcc}%`} />
            <StatCell label="স্ট্রিক" longLabel="সেরা স্ট্রিক" value={stats.bestStreak} tone="success" />
          </div>
        </div>
      </section>

      <SiteFooter onStart={() => onStart(20)} />
    </div>
  );
}

function ResultsScreen({
  mode, session, stats, onAgain, onMenu, onPracticeWrong,
}: {
  mode: QuizMode;
  session: { correct: number; incorrect: number; streak: number };
  stats: Stats;
  onAgain: () => void;
  onMenu: () => void;
  onPracticeWrong: () => void;
}) {
  const pct = Math.round((session.correct / mode.length) * 100);
  const best = stats.highScores[String(mode.length)] ?? 0;
  const isNewBest = session.correct >= best && session.correct > 0;
  const message = pct >= 90 ? "মাশাআল্লাহ! Outstanding" : pct >= 70 ? "দারুণ! Great job" : pct >= 50 ? "ভালো! Keep going" : "Keep practicing — you've got this";

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex-1 px-3 py-8 sm:px-4 sm:py-12 md:py-20">
      <div className="mx-auto w-full max-w-xl">
        <Card className="border-0 p-5 text-center shadow-[var(--shadow-soft)] sm:p-8" style={{ background: "var(--gradient-card)" }}>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-3xl bg-gold/20 text-foreground sm:h-16 sm:w-16">
            <Trophy className="h-7 w-7 text-gold sm:h-8 sm:w-8" />
          </div>
          <h2 className="mt-4 text-xl font-bold sm:mt-5 sm:text-2xl md:text-3xl">{message}</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            {mode.length}-Point Quiz · {mode.practice ? "Practice" : "Standard"}
          </p>

          <div className="mt-5 rounded-2xl bg-secondary/60 p-5 sm:mt-6 sm:p-6">
            <p className="text-5xl font-bold tabular-nums sm:text-6xl">
              {session.correct}
              <span className="text-xl text-muted-foreground sm:text-2xl">/{mode.length}</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{pct}% accuracy</p>
            {isNewBest && (
              <Badge className="mt-3 bg-gold text-foreground">🏆 New personal best</Badge>
            )}
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2 sm:mt-6 sm:gap-3">
            <StatCell label="Correct" value={session.correct} tone="success" compact />
            <StatCell label="Wrong" value={session.incorrect} tone="destructive" compact />
            <StatCell label="Best" longLabel="Best run" value={Math.max(best, session.correct)} compact />
          </div>

          <div className="mt-5 flex flex-col gap-2 sm:mt-6">
            <Button size="lg" onClick={onAgain} className="w-full">Play again</Button>
            <div className="grid grid-cols-1 gap-2 min-[480px]:grid-cols-2">
              <Button variant="outline" onClick={onPracticeWrong} disabled={stats.wrongIds.length === 0} className="w-full">
                Practice wrong ({stats.wrongIds.length})
              </Button>
              <Button variant="ghost" onClick={onMenu} className="w-full">
                <Home className="mr-1 h-4 w-4" /> হোম
              </Button>
            </div>
          </div>
        </Card>
      </div>
      </div>
      <SiteFooter compact />
    </div>
  );
}

function StatCell({
  label,
  longLabel,
  value,
  tone,
  compact = false,
}: {
  label: string;
  longLabel?: string;
  value: number | string;
  tone?: "success" | "destructive";
  compact?: boolean;
}) {
  const color = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground";
  return (
    <Card className={`border-0 bg-card/70 text-center shadow-sm backdrop-blur ${compact ? "p-2.5 sm:p-4" : "p-3 sm:p-4"}`}>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground sm:text-xs">
        <span className="sm:hidden">{label}</span>
        <span className="hidden sm:inline">{longLabel ?? label}</span>
      </p>
      <p className={`mt-0.5 font-bold tabular-nums sm:mt-1 ${compact ? "text-lg sm:text-2xl" : "text-xl sm:text-2xl"} ${color}`}>{value}</p>
    </Card>
  );
}

function shuffle<T>(a: T[]): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}