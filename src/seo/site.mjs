export const SITE_NAME = "L'Ordre des Devs";
export const SITE_URL = "https://ordre-des-devs.org";
export const DEFAULT_IMAGE = `${SITE_URL}/banner-og-hero.jpg`;
export const LOGO = `${SITE_URL}/hero-logo-640.png`;
export const OG_LOCALE = { fr: "fr_FR", en: "en_US" };

export const localPath = (path, lang) => (lang === "fr" ? path : path === "/" ? "/en" : `/en${path}`);

export const PAGES = {
  "/": {
    fr: {
      title: `${SITE_NAME} : Communauté de développeurs et cybersécurité`,
      description:
        "Communauté francophone de développeurs et de passionnés de cybersécurité : entraide quotidienne, articles techniques, CTF et game jams.",
    },
    en: {
      title: `${SITE_NAME}: French-speaking developer and cybersecurity community`,
      description:
        "French-speaking community of developers and cybersecurity enthusiasts: daily help, technical articles, CTFs and game jams.",
    },
  },
  "/threads": {
    fr: {
      title: "Articles",
      description:
        "Articles techniques, tutoriels et guides écrits par la communauté : développement, cybersécurité, game dev et plus encore.",
    },
    en: {
      title: "Articles",
      description: "Technical articles, tutorials and guides written by the community: development, cybersecurity, game dev and more.",
    },
  },
  "/legal": {
    fr: {
      title: "Mentions légales",
      description: "Mentions légales, hébergement et politique de confidentialité du site de L'Ordre des Devs.",
    },
    en: {
      title: "Legal notice",
      description: "Legal notice, hosting details and privacy policy of ordre-des-devs.org, the website of L'Ordre des Devs.",
    },
  },
};

export const fullTitle = (title, lang) => (title ? `${title} · ${SITE_NAME}` : PAGES["/"][lang].title);

const inLang = (article, lang) => (lang === "en" && article.en ? article.en : article);

function breadcrumb(lang, steps) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: SITE_NAME, path: "/" }, ...steps].map((step, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: step.name,
      item: SITE_URL + localPath(step.path, lang),
    })),
  };
}

export function pageSchema(path, lang, article) {
  if (article) {
    const own = `/threads/${article.slug}`;
    const url = SITE_URL + localPath(own, lang);
    const text = inLang(article, lang);
    return [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": `${url}#article`,
        mainEntityOfPage: url,
        headline: text.title,
        description: text.excerpt,
        inLanguage: lang,
        datePublished: article.date,
        author: { "@type": "Person", name: article.author },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: LOGO } },
        image: DEFAULT_IMAGE,
        ...(lang === "en" ? { translationOfWork: { "@id": `${SITE_URL}${own}#article` } } : {}),
      },
      breadcrumb(lang, [
        { name: PAGES["/threads"][lang].title, path: "/threads" },
        { name: text.title, path: own },
      ]),
    ];
  }
  if (path === "/threads" || path === "/legal") return [breadcrumb(lang, [{ name: PAGES[path][lang].title, path }])];
  return [];
}
