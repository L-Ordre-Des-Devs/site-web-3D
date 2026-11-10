import { useEffect, useMemo } from "react";
import { to, useLang } from "../i18n";
import { DEFAULT_IMAGE, OG_LOCALE, SITE_NAME, SITE_URL, fullTitle, pageSchema } from "../seo/site.mjs";

interface SeoOptions {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  type?: string;
  robots?: string;
  jsonLd?: object | object[];
  article?: object;
}

const upsertMeta = (attribute: string, name: string, content: string | undefined) => {
  let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, name);
    document.head.appendChild(element);
  }
  element.setAttribute("content", String(content));
};

const setLink = (rel: string, href: string) => {
  let element = document.head.querySelector(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", rel);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

const setAlternate = (hreflang: string, href: string) => {
  let element = document.head.querySelector(`link[rel="alternate"][hreflang="${hreflang}"]`);
  if (!element) {
    element = document.createElement("link");
    element.setAttribute("rel", "alternate");
    element.setAttribute("hreflang", hreflang);
    document.head.appendChild(element);
  }
  element.setAttribute("href", href);
};

export const useSeo = ({ title, description, path, image, imageAlt, type = "website", robots = "index, follow", jsonLd, article }: SeoOptions) => {
  const lang = useLang();
  useEffect(() => {
    const full = fullTitle(title, lang);
    const url = `${SITE_URL}${path ? to(path, lang) : window.location.pathname}`;
    const cover = image || DEFAULT_IMAGE;

    document.title = full;
    upsertMeta("name", "description", description);
    upsertMeta("name", "robots", robots);
    setLink("canonical", url);
    if (path) {
      setAlternate("fr", `${SITE_URL}${path}`);
      setAlternate("en", `${SITE_URL}${to(path, "en")}`);
      setAlternate("x-default", `${SITE_URL}${path}`);
    }
    upsertMeta("property", "og:locale", OG_LOCALE[lang]);

    upsertMeta("property", "og:title", full);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", url);
    upsertMeta("property", "og:type", type);
    upsertMeta("property", "og:image", cover);
    upsertMeta("property", "og:image:alt", imageAlt || SITE_NAME);
    upsertMeta("name", "twitter:title", full);
    upsertMeta("name", "twitter:description", description);
    upsertMeta("name", "twitter:image", cover);

    document.head.querySelectorAll('script[data-route="static"]').forEach((node) => node.remove());
  }, [title, description, path, image, imageAlt, type, robots, lang]);

  const blocks = useMemo(
    () => [...(path ? pageSchema(path, lang, article) : []), ...(jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [])],
    [path, lang, article, jsonLd],
  );
  useEffect(() => {
    if (!blocks.length) return undefined;
    const nodes = blocks.map((block) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.route = "true";
      script.textContent = JSON.stringify(block);
      document.head.appendChild(script);
      return script;
    });
    return () => nodes.forEach((node) => node.remove());
  }, [blocks]);
};
