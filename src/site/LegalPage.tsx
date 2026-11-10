import { useSeo } from "../hooks/useSeo";
import { useLang } from "../i18n";
import { LegalContent } from "../legal";
import { PAGES } from "../seo/site.mjs";
import { SiteLayout } from "./SiteLayout";

export default function LegalPage() {
  useSeo({ ...PAGES["/legal"][useLang()], path: "/legal" });
  return (
    <SiteLayout>
      <div className="oz-prose oz-legal pt-[6vh]">
        <LegalContent as="div" />
      </div>
    </SiteLayout>
  );
}
