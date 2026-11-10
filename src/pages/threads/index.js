export const articles = [
  {
    id: 1,
    title: "Vulnérabilités et sécurité des blockchains",
    excerpt:
      "Les blockchains sont-elles vraiment inviolables ? Découvrez les principales vulnérabilités qui menacent cette technologie de décentralisation.",
    author: "Osiris",
    date: "2023-08-21",
    category: ["Cyber", "Blockchain"],
    readTime: "12 min",
    slug: "vulnerabilities-blockchains",
    en: {
      title: "Blockchain vulnerabilities and security",
      excerpt:
        "Are blockchains really tamper-proof? A look at the main vulnerabilities that threaten this decentralized technology.",
    },
  },
  {
    id: 2,
    title: "Logiciels pour développer des jeux",
    excerpt:
      "Découvrez les meilleurs moteurs de jeu pour créer vos propres jeux vidéo, du débutant à l'expert.",
    author: "Mizari",
    date: "2023-09-15",
    category: "GameDev",
    readTime: "8 min",
    slug: "logiciels-developpement-jeux",
    en: {
      title: "Software for making games",
      excerpt: "The best game engines for making your own video games, from beginner to expert.",
    },
  },
  {
    id: 3,
    title: "Créer une IA avec Unity ML-Agents",
    excerpt:
      "Guide complet pour installer et utiliser Unity ML-Agents afin de créer des intelligences artificielles dans vos jeux Unity.",
    author: "Mizari",
    date: "2023-07-30",
    category: "GameDev",
    readTime: "15 min",
    slug: "unity-ml-agents",
    en: {
      title: "Building an AI with Unity ML-Agents",
      excerpt: "A complete guide to installing and using Unity ML-Agents to build artificial intelligence into your Unity games.",
    },
  },
  {
    id: 4,
    title: "Faire son premier jeu vidéo : Guide complet",
    excerpt:
      "De la conception à la réalisation, tous les conseils pour créer votre premier jeu vidéo sans vous perdre en route.",
    author: "Mizari",
    date: "2023-08-30",
    category: ["GameDev"],
    readTime: "10 min",
    slug: "premier-jeu-video-guide",
    en: {
      title: "Making your first video game: a complete guide",
      excerpt: "From design to release, advice for making your first video game without getting lost along the way.",
    },
  },
  {
    id: 5,
    title: "Les métiers du jeu vidéo",
    excerpt:
      "Découvrez tous les métiers qui composent l'industrie du jeu vidéo : du développeur au testeur, en passant par l'artiste et le game designer.",
    author: "Mizari",
    date: "2023-09-01",
    category: ["GameDev"],
    readTime: "12 min",
    slug: "metiers-jeu-video",
    en: {
      title: "Jobs in the video game industry",
      excerpt:
        "The jobs that make up the video game industry, from developer to tester, by way of artist and game designer.",
    },
  },
  {
    id: 6,
    title: "Hello World : Collection de langages",
    excerpt:
      "Comment afficher 'Hello World' dans plus de 20 langages de programmation différents. Thread collaboratif de la communauté !",
    author: "Mizari",
    date: "2023-11-23",
    category: ["Programmation"],
    readTime: "5 min",
    slug: "hello-world-collection",
    en: {
      title: "Hello World: a collection of languages",
      excerpt: "How to print 'Hello World' in more than 20 programming languages. A collaborative community thread!",
    },
  },
];

const LOADERS = {
  fr: {
    "vulnerabilities-blockchains": () => import("./articles/VulnerabilitiesBlockchains"),
    "logiciels-developpement-jeux": () => import("./articles/GameDevEngines"),
    "unity-ml-agents": () => import("./articles/UnityMLAgents"),
    "premier-jeu-video-guide": () => import("./articles/FirstGameGuide"),
    "metiers-jeu-video": () => import("./articles/GameDevJobs"),
    "hello-world-collection": () => import("./articles/HelloWorld"),
  },
  en: {
    "vulnerabilities-blockchains": () => import("./articles/en/VulnerabilitiesBlockchains"),
    "logiciels-developpement-jeux": () => import("./articles/en/GameDevEngines"),
    "unity-ml-agents": () => import("./articles/en/UnityMLAgents"),
    "premier-jeu-video-guide": () => import("./articles/en/FirstGameGuide"),
    "metiers-jeu-video": () => import("./articles/en/GameDevJobs"),
    "hello-world-collection": () => import("./articles/en/HelloWorld"),
  },
};

export const loadArticle = (slug, lang = "fr") => (LOADERS[lang] || LOADERS.fr)[slug];

export const getArticle = (slug) => articles.find((article) => article.slug === slug);

export default articles;
