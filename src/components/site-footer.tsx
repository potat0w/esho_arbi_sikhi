import { SiteLogo } from "./site-logo";
import { SiteCta } from "./site-cta";

type SiteFooterProps = {
  compact?: boolean;
  onStart?: () => void;
};

export function SiteFooter({ compact = false, onStart }: SiteFooterProps) {
  const year = new Date().getFullYear();

  if (compact) {
    return (
      <footer
        className="border-t border-white/10 px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-4"
        style={{ background: "#006F50" }}
      >
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 text-center min-[480px]:flex-row min-[480px]:text-left">
          <SiteLogo className="h-14 w-14" />
          <p className="text-xs text-white/80">
            © {year} · <span className="font-arabic" dir="rtl">بارك الله فيكم</span>
          </p>
        </div>
      </footer>
    );
  }

  return (
    <footer>
      {onStart && <SiteCta onStart={onStart} />}

      <div style={{ background: "#006F50" }}>
        <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <div className="py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 min-[480px]:grid-cols-2 md:grid-cols-4">
          <div className="min-[480px]:col-span-2 md:col-span-1">
            <SiteLogo className="h-20 w-20 sm:h-24 sm:w-24" />
            <p className="font-arabic mt-2 text-sm leading-relaxed text-white/75" dir="rtl">
              تَعَلَّمِ المُفْرَدَاتِ العَرَبِيَّة
            </p>
            <p className="mt-2 text-sm text-white/75">
              বাংলা অর্থ দেখে আরবি শব্দ লিখুন ও উচ্চারণ করুন।
            </p>
          </div>

          <div>
            <p className="font-arabic text-sm font-semibold text-white" dir="rtl">
              روابط
            </p>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
              লিংক
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <a href="#features" className="transition hover:text-white">
                  বৈশিষ্ট্য
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="transition hover:text-white">
                  কীভাবে কাজ করে
                </a>
              </li>
              <li>
                <a href="#quizzes" className="transition hover:text-white">
                  কুইজ
                </a>
              </li>
              <li>
                <a href="#progress" className="transition hover:text-white">
                  অগ্রগতি
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="font-arabic text-sm font-semibold text-white" dir="rtl">
              الطريقة
            </p>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
              পদ্ধতি
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>বাংলা অর্থ পড়ুন</li>
              <li>আরবি শব্দ লিখুন বা বলুন</li>
              <li>তাৎক্ষণিক প্রতিক্রিয়া পান</li>
              <li>ভুল শব্দ আবার অনুশীলন করুন</li>
            </ul>
          </div>

          <div>
            <p className="font-arabic text-sm font-semibold text-white" dir="rtl">
              حول
            </p>
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-white/60">
              সম্পর্কে
            </p>
            <ul className="space-y-2 text-sm text-white/80">
              <li>কথ্য + লিখিত অনুশীলন</li>
              <li>স্ট্রিক ও স্কোর ট্র্যাকিং</li>
              <li>ব্রাউজার-ভিত্তিক — অ্যাপ লাগে না</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/15 pt-6 text-center">
          <p className="font-arabic text-sm text-white/90" dir="rtl">
            بارك الله فيكم
          </p>
        </div>
        </div>
        </div>
      </div>
    </footer>
  );
}
