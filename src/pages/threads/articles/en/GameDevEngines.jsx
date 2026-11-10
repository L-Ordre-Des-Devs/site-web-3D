import React from "react";
import { ExternalLink, Lightbulb } from "lucide-react";

const GameDevEngines = ({ darkMode }) => {
  const engines = [
    {
      name: "Unity",
      description:
        "One of my favorites, and one of the two biggest heavyweights on the market. You mostly develop with it in C#.",
      features: [
        "Free (becomes paid once your game earns a certain yearly revenue)",
        "For every kind of game",
        "Very large community and lots of resources",
        "Rich Asset Store",
      ],
      url: "https://unity.com/download",
    },
    {
      name: "Unreal Engine",
      description:
        "The engine with the best visual rendering (and the most optimized). It's the other heavyweight on the market alongside Unity, famous in particular thanks to Fortnite.",
      features: [
        "You mostly develop with it in C++",
        "Free (becomes paid once your game earns a certain yearly revenue)",
        "For every kind of game",
        "High-quality visual rendering",
      ],
      url: "https://www.unrealengine.com/download",
    },
    {
      name: "Godot",
      description:
        "This engine is getting a lot of attention right now. Completely free, it uses its own language (GDScript) and aims to be very intuitive and easy to learn.",
      features: [
        "100% free and open source",
        "GDScript (its own language, similar to Python)",
        "Very intuitive and easy to learn",
        "A very good alternative to Unity",
        "For every kind of game",
      ],
      url: "https://godotengine.org/download",
    },
    {
      name: "GameMaker Studio",
      description:
        "One of my favorites! Big, well-known games like Hotline Miami were made with it. The interface is really pleasant and very intuitive, perfect for learning.",
      features: [
        "Mostly geared toward 2D pixel art",
        "GameMaker Language (GML)",
        "Free version for browser export",
        "Paid licenses for other platforms",
        "Very intuitive interface",
      ],
      url: "https://gamemaker.io/en/download",
    },
    {
      name: "Construct",
      description:
        "The first software I used to code my first games. It has a free version that lets you make nice little games. Perfect for getting started and learning.",
      features: [
        "No code, with a system of events and behaviors",
        "Runs directly online",
        "Very much geared toward 2D games",
        "Free version available",
        "Ideal for learning",
      ],
      url: "https://www.construct.net/en",
    },
    {
      name: "GDevelop",
      description:
        "Free, no-code software that runs directly online. It aims to be a good learning tool, perfect for small games.",
      features: [
        "Completely free",
        "No code",
        "Runs online",
        "For every kind of game",
        "Open source",
      ],
      url: "https://gdevelop.io/",
    },
    {
      name: "PlayCanvas",
      description:
        "Software that runs entirely in the browser. It's built for making WebGL games, but you can also make downloadable games.",
      features: [
        "JavaScript",
        "100% in the browser",
        "Free, with an optional subscription",
        "Mobile, PC, AR and VR support",
        "Focused on WebGL",
      ],
      url: "https://playcanvas.com/",
    },
  ];

  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        Here I present different tools to help you code your own games. I
        haven't necessarily used them all, but these are the ones I know or
        have heard about.
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
                    Features:
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
                  Download
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
          How to choose?
        </h3>
        <ul
          className={`space-y-2 text-subtle`}
        >
          <li>
            <strong className={"text-ink"}>
              To get started:
            </strong>{" "}
            Construct, GDevelop or GameMaker Studio
          </li>
          <li>
            <strong className={"text-ink"}>
              For 2D games:
            </strong>{" "}
            GameMaker Studio, Construct or Godot
          </li>
          <li>
            <strong className={"text-ink"}>
              For 3D games:
            </strong>{" "}
            Unity, Unreal Engine or Godot
          </li>
          <li>
            <strong className={"text-ink"}>
              For WebGL/the browser:
            </strong>{" "}
            PlayCanvas or Construct
          </li>
          <li>
            <strong className={"text-ink"}>
              On a tight budget:
            </strong>{" "}
            Godot (free) or GDevelop (free)
          </li>
          <li>
            <strong className={"text-ink"}>
              High-end graphics:
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
          <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> <strong>Tip:</strong> The best engine is the one
          you feel most comfortable with. Don't hesitate to try several before
          making your choice!
        </p>
      </div>
    </div>
  );
};

export default GameDevEngines;
