const withAlpha = (variable) => `rgb(var(${variable}) / <alpha-value>)`;

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: withAlpha("--c-canvas"),
        surface: withAlpha("--c-surface"),
        raised: withAlpha("--c-raised"),
        line: withAlpha("--c-line"),
        ink: withAlpha("--c-ink"),
        muted: withAlpha("--c-muted"),
        subtle: withAlpha("--c-subtle"),
        accent: withAlpha("--c-accent"),
        "accent-ink": withAlpha("--c-accent-ink"),
        positive: withAlpha("--c-positive"),
        warning: withAlpha("--c-warning"),
        "hue-1": withAlpha("--c-hue-1"),
        "hue-2": withAlpha("--c-hue-2"),
        "hue-3": withAlpha("--c-hue-3"),
        oz: {
          cream: "#ffedd7",
          ink: "#100904",
          grey: "#6c5f51",
          green: "#445231",
          moss: "#5d6c49",
          sand: "#f6e0c6",
          orange: "#dc5000",
          ember: "#ff8a3d",
          brown: "#382416",
          night: "#160f0a",
        },
      },
      fontFamily: {
        display: ["Inter Tight", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
        oz: ['"Figtree Variable"', "Figtree", "ui-sans-serif", "system-ui", "sans-serif"],
        "oz-display": ['"Archivo Variable"', "Archivo", "ui-sans-serif", "system-ui", "sans-serif"],
        "oz-mono": ['"DM Mono"', "ui-monospace", "monospace"],
        "oz-serif": ["Literata", "Georgia", "serif"],
      },
      fontSize: {
        eyebrow: ["0.75rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
        display: [
          "clamp(2.75rem, 1.6rem + 5.2vw, 5.5rem)",
          { lineHeight: "0.95", letterSpacing: "-0.045em" },
        ],
        title: [
          "clamp(1.75rem, 1.2rem + 2.2vw, 2.75rem)",
          { lineHeight: "1.1", letterSpacing: "-0.03em" },
        ],
        lead: [
          "clamp(1rem, 0.95rem + 0.35vw, 1.175rem)",
          { lineHeight: "1.6", letterSpacing: "-0.005em" },
        ],
        "oz-h1": ["var(--oz-h1)", { lineHeight: "0.86", letterSpacing: "-0.02em" }],
        "oz-h2": ["var(--oz-h2)", { lineHeight: "0.98" }],
        "oz-h3": ["var(--oz-h3)", { lineHeight: "1.02" }],
        "oz-h4": ["var(--oz-h4)", { lineHeight: "1.05" }],
        "oz-h5": ["var(--oz-h5)", { lineHeight: "1.12" }],
        "oz-sub1": ["var(--oz-sub1)", { lineHeight: "1.15" }],
        "oz-sub2": ["var(--oz-sub2)", { lineHeight: "1.25", letterSpacing: "0.02em" }],
        "oz-body1": ["var(--oz-body1)", { lineHeight: "1.3" }],
        "oz-body2": ["var(--oz-body2)", { lineHeight: "1.35" }],
        "oz-body3": ["var(--oz-body3)", { lineHeight: "1.45" }],
      },
      spacing: {
        pad: "var(--oz-pad)",
      },
      borderRadius: {
        DEFAULT: "4px",
        md: "6px",
        lg: "8px",
      },
      maxWidth: {
        prose: "68ch",
      },
      transitionDuration: {
        DEFAULT: "160ms",
      },
    },
  },
  plugins: [],
};
