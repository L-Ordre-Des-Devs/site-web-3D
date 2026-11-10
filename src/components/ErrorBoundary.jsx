import React from "react";
import { langOf } from "../i18n";

const TEXT = {
  fr: {
    title: "Quelque chose a cassé",
    text: "Une erreur inattendue s'est produite. Rechargez la page ou revenez à l'accueil.",
    reload: "Recharger",
    home: "Retour à l'accueil",
    href: "/",
  },
  en: {
    title: "Something broke",
    text: "An unexpected error occurred. Reload the page or go back to the home page.",
    reload: "Reload",
    home: "Back to the home page",
    href: "/en",
  },
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Erreur de rendu :", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const t = TEXT[langOf(window.location.pathname)];

    return (
      <div
        className="flex min-h-screen items-center justify-center px-6 text-center"
        style={{ background: "#100904", color: "#ffedd7", fontFamily: '"Figtree Variable", Figtree, system-ui, sans-serif' }}
      >
        <div className="max-w-md">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em]" style={{ opacity: 0.6 }}>
            L'Ordre des Devs
          </p>
          <h1 className="mb-4 text-3xl font-bold">{t.title}</h1>
          <p className="mb-8" style={{ opacity: 0.75 }}>
            {t.text}
          </p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full px-6 py-3 font-bold"
              style={{ background: "#ffedd7", color: "#100904" }}
            >
              {t.reload}
            </button>
            <a
              href={t.href}
              className="rounded-full px-6 py-3 font-bold"
              style={{ border: "1px dotted rgb(255 237 215 / 0.5)", color: "#ffedd7" }}
            >
              {t.home}
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
