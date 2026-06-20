type SiteFooterProps = {
  compact?: boolean;
  onStart?: () => void;
};

export function SiteFooter({ compact = false, onStart }: SiteFooterProps) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer className="border-t bg-card/50 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-center min-[480px]:flex-row min-[480px]:text-left">
          <p className="font-arabic text-sm font-semibold text-primary" dir="rtl">
            esho.arbi.sikhi
          </p>
          <p className="text-xs text-muted-foreground">
            © {year} · <span className="font-arabic" dir="rtl">بارك الله فيكم</span>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t bg-card/80">
      {/* Final CTA band */}
      {onStart && (
        <div
          className="border-b px-3 py-10 sm:px-4 sm:py-12"
          style={{ background: "var(--gradient-hero)" }}
        >
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-arabic text-2xl font-bold text-primary-foreground sm:text-3xl" dir="rtl">
              اِبْدَأِ التَّعَلُّمَ اليَوْم
            </p>
            <p className="mt-2 text-sm text-primary-foreground/85 sm:text-base">
              আজই অনুশীলন শুরু করুন — বিনামূল্যে, ব্রাউজারেই
            </p>
            <button
              type="button"
              onClick={onStart}
              className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-primary-foreground px-8 text-sm font-semibold text-primary shadow-lg transition hover:bg-primary-foreground/90"
            >
              অনুশীলন শুরু করুন
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-3 py-10 sm:px-4 sm:py-12">
        <div className="grid grid-cols-1 gap-8 min-[480px]:grid-cols-2 md:grid-cols-4">
          <div className="min-[480px]:col-span-2 md:col-span-1">
            <p className="font-arabic text-xl font-bold text-primary" dir="rtl">
              esho.arbi.sikhi
            </p>
            <p className="font-arabic mt-2 text-sm leading-relaxed text-muted-foreground" dir="rtl">
              تَعَلَّمِ المُفْرَدَاتِ العَرَبِيَّة
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              বাংলা অর্থ দেখে আরবি শব্দ লিখুন ও উচ্চারণ করুন।
            </p>
          </div>

          <div>
            <p className="font-arabic text-sm font-semibold text-foreground" dir="rtl">
              روابط
            </p>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              লিংক
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="transition hover:text-primary">
                  বৈশিষ্ট্য
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="transition hover:text-primary">
                  কীভাবে কাজ করে
                </a>
              </li>
              <li>
                <a href="#quizzes" className="transition hover:text-primary">
                  কুইজ
                </a>
              </li>
              <li>
                <a href="#progress" className="transition hover:text-primary">
                  অগ্রগতি
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-arabic text-sm font-semibold text-foreground" dir="rtl">
              الطريقة
            </p>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              পদ্ধতি
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>বাংলা অর্থ পড়ুন</li>
              <li>আরবি শব্দ লিখুন বা বলুন</li>
              <li>তাৎক্ষণিক প্রতিক্রিয়া পান</li>
              <li>ভুল শব্দ আবার অনুশীলন করুন</li>
            </ul>
          </div>

          <div>
            <p className="font-arabic text-sm font-semibold text-foreground" dir="rtl">
              حول
            </p>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              সম্পর্কে
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>কথ্য + লিখিত অনুশীলন</li>
              <li>স্ট্রিক ও স্কোর ট্র্যাকিং</li>
              <li>ব্রাউজার-ভিত্তিক — অ্যাপ লাগে না</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-center">
          <p className="font-arabic text-sm text-primary" dir="rtl">
            بارك الله فيكم
          </p>
        </div>
      </div>
    </footer>
  );
}
