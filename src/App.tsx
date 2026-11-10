import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Navigate, Outlet, Routes, Route, useLocation } from "react-router-dom";
import { useSmoothScroll, getLenis } from "./hooks/useSmoothScroll";
import ErrorBoundary from "./components/ErrorBoundary";
import HomePage from "./home/HomePage";
import { LangContext, type Lang } from "./i18n";

const LegalPage = lazy(() => import("./site/LegalPage"));
const ArticlesPage = lazy(() => import("./site/ArticlesPage"));
const ArticlePage = lazy(() => import("./site/ArticlePage"));

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { immediate: true });
    else window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);
  return null;
};

const SmoothScroll = () => {
  useSmoothScroll();
  return null;
};

const LangRoot = ({ lang }: { lang: Lang }) => {
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  return (
    <LangContext.Provider value={lang}>
      <Outlet />
    </LangContext.Provider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <SmoothScroll />
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen bg-[#07050a]" aria-busy="true" />}>
          <Routes>
            <Route element={<LangRoot lang="fr" />}>
              <Route path="/" element={<HomePage key="fr" />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/threads" element={<ArticlesPage />} />
              <Route path="/threads/:slug" element={<ArticlePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
            <Route path="/en" element={<LangRoot lang="en" />}>
              <Route index element={<HomePage key="en" />} />
              <Route path="legal" element={<LegalPage />} />
              <Route path="threads" element={<ArticlesPage />} />
              <Route path="threads/:slug" element={<ArticlePage />} />
              <Route path="*" element={<Navigate to="/en" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
