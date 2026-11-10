import { Fragment, type CSSProperties, type ReactNode } from "react";

export const DISCORD = "https://discord.gg/WUhvBf6vqw";
export const GITHUB = "https://github.com/L-Ordre-Des-Devs";
export const PATREON = "https://www.patreon.com/cw/LOrdredesDevs";
export const X = "https://x.com/OrdreDesDevs";

export const vars = (v: Record<string, string | number>) => v as CSSProperties;

export function Roll({ children }: { children: string }) {
  return (
    <>
      <span className="sr-only">{children}</span>
      <span className="oz-roll" aria-hidden="true">
        {[...children].map((c, i) => {
          const ch = c === " " ? " " : c;
          return (
            <i key={i} data-c={ch} style={vars({ "--i": i })}>
              {ch}
            </i>
          );
        })}
      </span>
    </>
  );
}

export function Scrub({ text }: { text: string }) {
  const words = text.split(/[^\S  ]+/);
  return (
    <span data-scrub>
      {words.map((w, i) => (
        <Fragment key={i}>
          <span className="oz-w">{w}</span>
          {i < words.length - 1 ? " " : ""}
        </Fragment>
      ))}
    </span>
  );
}

export function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

export function Construct({ className = "", fill = false }: { className?: string; fill?: boolean }) {
  const outer = [
    [-0.55, -1],
    [0.55, -1],
    [-0.55, 1],
    [0.55, 1],
    [-1, -0.55],
    [-1, 0.55],
    [1, -0.55],
    [1, 0.55],
  ];
  const inner = [
    [-0.36, -0.7215],
    [0.36, -0.7215],
    [-0.36, 0.7215],
    [0.36, 0.7215],
    [-0.7215, -0.36],
    [-0.7215, 0.36],
    [0.7215, -0.36],
    [0.7215, 0.36],
  ];
  return (
    <svg className={`oz-construct ${className}`} viewBox="-1.5 -1.5 3 3" aria-hidden="true">
      {[-1, -0.72, 0.72, 1].map((k) => (
        <g key={k}>
          <line x1="-1.5" y1={k} x2="1.5" y2={k} />
          <line x1={k} y1="-1.5" x2={k} y2="1.5" />
        </g>
      ))}
      {fill && <circle className="fill" r="0.861" pathLength={100} />}
      <circle className="circle" r="1" />
      <circle className="circle" r="0.826" />
      <circle className="circle" r="0.7215" />
      <path className="handle" d="M-0.55 -1H0.55M-0.55 1H0.55M-1 -0.55V0.55M1 -0.55V0.55" />
      <path className="handle" d="M-0.36 -0.7215H0.36M-0.36 0.7215H0.36M-0.7215 -0.36V0.36M0.7215 -0.36V0.36" />
      {outer.map(([x, y], i) => (
        <circle key={`o${i}`} className="knot" cx={x} cy={y} r="0.02" />
      ))}
      {inner.map(([x, y], i) => (
        <circle key={`i${i}`} className="knot" cx={x} cy={y} r="0.014" />
      ))}
      {[
        [0, -1],
        [0, 1],
        [-1, 0],
        [1, 0],
      ].map(([x, y], i) => (
        <rect key={`r${i}`} className="knot" x={x - 0.025} y={y - 0.025} width="0.05" height="0.05" />
      ))}
    </svg>
  );
}

export function Out({
  href,
  className = "",
  style,
  tabIndex,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  tabIndex?: number;
  children: ReactNode;
}) {
  return (
    <a href={href} className={className} style={style} tabIndex={tabIndex} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}
