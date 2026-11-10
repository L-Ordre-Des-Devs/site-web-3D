import { createContext, useContext } from "react";

export type Lang = "fr" | "en";

export const LangContext = createContext<Lang>("fr");

export const useLang = () => useContext(LangContext);

export const langOf = (pathname: string): Lang => (/^\/en(\/|$)/.test(pathname) ? "en" : "fr");

export const to = (path: string, lang: Lang) => (lang === "fr" ? path : path === "/" ? "/en" : `/en${path}`);

export const twin = (pathname: string, lang: Lang) => to(pathname.replace(/^\/en(?=\/|$)/, "") || "/", lang);

export const LOCALE: Record<Lang, string> = { fr: "fr-FR", en: "en-US" };

export const texts = <T>(t: { fr: T; en: NoInfer<T> }) => t;
