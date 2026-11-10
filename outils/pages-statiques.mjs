import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { runInNewContext } from 'node:vm';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const PROJECT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BUILD = process.argv[2] ? resolve(process.argv[2]) : resolve(PROJECT, process.env.BUILD_PATH || 'build');

function fail(message) {
  console.error(`pages-statiques : ${message}`);
  process.exit(1);
}

async function read(path) {
  try {
    return await readFile(path, 'utf8');
  } catch {
    fail(`impossible de lire ${path}`);
  }
}

const SEO_FILE = 'src/seo/site.mjs';
const seo = await import(pathToFileURL(join(PROJECT, SEO_FILE)).href).catch((err) => fail(`${SEO_FILE} illisible : ${err.message}`));
const { SITE_URL, OG_LOCALE, PAGES, fullTitle, localPath, pageSchema } = seo;
if (!/^https:\/\/[^/]+$/.test(SITE_URL)) fail(`SITE_URL inattendu dans ${SEO_FILE} : ${SITE_URL}`);
for (const path of ['/', '/threads', '/legal']) {
  for (const lang of ['fr', 'en']) {
    if (!PAGES[path]?.[lang]?.title || !PAGES[path][lang].description) fail(`${SEO_FILE} : titre ou description manquant pour ${path} (${lang})`);
  }
}

const ARTICLES_FILE = 'src/pages/threads/index.js';
const code = await read(join(PROJECT, ARTICLES_FILE));
const START = 'export const articles = [';
const from = code.indexOf(START);
const to = from < 0 ? -1 : code.indexOf('\n];', from);
if (to < 0) fail(`${ARTICLES_FILE} : tableau « export const articles = [ … ]; » introuvable, adapter ce script`);
let articles;
try {
  articles = runInNewContext(`(${code.slice(from + START.length - 1, to + 2)})`, Object.create(null), { timeout: 1000 });
} catch (err) {
  fail(`${ARTICLES_FILE} : le tableau des articles ne se lit pas seul (${err.message}) ; il ne doit contenir que des textes`);
}
if (!Array.isArray(articles) || !articles.length) fail(`${ARTICLES_FILE} : aucun article`);
for (const a of articles) {
  if (!/^[a-z0-9-]+$/.test(a.slug ?? '')) fail(`${ARTICLES_FILE} : adresse d'article inattendue « ${a.slug} »`);
  for (const key of ['title', 'excerpt', 'author', 'date']) if (!a[key]) fail(`${ARTICLES_FILE} : article ${a.slug} sans ${key}`);
  if (!a.en?.title || !a.en?.excerpt) fail(`${ARTICLES_FILE} : article ${a.slug} sans titre ou résumé anglais (clé en)`);
}

const pages = [{ path: '/', lang: 'en', file: 'index.en.html', title: fullTitle(undefined, 'en'), description: PAGES['/'].en.description, type: 'website' }];
for (const lang of ['fr', 'en']) {
  for (const path of ['/threads', '/legal']) {
    pages.push({ path, lang, title: fullTitle(PAGES[path][lang].title, lang), description: PAGES[path][lang].description, type: 'website' });
  }
  for (const article of articles) {
    const text = lang === 'en' ? article.en : article;
    pages.push({ path: `/threads/${article.slug}`, lang, title: fullTitle(text.title, lang), description: text.excerpt, type: 'article', article });
  }
}
for (const page of pages) page.file ??= `pages/${localPath(page.path, page.lang).slice(1)}.html`;

const SOURCE = join(BUILD, 'index.html');
const template = await read(SOURCE);
if (template.includes('%PUBLIC_URL%')) fail(`${SOURCE} n'est pas une page construite (elle contient %PUBLIC_URL%) : lancer d'abord le build`);
if (template.split('</head>').length !== 2) fail(`${SOURCE} : il faut une balise </head>, et une seule`);

const escapeAttr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeText = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

