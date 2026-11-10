<p align="center">
  <a href="https://ordre-des-devs.org">
    <img src="public/banner-og-hero.jpg" alt="L'Ordre des Devs" width="100%">
  </a>
</p>

<h1 align="center">L'Ordre des Devs</h1>

<p align="center">
  Le site officiel de L'Ordre des Devs, la communauté francophone de développeurs et d'experts en cybersécurité.<br>
  <em>May the &lt;/&gt; be with you.</em>
</p>

<p align="center">
  <a href="https://ordre-des-devs.org"><img alt="Site" src="https://img.shields.io/badge/site-ordre--des--devs.org-dc5000?style=for-the-badge&labelColor=100904"></a>
  <a href="https://discord.gg/WUhvBf6vqw"><img alt="Discord" src="https://img.shields.io/badge/Discord-rejoindre-5865F2?style=for-the-badge&logo=discord&logoColor=white&labelColor=100904"></a>
  <a href="https://www.patreon.com/cw/LOrdredesDevs"><img alt="Patreon" src="https://img.shields.io/badge/Patreon-soutenir-ffedd7?style=for-the-badge&logo=patreon&logoColor=ffedd7&labelColor=100904"></a>
  <a href="https://x.com/OrdreDesDevs"><img alt="X" src="https://img.shields.io/badge/X-suivre-000000?style=for-the-badge&logo=x&logoColor=white&labelColor=100904"></a>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&labelColor=20232a">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white&labelColor=20232a">
  <img alt="three.js" src="https://img.shields.io/badge/three.js-0.180-ffffff?logo=threedotjs&logoColor=white&labelColor=20232a">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss&logoColor=white&labelColor=20232a">
</p>

<br>

## Le site

Toute la page d'accueil se joue dans une seule scène three.js ([`stage.ts`](src/webgl/stage.ts)), pilotée par le défilement ([`experience.ts`](src/home/experience.ts)). L'ordre des sections est dans [`HomePage.tsx`](src/home/HomePage.tsx).

| Section | Code |
|---|---|
| **Accueil** et **Bien poser sa question** | [`opening.tsx`](src/home/sections/opening.tsx) · [`token.ts`](src/webgl/token.ts) · [`space.ts`](src/webgl/space.ts) |
| **Sur le serveur** et **L'Ordre** | [`poles.tsx`](src/home/sections/poles.tsx) |
| **Escadrille** | [`fleet.tsx`](src/home/sections/fleet.tsx) · [`fleet.ts`](src/webgl/fleet.ts) · [`flight.ts`](src/webgl/flight.ts) |
| **Chiffrement par retournement** | [`cipher.tsx`](src/home/sections/cipher.tsx) · [`cipher-methods.ts`](src/home/sections/cipher-methods.ts) |
| **À la loupe** | [`craft.tsx`](src/home/sections/craft.tsx) |
| **Bon à savoir** | [`reading.tsx`](src/home/sections/reading.tsx) · [`flightplan.tsx`](src/home/sections/flightplan.tsx) · [`plan-time.ts`](src/home/sections/plan-time.ts) · [`plan.ts`](src/webgl/plan.ts) |
| **Challenges** | [`platform.tsx`](src/home/sections/platform.tsx) · [`walkers.ts`](src/webgl/walkers.ts) · [`gait.ts`](src/webgl/gait.ts) |
| **Noël sur le serveur** | [`fleet.tsx`](src/home/sections/fleet.tsx) |
| **Écrits par les membres** | [`reading.tsx`](src/home/sections/reading.tsx) |
| **Trouvez le bon salon** | [`salons.tsx`](src/home/sections/salons.tsx) |
| **Partenaire hébergeur** | [`partner.tsx`](src/home/sections/partner.tsx) |
| **FAQ** et fin de page | [`joining.tsx`](src/home/sections/joining.tsx) |
| En-tête, menu et barre de défilement | [`chrome.tsx`](src/home/chrome.tsx) · [`home.css`](src/home/home.css) |

Le site existe en français et en anglais (`/en`) : chaque composant garde ses textes dans les deux langues, à l'aide de [`i18n.ts`](src/i18n.ts). Les articles sont dans [`src/pages/threads`](src/pages/threads), les pages intérieures dans [`src/site`](src/site).

## Pile technique

| Outil | Rôle |
|---|---|
| [React 19](https://react.dev) et TypeScript | Interface et pages |
| [three.js](https://threejs.org) | Scène 3D, shaders écrits pour le site |
| [Tailwind CSS](https://tailwindcss.com) | Styles |
| [Lenis](https://lenis.darkroom.engineering) | Défilement lissé |
| [React Router](https://reactrouter.com) | Pages et version anglaise |
| [Create React App](https://create-react-app.dev) | Serveur de développement et build |

## Démarrer

```bash
npm install
npm start
```

Le site s'ouvre sur [http://localhost:3000](http://localhost:3000).

## Build de production

```bash
npm run build
```

Le build passe par deux scripts :

1. **Avant** : `outils/membres.mjs` relève le nombre de membres du serveur Discord et l'écrit dans `src/home/membres.ts`. Sans réseau, il garde le nombre précédent.
2. **Après** : `outils/pages-statiques.mjs` écrit une page HTML par adresse (titre, description et aperçu de lien propres à chaque page) et les copies compressées en Brotli et gzip.

## Organisation du code

```
src/
├── home/          page d'accueil : sections, défilement, styles
├── webgl/         scène three.js : sceau, espace, escadrille, plan, marcheurs
├── site/          pages intérieures (articles, mentions légales)
├── pages/threads/ articles de la communauté, en français et en anglais
├── seo/           titres, descriptions et données structurées de chaque page
├── i18n.ts        textes dans les deux langues
└── console.ts     un message caché dans la console du navigateur
outils/            scripts lancés par le build
public/            images, icônes, sitemap
.htaccess          redirections, pages par adresse, cache et sécurité
```

## La communauté

L'Ordre des Devs est un serveur Discord actif depuis 2023, créé par Mizari (développement) et Osiris (cybersécurité). On y pose ses questions, on relit du code et on partage ce qu'on apprend, majoritairement en français.

<p align="center">
  <a href="https://discord.gg/WUhvBf6vqw"><strong>Rejoindre le Discord</strong></a>
  &nbsp;·&nbsp;
  <a href="https://ordre-des-devs.org"><strong>ordre-des-devs.org</strong></a>
  &nbsp;·&nbsp;
  <a href="https://github.com/L-Ordre-Des-Devs"><strong>GitHub</strong></a>
</p>
