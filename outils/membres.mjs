import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const UI = fileURLToPath(new URL("../src/home/ui.tsx", import.meta.url));
const OUT = fileURLToPath(new URL("../src/home/membres.ts", import.meta.url));

const invite = readFileSync(UI, "utf8").match(/discord\.gg\/([\w-]+)/)?.[1];
const before = existsSync(OUT) ? readFileSync(OUT, "utf8").match(/count: (\d+)/)?.[1] : undefined;

try {
  if (!invite) throw new Error("lien d'invitation introuvable dans src/home/ui.tsx");
  const res = await fetch(`https://discord.com/api/v10/invites/${invite}?with_counts=true`, {
    headers: { "User-Agent": "ordre-des-devs-build" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Discord a répondu ${res.status}`);
  const count = (await res.json()).approximate_member_count;
  if (!Number.isInteger(count) || count <= 0) throw new Error("nombre de membres absent de la réponse");
  const date = new Date().toISOString().slice(0, 10);
  writeFileSync(OUT, `export const MEMBRES = { count: ${count}, date: "${date}" } as const;\n`);
  console.log(`Membres du serveur : ${count} (relevé du ${date}${before && before !== String(count) ? `, avant ${before}` : ""}).`);
} catch (e) {
  if (!before) throw e;
  console.warn(`Membres du serveur : pas de mise à jour (${e.message}). Le site garde ${before}.`);
}
