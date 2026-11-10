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
  <a href="https://patreon.com/ordre_des_devs"><img alt="Patreon" src="https://img.shields.io/badge/Patreon-soutenir-ffedd7?style=for-the-badge&logo=patreon&logoColor=ffedd7&labelColor=100904"></a>
</p>

<p align="center">
  <img alt="React 19" src="https://img.shields.io/badge/React-19-61dafb?logo=react&logoColor=white&labelColor=20232a">
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-6-3178c6?logo=typescript&logoColor=white&labelColor=20232a">
  <img alt="three.js" src="https://img.shields.io/badge/three.js-0.180-ffffff?logo=threedotjs&logoColor=white&labelColor=20232a">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?logo=tailwindcss&logoColor=white&labelColor=20232a">
</p>

<br>

## Le site

Toute la page d'accueil se joue dans une seule scène three.js, qui suit le défilement d'une section à l'autre.

| Section | Ce qu'on y voit |
|---|---|
| **Accueil** | Le sceau de l'Ordre en or, modélisé en 3D, devant une planète désertique et ses deux soleils. |
| **Escadrille** | Des chasseurs qui sortent d'hyperespace et volent seuls : chaque pilote est simulé, de l'inclinaison au temps de réaction des ailiers. |
| **Bon à savoir** | Une sortie de deux chasseurs tracée en 3D au fil du défilement, avec les vrais chiffres du vol. |
| **Challenges** | Des marcheurs qui avancent dans la brume : la marche est calculée pied par pied, et le sol tremble à chaque pas. |
| **Archives** | Les articles de la communauté, présentés en couvertures de magazine. |

Le site existe en français et en anglais (`/en`). Sans WebGL, il reste entièrement lisible : les scènes laissent place à des fonds unis, et le vol de « Bon à savoir » à un plan dessiné en SVG.

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

Pour la mise en ligne, téléversez tout le contenu de `build/` et le fichier `.htaccess` de la racine.

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
