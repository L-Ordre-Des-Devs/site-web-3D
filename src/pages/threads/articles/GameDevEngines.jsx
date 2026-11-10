import React from "react";
import { ExternalLink, Lightbulb } from "lucide-react";

const GameDevEngines = ({ darkMode }) => {
  const engines = [
    {
      name: "Unity",
      description:
        "Un de mes préférés, c'est l'un des 2 plus gros monstres du marché. Pour développer dessus on utilise principalement le langage C#.",
      features: [
        "Gratuit (devient payant quand votre jeu vous rapporte un certain revenu à l'année)",
        "Pour tout type de jeux",
        "Très grande communauté et ressources",
        "Asset Store riche",
      ],
      url: "https://unity.com/fr/download",
    },
    {
      name: "Unreal Engine",
      description:
        "Le moteur graphique qui a le meilleur rendu visuel (et le plus optimisé). C'est l'autre plus gros monstre du marché avec Unity, très connu notamment grâce à Fortnite.",
      features: [
        "Pour développer dessus on utilise principalement le C++",
        "Gratuit (devient payant quand votre jeu vous rapporte un certain revenu à l'année)",
        "Pour tout type de jeux",
        "Rendu visuel de haute qualité",
      ],
      url: "https://www.unrealengine.com/fr/download",
    },
    {
      name: "Godot",
      description:
        "Le logiciel fait beaucoup parler de lui en ce moment. Complètement gratuit, il utilise son propre langage (le GDScript) et se veut très intuitif et facile à apprendre.",
      features: [
        "100% gratuit et open source",
        "GDScript (langage propre similaire à Python)",
        "Très intuitif et facile à apprendre",
        "Une très bonne alternative à Unity",
        "Pour tout type de jeux",
      ],
      url: "https://godotengine.org/download",
    },
    {
      name: "GameMaker Studio",
      description:
        "Un de mes préférés ! Il est à l'origine de gros jeux très connus comme Hotline Miami. L'interface est super agréable, très intuitive, parfaite pour apprendre.",
      features: [
        "Surtout orienté 2D pixel art",
        "GameMaker Language (GML)",
        "Version gratuite pour export navigateur",
        "Licences payantes pour autres plateformes",
        "Interface très intuitive",
      ],
      url: "https://gamemaker.io/fr/download",
    },
    {
      name: "Construct",
      description:
        "Le premier logiciel avec lequel j'ai codé mes premiers jeux. Il a une version gratuite qui permet de faire des petits jeux sympas. Parfait pour débuter et apprendre.",
      features: [
        "No code avec système d'events et behaviours",
        "Utilisable directement online",
        "Très orienté jeux 2D",
        "Version gratuite disponible",
        "Idéal pour l'apprentissage",
      ],
      url: "https://www.construct.net/fr",
    },
    {
      name: "GDevelop",
      description:
        "Logiciel gratuit, no code, utilisable directement online. Se veut être un bon outil pour l'apprentissage, parfait pour des petits jeux.",
      features: [
        "Complètement gratuit",
        "No code",
        "Utilisable online",
        "Pour tout type de jeux",
        "Open source",
      ],
      url: "https://gdevelop.io/fr-fr",
    },
    {
      name: "PlayCanvas",
      description:
        "Logiciel disponible entièrement en navigateur. L'objectif est de créer des jeux WebGL, mais vous pouvez également créer des jeux téléchargeables.",
      features: [
        "JavaScript",
        "100% en navigateur",
        "Gratuit avec abonnement optionnel",
        "Support mobile, PC, AR, VR",
        "Focus sur WebGL",
      ],
      url: "https://playcanvas.com/",
    },
  ];

  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        Ici je vous présente différents logiciels pour vous aider à coder vos
        propres jeux. Je ne les ai pas forcément tous utilisés mais je vous
        présente ceux que je connais ou dont j'ai entendu parler.
      </p>

      <div className="space-y-8 mt-8">
        {engines.map((engine, index) => (
          <div
            key={index}
            className={`p-6 rounded border bg-surface border-line backdrop-blur-sm transition-colors`}
          >
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <h3
                  className={`text-2xl font-bold mb-3 text-ink`}
                >
                  {engine.name}
                </h3>
                <p
                  className={`mb-4 text-subtle`}
                >
                  {engine.description}
                </p>

                <div className="mb-4">
                  <h4
                    className={`text-sm font-semibold mb-2 uppercase tracking-wide text-subtle`}
                  >
                    Caractéristiques :
                  </h4>
                  <ul
                    className={`space-y-2 text-subtle`}
                  >
                    {engine.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span
                          className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
                        ></span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={engine.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded font-medium transition-all bg-surface text-accent hover:bg-blue-500/30`}
                >
                  Télécharger
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        className={`mt-12 p-6 rounded bg-surface border-line`}
      >
        <h3
          className={`text-xl font-bold mb-3 text-ink`}
        >
          Comment choisir ?
        </h3>
        <ul
          className={`space-y-2 text-subtle`}
        >
          <li>
            <strong className={"text-ink"}>
              Pour débuter :
            </strong>{" "}
            Construct, GDevelop ou GameMaker Studio
          </li>
          <li>
            <strong className={"text-ink"}>
              Pour des jeux 2D :
            </strong>{" "}
            GameMaker Studio, Construct ou Godot
          </li>
          <li>
            <strong className={"text-ink"}>
              Pour des jeux 3D :
            </strong>{" "}
            Unity, Unreal Engine ou Godot
          </li>
          <li>
            <strong className={"text-ink"}>
              Pour du WebGL/navigateur :
            </strong>{" "}
            PlayCanvas ou Construct
          </li>
          <li>
            <strong className={"text-ink"}>
              Budget limité :
            </strong>{" "}
            Godot (gratuit) ou GDevelop (gratuit)
          </li>
          <li>
            <strong className={"text-ink"}>
              Graphismes haute qualité :
            </strong>{" "}
            Unreal Engine
          </li>
        </ul>
      </div>

      <div
        className={`mt-8 p-4 rounded bg-surface`}
      >
        <p
          className={`text-sm text-subtle`}
        >
          <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> <strong>Conseil :</strong> Le meilleur moteur est celui avec lequel
          vous vous sentez le plus à l'aise. N'hésitez pas à en tester plusieurs
          avant de faire votre choix !
        </p>
      </div>
    </div>
  );
};

export default GameDevEngines;
