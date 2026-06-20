import { ArrowRight } from "lucide-react";
import { SiteLogo } from "./site-logo";
import ctaImage from "../assets/cta.jpg";

type SiteCtaProps = {
  onStart: () => void;
};

export function SiteCta({ onStart }: SiteCtaProps) {
  return (
    <section className="border-y bg-background">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-3 py-12 sm:px-4 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div className="order-2 lg:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            শুরু করুন
          </p>
          <p
            className="font-arabic mt-3 text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
            dir="rtl"
          >
            اِبْدَأِ التَّعَلُّمَ اليَوْم
          </p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
            আজই অনুশীলন শুরু করুন — বিনামূল্যে, ব্রাউজারেই। বাংলা অর্থ দেখে আরবি শব্দ
            লিখুন বা বলুন, তাৎক্ষণিক প্রতিক্রিয়া ও অগ্রগতি ট্র্যাক করুন।
          </p>

          <div className="mt-8 flex flex-col gap-5 min-[480px]:flex-row min-[480px]:items-center">
            <button
              type="button"
              onClick={onStart}
              className="group inline-flex h-14 items-center gap-4 rounded-sm bg-[#006F50] pl-6 pr-2 text-sm font-semibold text-white shadow-md transition hover:brightness-110 active:scale-[0.98]"
            >
              <span>অনুশীলন শুরু করুন</span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/10 transition group-hover:bg-white/20">
                <ArrowRight className="h-4 w-4" />
              </span>
            </button>

            <div className="flex items-center gap-3">
              <SiteLogo className="h-12 w-12 sm:h-14 sm:w-14" />
              <div>
                <p className="text-xs text-muted-foreground">এসো আরবি শিখি</p>
                <p className="font-bangla-script text-lg leading-tight text-foreground">
                  esho.arbi.sikhi
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div className="relative mx-auto aspect-[4/3] max-w-xl overflow-hidden rounded-sm shadow-[0_20px_50px_-12px_rgba(0,111,80,0.35)] lg:max-w-none">
            <img
              src={ctaImage}
              alt="এসো আরবি শিখি — আরবি শব্দভাণ্ডার অনুশীলন"
              className="h-full w-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
