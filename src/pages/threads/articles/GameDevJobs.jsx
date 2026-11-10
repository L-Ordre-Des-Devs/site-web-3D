import React from "react";
import { Briefcase, Bug, Code, FileText, Mic, Music, Palette, TriangleAlert } from "lucide-react";

const GameDevJobs = ({ darkMode }) => {
  const jobs = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Le Développeur",
      description: "Bon facile, c'est celui qui code",
      details:
        "Suivant la taille du studio, il peut y avoir des développeurs différents. Par exemple, le game developer (celui qui code les mécaniques de gameplay) ne sera pas la même personne que le online developer (celui qui s'occupe de la partie online, faire en sorte que les informations arrivent correctement d'un bout à l'autre du réseau).",
      color: "blue",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Le Game Designer",
      description: "Non ce n'est pas un dessinateur !",
      details:
        "Le game designer c'est celui qui s'occupe de l'équilibrage du jeu. C'est aussi lui qui dit aux dev où faut-il ajouter du game feel (éléments qui rendent le jeu plus agréable à jouer) et où il faut ajouter des feedbacks (éléments qui montrent au joueur que ses actions ont un impact sur le jeu). En gros son rôle c'est de rendre le jeu fun.",
      color: "purple",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "Le Level Designer",
      description: "Architecte des niveaux de jeu",
      details:
        "C'est celui qui s'occupe d'agencer le niveau, il faut qu'il soit cohérent, tout en étant un bon terrain de jeu dans lequel il est agréable d'évoluer. En général le Game Designer et le Level Designer sont la même personne, mais ça arrive (surtout dans les gros studios) que ce soit 2 personnes différentes.",
      color: "green",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Le Dessinateur",
      description: "Créateur des visuels 2D",
      details:
        "Dans un jeu en 2D c'est celui qui va faire les assets, dans un jeu en 3D c'est souvent lui qui fait les chara-designs pour aider les modélisateurs 3D. Si c'est un jeu avec scénario il fera également le storyboard.",
      color: "pink",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "L'UI Designer / Graphiste",
      description: "Créateur des interfaces",
      details:
        "C'est celui qui va s'occuper de dessiner les interfaces graphiques (genre les menus et autres HUD). Il y en a besoin même dans les jeux 3D, forcément, donc si vous choisissez de faire de la 2D, vous arriverez à avoir du taf dans tous les types de jeux",
      color: "cyan",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Le Modélisateur 3D",
      description: "Sculpteur numérique",
      details:
        "Eh beh comme son nom l'indique, c'est celui qui modélise xD Il crée les personnages, objets et environnements en 3D qui donneront vie au jeu.",
      color: "orange",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "Le Rigger",
      description: "Créateur de squelettes 3D",
      details:
        "C'est celui qui va créer le squelette du model 3D (le rig). C'est grâce à ça qu'on va pouvoir animer le model 3D. C'est important de faire un model 3D propre pour pouvoir le rigger correctement, et c'est important de faire un rig propre pour pouvoir l'animer correctement.",
      color: "yellow",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "L'Animateur",
      description: "Donneur de vie",
      details:
        "En 2D ce sera le dessinateur qui fera lui-même l'animation de ses assets (en général). En 3D, si c'est le modélisateur qui a fait son propre rig alors il fera sûrement aussi son animation, sinon il y aura une personne différente à chaque étape.",
      color: "red",
    },
    {
      icon: <Music className="h-6 w-6" />,
      title: "Le Sound Designer",
      description: "Créateur d'ambiances sonores",
      details:
        "C'est celui qui va s'occuper de faire tous les petits bruitages du jeu, par exemple les bruits de pas, les portes qui claquent, etc...",
      color: "indigo",
    },
    {
      icon: <Music className="h-6 w-6" />,
      title: "Le Compositeur",
      description: "Créateur de musiques",
      details:
        "C'est celui qui s'occupe de créer les musiques du jeu, par exemple pour le menu ou pour les différentes zones.",
      color: "violet",
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "Le Voice Actor",
      description: "Doubleur de personnages",
      details:
        "Ouais au final on a un peu les mêmes métiers que dans le cinéma xD Bon du coup le voice actor c'est celui qui pose sa voix pour un personnage du jeu (s'il y a des personnages qui parlent).",
      color: "teal",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "Le Scénariste",
      description: "Écrivain d'histoires",
      details:
        "C'est celui qui écrit le scénario, qui dit quand les dialogues entre tel et tel personnages interviennent et quand les cinématiques se lancent.",
      color: "emerald",
    },
    {
      icon: <Bug className="h-6 w-6" />,
      title: "Le Bêta Testeur",
      description: "Chasseur de bugs professionnel",
      details:
        "Bon en général on se fait pas chier à payer des gens pour ça xD mais ça arrive qu'il y ait des professionnels qui soient engagés pour ça. Non ça ne consiste pas juste à jouer au jeu et donner son avis. Il faut TESTER le jeu : appuyer sur tous les boutons, essayer d'aller dans les endroits et faire des trucs qui ne sont normalement pas prévus, en gros il part à la chasse aux bugs. Et quand il repère un bug il fait un rapport détaillé sur comment le bug est apparu, comment le reproduire et comment il pourrait être patché.",
      color: "lime",
    },
  ];

  const colorClasses = {
    blue: {
      bg: "bg-surface",
      text: "text-accent",
      border: "border-line",
    },
    purple: {
      bg: "bg-surface",
      text: "text-accent",
      border: "border-line",
    },
    green: {
      bg: "bg-surface",
      text: "text-positive",
      border: "border-line",
    },
    pink: {
      bg: "bg-surface",
      text: "text-accent",
      border: "border-line",
    },
    cyan: {
      bg: "bg-surface",
      text: "text-accent",
      border: "border-line",
    },
    orange: {
      bg: "bg-surface",
      text: "text-warning",
      border: "border-line",
    },
    yellow: {
      bg: "bg-surface",
      text: "text-warning",
      border: "border-line",
    },
    red: {
      bg: "bg-surface",
      text: "text-warning",
      border: "border-line",
    },
    indigo: {
      bg: "bg-surface",
      text: "text-accent",
      border: "border-line",
    },
    violet: {
      bg: "bg-surface",
      text: "text-accent",
      border: "border-line",
    },
    teal: {
      bg: "bg-surface",
      text: "text-positive",
      border: "border-line",
    },
    emerald: {
      bg: "bg-surface",
      text: "text-positive",
      border: "border-line",
    },
    lime: {
      bg: "bg-surface",
      text: "text-positive",
      border: "border-line",
    },
  };

  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        Dans ce thread je vais lister les métiers du jeu vidéo et expliquer en
        gros à quoi ils correspondent. Il y a énormément de métiers différents
        donc c'est possible que j'en oublie !
      </p>

      <div
        className={`mb-8 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Important à savoir
        </p>
        <p className={`text-muted`}>
          Dans les petits studios, c'est très rare qu'une personne n'ait qu'un
          seul rôle. En général chaque employé aura 2 ou 3 casquettes (si ce
          n'est plus). Par exemple, très souvent le développeur s'occupera
          également du game design et du level design. C'est pour cette raison
          qu'il y a certains métiers qu'on confond facilement.
        </p>
      </div>

      <div className="space-y-6">
        {jobs.map((job, index) => {
          const colors = colorClasses[job.color];
          return (
            <div
              key={index}
              className={`p-5 rounded border bg-surface border-line transition-colors`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded ${colors.bg} ${colors.text} flex-shrink-0`}
                >
                  {job.icon}
                </div>
                <div className="flex-1">
                  <h3
                    className={`text-xl font-bold mb-2 text-ink`}
                  >
                    {job.title}
                  </h3>
                  <p className={`text-sm italic mb-3 ${colors.text}`}>
                    {job.description}
                  </p>
                  <p
                    className={`text-muted`}
                  >
                    {job.details}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`mt-12 p-6 rounded border-line`}
      >
        <h3
          className={`text-xl font-bold mb-3 text-ink`}
        >
          Trouver sa voie
        </h3>
        <p className={`mb-4 text-subtle`}>
          Chaque métier a son importance dans la création d'un jeu vidéo. Le
          mieux est d'essayer plusieurs domaines pour découvrir ce qui vous
          passionne vraiment !
        </p>
        <div className={`grid md:grid-cols-3 gap-4 mt-4`}>
          <div
            className={`p-4 rounded bg-surface`}
          >
            <h4
              className={`font-bold mb-2 text-accent`}
            >
              Profil Technique
            </h4>
            <p
              className={`text-sm text-subtle`}
            >
              Développeur, Rigger, Online Developer
            </p>
          </div>
          <div
            className={`p-4 rounded bg-surface`}
          >
            <h4
              className={`font-bold mb-2 text-accent`}
            >
              Profil Créatif
            </h4>
            <p
              className={`text-sm text-subtle`}
            >
              Dessinateur, Modélisateur 3D, Animateur, Sound Designer
            </p>
          </div>
          <div
            className={`p-4 rounded bg-surface`}
          >
            <h4
              className={`font-bold mb-2 text-positive`}
            >
              Profil Conception
            </h4>
            <p
              className={`text-sm text-subtle`}
            >
              Game Designer, Level Designer, Scénariste
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDevJobs;
