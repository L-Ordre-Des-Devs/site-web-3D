import React from "react";
import { CheckCircle, Code, FileText, Gamepad2, Lightbulb, Sparkles, TriangleAlert, Users } from "lucide-react";

const FirstGameGuide = ({ darkMode }) => {
  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        Je vais parler de mon expérience perso, de ce que j'ai appris dans mon
        école et de toutes les docs (vidéos principalement) que j'ai pu voir sur
        le sujet. Évidemment{" "}
        <strong className={"text-ink"}>
          PERSONNE ne débute de la même manière
        </strong>
        , chacun appréhende le sujet à sa façon.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> N'hésitez pas à partager votre propre expérience dans les
          commentaires !
        </p>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Gamepad2 className="h-6 w-6" />
        1. Choix du logiciel
      </h2>
      <p className={`mb-4 text-subtle`}>
        Déjà, la première question à se poser quand on veut faire un jeu c'est :{" "}
        <strong className={"text-ink"}>
          "quel logiciel vais-je utiliser ?"
        </strong>
      </p>
      <p className={`mb-4 text-subtle`}>
        Il n'y a pas vraiment de "meilleur" logiciel. C'est à vous de découvrir
        celui que vous préférez, soit en regardant des vidéos, soit en les
        installant et en les testant.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          Quelques recommandations selon le type de jeu :
        </h3>
        <ul
          className={`space-y-2 text-subtle`}
        >
          <li className="flex items-start gap-2">
            <CheckCircle
              className={`h-5 w-5 mt-0.5 flex-shrink-0 text-positive`}
            />
            <span>
              <strong className={"text-ink"}>
                Pour la VR :
              </strong>{" "}
              Unity
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle
              className={`h-5 w-5 mt-0.5 flex-shrink-0 text-positive`}
            />
            <span>
              <strong className={"text-ink"}>
                Pour un jeu en pixel art :
              </strong>{" "}
              GameMaker Studio 2
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle
              className={`h-5 w-5 mt-0.5 flex-shrink-0 text-positive`}
            />
            <span>
              <strong className={"text-ink"}>
                Pour un petit jeu 2D ou 3D :
              </strong>{" "}
              Godot
            </span>
          </li>
        </ul>
      </div>

      <p className={`mb-4 text-subtle`}>
        Pour découvrir plus de logiciels, consultez notre liste complète des
        moteurs de jeu disponibles.
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        2. Le Scope (portée du projet)
      </h2>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Attention : Faire un jeu vidéo, c'est ÉNORMÉMENT de travail !
        </p>
        <p className={`text-muted`}>
          Pour votre premier jeu, ne partez pas sur un jeu trop compliqué (genre
          un RPG ou un giga open world avec plein de quêtes...).
        </p>
      </div>

      <p className={`mb-4 text-subtle`}>
        Il faut commencer avec des{" "}
        <strong className={"text-ink"}>
          petits scopes
        </strong>
        , genre :
      </p>
      <ul
        className={`list-disc list-inside mb-6 space-y-2 text-subtle`}
      >
        <li>Un Flappy Bird</li>
        <li>Un Pong</li>
        <li>Un simple jeu de plateforme</li>
      </ul>
      <p className={`mb-4 text-subtle`}>
        Juste pour se familiariser avec le logiciel et prendre de l'expérience.
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Users className="h-6 w-6" />
        3. Comprendre les différents rôles
      </h2>
      <p className={`mb-4 text-subtle`}>
        Comprenez bien que{" "}
        <strong className={"text-ink"}>
          chaque partie d'un jeu est un métier en soi
        </strong>
        . C'est pas pour faire joli que dans les studios il y a des équipes
        entières qui développent le jeu.
      </p>
      <p className={`mb-4 text-subtle`}>
        Certes, certaines personnes vont avoir plusieurs rôles (souvent dans les
        petits studios, le dev fait aussi office de game designer), mais la
        programmation et le game design sont deux choses différentes.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          Principaux métiers du jeu vidéo :
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            {
              role: "Game Designer",
              desc: "Conception du gameplay et des mécaniques",
            },
            { role: "Programmeur", desc: "Développement et code du jeu" },
            { role: "Artiste 2D/3D", desc: "Création des visuels et assets" },
            {
              role: "Level Designer",
              desc: "Création et conception des niveaux",
            },
            {
              role: "Sound Designer",
              desc: "Création des musiques et effets sonores",
            },
            {
              role: "Narrative Designer",
              desc: "Écriture du scénario et des dialogues",
            },
          ].map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded bg-surface`}
            >
              <div
                className={`font-semibold text-accent`}
              >
                {item.role}
              </div>
              <div
                className={`text-sm text-subtle`}
              >
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className={`mb-4 text-subtle`}>
        Je vous conseille de vous renseigner sur les métiers du jeu vidéo pour
        que vous compreniez mieux à quel point un jeu vidéo est complexe et que
        vous repériez{" "}
        <strong className={"text-ink"}>
          quelle partie du jeu vous intéresse le plus
        </strong>
        .
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <FileText className="h-6 w-6" />
        4. Le Game Design Document (GDD)
      </h2>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Ne commencez SURTOUT PAS le développement tout de suite !
        </p>
      </div>

      <p className={`mb-4 text-subtle`}>
        Avant de vous lancer dans l'aventure, commencez par rédiger un document
        qui explique et détaille votre idée du jeu. On appelle cela un{" "}
        <strong className={"text-ink"}>
          "Game Design Document" (GDD)
        </strong>
        .
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          Contenu du GDD :
        </h3>
        <ul
          className={`space-y-2 text-subtle`}
        >
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Type de jeu (plateforme, FPS, RPG, puzzle...)</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Style de gameplay et graphique souhaité</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Références (jeux similaires, inspirations)</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Mécaniques de jeu principales</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Histoire et univers (si applicable)</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Direction artistique et ambiance</span>
          </li>
        </ul>
      </div>

      <p className={`mb-4 text-subtle`}>
        Cela vous permettra de ne pas trop dévier de l'idée de base pendant le
        développement. Évidemment vous pouvez modifier le document pour
        l'améliorer, mais{" "}
        <strong className={"text-ink"}>
          référez-vous toujours au doc pendant le dev
        </strong>{" "}
        - ça évitera de perdre du temps et les désaccords dans l'équipe.
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Code className="h-6 w-6" />
        5. Le développement
      </h2>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Organisation de l'équipe
      </h3>
      <p className={`mb-4 text-subtle`}>
        Maintenant que tout le monde sait ce que vous voulez faire, il est enfin
        temps de développer !
      </p>
      <p className={`mb-4 text-subtle`}>
        Utilisez des outils collaboratifs pour vous répartir les tâches :
      </p>
      <ul
        className={`list-disc list-inside mb-6 space-y-2 text-subtle`}
      >
        <li>
          <strong className={"text-ink"}>
            Trello
          </strong>{" "}
          : simple et visuel
        </li>
        <li>
          <strong className={"text-ink"}>
            Notion
          </strong>{" "}
          : complet (vous pouvez aussi y mettre votre GDD)
        </li>
        <li>
          <strong className={"text-ink"}>
            Jira
          </strong>{" "}
          : pour les projets plus complexes
        </li>
      </ul>
      <p className={`mb-4 text-subtle`}>
        Pensez à faire des{" "}
        <strong className={"text-ink"}>
          réunions régulièrement
        </strong>{" "}
        pour voir comment avance le développement et rester en accord avec votre
        équipe.
      </p>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Développement solo ou pas de graphiste ?
      </h3>
      <p className={`mb-4 text-subtle`}>
        Si votre truc c'est la programmation, vous pouvez faire le choix de vous
        lancer dans l'aventure tout seul en utilisant des{" "}
        <strong className={"text-ink"}>
          packs d'assets
        </strong>{" "}
        (gratuits ou payants).
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h4
          className={`text-lg font-bold mb-3 text-ink`}
        >
          Sites d'assets gratuits :
        </h4>
        <ul
          className={`space-y-2 text-subtle`}
        >
          <li>• itch.io (nombreux assets gratuits)</li>
          <li>• OpenGameArt.org</li>
          <li>• Kenney.nl (assets 2D et 3D)</li>
          <li>• Unity Asset Store (section gratuite)</li>
        </ul>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Pas fan de programmation ?
      </h3>
      <p className={`mb-4 text-subtle`}>
        Vous pouvez soit embaucher un dev, soit utiliser un langage en{" "}
        <strong className={"text-ink"}>
          "blocs"
        </strong>{" "}
        (aussi appelé "no code" ou "blueprint").
      </p>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> <strong>Important :</strong> Même si vous ne tapez pas des lignes
          de code, c'est quand même de la{" "}
          <strong className={"text-ink"}>
            logique de programmation
          </strong>
          . Un jeu vidéo c'est littéralement un logiciel exécuté par votre
          ordinateur, il ne peut pas fonctionner sans programmation. Quoi qu'il
          arrive, vous allez forcément devoir vous y coller !
        </p>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Ordre de priorité des tâches
      </h3>
      <p className={`mb-4 text-subtle`}>
        Classez vos tâches par ordre de priorité et tenez-vous à cet ordre :
      </p>
      <ol
        className={`list-decimal list-inside mb-6 space-y-2 text-subtle`}
      >
        <li>
          <strong className={"text-ink"}>
            Mécaniques de jeu
          </strong>{" "}
          (ce qui a de l'importance dans le gameplay)
        </li>
        <li>
          <strong className={"text-ink"}>
            Feedbacks
          </strong>{" "}
          (montrer au joueur que ses actions ont un effet)
        </li>
        <li>
          <strong className={"text-ink"}>
            Game Feel
          </strong>{" "}
          (ce qui est plus esthétique)
        </li>
      </ol>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h4
          className={`text-lg font-bold mb-3 flex items-center gap-2 text-ink`}
        >
          <Sparkles className="h-5 w-5" />
          Définitions importantes
        </h4>

        <div className="space-y-4">
          <div>
            <h5
              className={`font-bold mb-1 text-accent`}
            >
              Game Feel
            </h5>
            <p
              className={`text-sm text-subtle`}
            >
              Petites animations, effets de lumières et autres effets qui
              rendent le jeu plus agréable à jouer. Le "juicy" par exemple est
              un élément de game feel.
            </p>
          </div>

          <div>
            <h5
              className={`font-bold mb-1 text-accent`}
            >
              Feedback
            </h5>
            <p
              className={`text-sm text-subtle`}
            >
              Animations et effets qui se déclenchent quand le joueur fait une
              action. C'est pour montrer au joueur que son action a fonctionné
              (ou non), qu'il a eu un impact sur quelque chose.
            </p>
            <p
              className={`text-sm mt-2 italic text-subtle`}
            >
              Exemple : Une branche qui tombe de l'arbre quand on tape dessus
              pour montrer qu'on a récupéré du bois.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Le Game Feel est très important pour rendre le jeu agréable et
          satisfaisant à jouer, mais{" "}
          <strong className={"text-ink"}>
            si votre jeu n'est même pas jouable, ça ne sert à rien d'ajouter du
            game feel
          </strong>
          .
        </p>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        6. Créer son studio
      </h2>
      <p className={`mb-4 text-subtle`}>
        Si vous voulez aller plus loin et créer votre propre studio de jeux
        vidéo, renseignez-vous sur :
      </p>
      <ul
        className={`list-disc list-inside mb-6 space-y-2 text-subtle`}
      >
        <li>Les aspects juridiques (création d'entreprise, statuts)</li>
        <li>Le financement (fonds propres, investisseurs, crowdfunding)</li>
        <li>Le marketing et la communication</li>
        <li>
          La publication sur les différentes plateformes (Steam, Epic,
          consoles...)
        </li>
        <li>La gestion d'équipe et le management</li>
      </ul>

      <div
        className={`mt-8 p-6 rounded border-line`}
      >
        <h3
          className={`text-xl font-bold mb-3 text-ink`}
        >
          Conseil final
        </h3>
        <p className={`text-muted`}>
          Le plus important :{" "}
          <strong className={"text-ink"}>
            commencez petit, finissez vos projets, et apprenez de chaque
            expérience
          </strong>
          . Mieux vaut 10 petits jeux terminés qu'un énorme projet abandonné !
        </p>
      </div>
    </div>
  );
};

export default FirstGameGuide;
