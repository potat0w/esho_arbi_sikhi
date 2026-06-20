import logoSrc from "../assets/eas.png";

type SiteLogoProps = {
  className?: string;
};

export function SiteLogo({ className = "h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28" }: SiteLogoProps) {
  return (
    <img
      src={logoSrc}
      alt="এসো আরবি শিখি"
      className={`rounded-full object-cover ${className}`}
    />
  );
}

export { logoSrc };
