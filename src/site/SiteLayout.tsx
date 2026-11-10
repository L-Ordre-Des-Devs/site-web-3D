import "@fontsource-variable/figtree";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "@fontsource/literata/400.css";
import "@fontsource/literata/500.css";
import "@fontsource/literata/400-italic.css";
import "../home/home.css";
import { useEffect, type ReactNode } from "react";
import { Header, SkipLink, Sky } from "../home/chrome";
import { End } from "../home/sections/joining";
import { to, useLang } from "../i18n";

export function SiteLayout({ children }: { children: ReactNode }) {
  const lang = useLang();
  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("odd", "oz-ready", "oz-site");
    html.dataset.header = "dark";
    return () => {
      html.classList.remove("odd", "oz-ready", "oz-site");
      delete html.dataset.header;
    };
  }, []);

  return (
    <div className="relative min-h-screen font-oz text-oz-cream">
      <div className="oz-site-sky" aria-hidden="true">
        <Sky className="absolute inset-0 h-full w-full opacity-80" scale={0.5} />
      </div>
      <SkipLink />
      <Header base={to("/", lang)} />
      <main id="contenu" className="relative z-[1]">
        {children}
      </main>
      <End />
    </div>
  );
}