const TAG = /<(html|meta|link)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
const ATTR = /([^\s"'=<>/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;

function signature(name, attrs) {
  if (name === 'html') return 'html';
  if (name === 'link' && attrs.get('rel')?.value === 'alternate' && attrs.has('hreflang')) {
    return `link rel=alternate hreflang=${attrs.get('hreflang').value}`;
  }
  for (const key of ['name', 'property', 'rel']) if (attrs.has(key)) return `${name} ${key}=${attrs.get(key).value}`;
  return name;
}

function render(page) {
  const url = SITE_URL + localPath(page.path, page.lang);
  const changes = {
    html: ['lang', page.lang],
    'link rel=canonical': ['href', url],
    'link rel=alternate hreflang=fr': ['href', SITE_URL + page.path],
    'link rel=alternate hreflang=en': ['href', SITE_URL + localPath(page.path, 'en')],
    'link rel=alternate hreflang=x-default': ['href', SITE_URL + page.path],
    'meta name=description': ['content', page.description],
    'meta property=og:locale': ['content', OG_LOCALE[page.lang]],
    'meta property=og:type': ['content', page.type],
    'meta property=og:url': ['content', url],
    'meta property=og:title': ['content', page.title],
    'meta property=og:description': ['content', page.description],
    'meta name=twitter:title': ['content', page.title],
    'meta name=twitter:description': ['content', page.description],
  };
  const seen = Object.fromEntries(Object.keys(changes).map((key) => [key, 0]));
  let html = template.replace(TAG, (tag, name, inner) => {
    const attrs = new Map();
    for (const m of inner.matchAll(ATTR)) {
      attrs.set(m[1].toLowerCase(), { value: m[2] ?? m[3] ?? m[4] ?? '', start: m.index, end: m.index + m[0].length });
    }
    const sig = signature(name.toLowerCase(), attrs);
    if (!(sig in changes)) return tag;
    seen[sig] += 1;
    const [key, value] = changes[sig];
    const target = attrs.get(key);
    if (!target) fail(`${SOURCE} : la balise ${sig} n'a pas d'attribut ${key}`);
    return `<${name}${inner.slice(0, target.start)}${key}="${escapeAttr(value)}"${inner.slice(target.end)}>`;
  });
  let titles = 0;
  html = html.replace(/<title>[\s\S]*?<\/title>/gi, () => {
    titles += 1;
    return `<title>${escapeText(page.title)}</title>`;
  });
  const wrong = Object.entries({ title: titles, ...seen }).filter(([, count]) => count !== 1);
  if (wrong.length) fail(`${SOURCE} : balises absentes ou en double, rien n'est écrit : ${wrong.map(([sig, count]) => `${sig} (${count})`).join(', ')}`);
  const ld = pageSchema(page.path, page.lang, page.article)
    .map((block) => `<script type="application/ld+json" data-route="static">${JSON.stringify(block).replace(/</g, '\\u003c')}</script>`)
    .join('');
  return html.replace('</head>', `${ld}</head>`);
}

for (const page of pages) {
  const target = join(BUILD, page.file);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, render(page), 'utf8');
}
console.log(`${pages.length} pages écrites dans ${BUILD} (index.en.html et pages/…) :`);
for (const page of pages) console.log(`  ${localPath(page.path, page.lang).padEnd(42)} ${page.file}`);

const COMPRESSIBLE = /\.(js|css|svg|json|xml|txt)$/;
async function* files(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* files(path);
    else yield path;
  }
}
let count = 0;
let raw = 0;
let brotli = 0;
for await (const file of files(BUILD)) {
  if (!COMPRESSIBLE.test(file) || /LICENSE\.txt$/.test(file)) continue;
  const data = await readFile(file);
  if (data.length < 1024) continue;
  const br = brotliCompressSync(data, {
    params: { [constants.BROTLI_PARAM_QUALITY]: 11, [constants.BROTLI_PARAM_SIZE_HINT]: data.length, [constants.BROTLI_PARAM_MODE]: constants.BROTLI_MODE_TEXT },
  });
  const gz = gzipSync(data, { level: 9 });
  if (br.length < data.length) await writeFile(`${file}.br`, br);
  if (gz.length < data.length) await writeFile(`${file}.gz`, gz);
  count += 1;
  raw += data.length;
  brotli += Math.min(br.length, data.length);
}
const kb = (n) => `${Math.round(n / 1024)} Ko`;
console.log(`${count} fichiers compressés (.br et .gz) : ${kb(raw)} → ${kb(brotli)} en brotli.`);

const sitemap = await readFile(join(BUILD, 'sitemap.xml'), 'utf8').catch(() => '');
const listed = new Set([...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]));
const expected = new Set([`${SITE_URL}/`, ...pages.map((page) => SITE_URL + localPath(page.path, page.lang))]);
const missing = [...expected].filter((url) => !listed.has(url));
const extra = [...listed].filter((url) => !expected.has(url));
if (missing.length) console.warn(`Attention : absentes de public/sitemap.xml : ${missing.join(', ')}`);
if (extra.length) console.warn(`Attention : dans public/sitemap.xml mais sans page : ${extra.join(', ')}`);

const htaccess = await readFile(join(PROJECT, '.htaccess'), 'utf8').catch(() => '');
if (!htaccess.includes('/pages/$1.html') || !htaccess.includes('index.en.html')) {
  console.warn('Attention : le .htaccess du projet ne contient pas la règle « Pages » : le serveur ne servira pas ces');
  console.warn(`fichiers (${relative(PROJECT, join(BUILD, 'pages'))}/…), et robots et aperçus liront sur chaque page les balises de l'accueil.`);
}
