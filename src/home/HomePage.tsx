import "@fontsource-variable/figtree";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/dm-mono/400.css";
import "@fontsource/dm-mono/500.css";
import "@fontsource/literata/400.css";
import "@fontsource/literata/500.css";
import "@fontsource/literata/400-italic.css";
import "./home.css";
import { useEffect, useRef } from "react";
import { useSeo } from "../hooks/useSeo";
import { useLang } from "../i18n";
import { PAGES } from "../seo/site.mjs";
import { Header, Loader, ScrollUI, SkipLink } from "./chrome";
import { setHyperspace } from "../console";
import { ExperienceContext } from "./context";
import { Experience } from "./experience";
import { Cipher } from "./sections/cipher";
import { Macro } from "./sections/craft";
import { Salons } from "./sections/salons";
import { End, Faq } from "./sections/joining";
import { Partner } from "./sections/partner";
import { Ask, Hero, Intro } from "./sections/opening";
import { Poles, Wordmark } from "./sections/poles";
import { Fleet, Season } from "./sections/fleet";
import { Challenges } from "./sections/platform";
import { Archives, Infos } from "./sections/reading";

export default function HomePage() {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const experience = useRef<Experience | null>(null);

  useSeo({ description: PAGES["/"][useLang()].description, path: "/" });

  useEffect(() => {
    const html = document.documentElement;
    html.classList.add("odd");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const light = window.matchMedia("(pointer: coarse)").matches || Math.min(window.screen.width, window.screen.height) < 700;
    const exp = new Experience(root.current!, canvas.current!, { reduced, quality: light ? 0.5 : 1 });
    experience.current = exp;
    exp.start();
    setHyperspace(() => exp.jump());
    return () => {
      setHyperspace(null);
      exp.dispose();
      experience.current = null;
      html.classList.remove("odd");
      html.style.background = "";
    };
  }, []);

  return (
    <ExperienceContext.Provider value={experience}>
      <div ref={root} className="relative font-oz text-oz-cream">
        <SkipLink />
        <canvas ref={canvas} className="oz-stage" aria-hidden="true" />
        <Loader />
        <Header />
        <ScrollUI />
        <main id="contenu" className="relative z-[1]">
          <Hero />
          <Intro />
          <Ask />
          <Poles />
          <Wordmark />
          <Fleet />
          <Cipher />
          <Macro />
          <Infos />
          <Challenges />
          <Season />
          <Archives />
          <Salons />
          <Partner />
          <Faq />
        </main>
        <End />
      </div>
    </ExperienceContext.Provider>
  );
}
