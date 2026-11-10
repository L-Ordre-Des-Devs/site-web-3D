import React from "react";
import { CheckCircle, Code, FileText, Gamepad2, Lightbulb, Sparkles, TriangleAlert, Users } from "lucide-react";

const FirstGameGuide = ({ darkMode }) => {
  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        I'm going to talk about my own experience, what I learned at my school
        and all the material (mostly videos) I've watched on the subject.
        Obviously,{" "}
        <strong className={"text-ink"}>
          NOBODY starts out the same way
        </strong>
        ; everyone approaches it in their own way.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Feel free to share your own experience in the
          comments!
        </p>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Gamepad2 className="h-6 w-6" />
        1. Choosing your software
      </h2>
      <p className={`mb-4 text-subtle`}>
        First, the first question to ask yourself when you want to make a game
        is:{" "}
        <strong className={"text-ink"}>
          "which software am I going to use?"
        </strong>
      </p>
      <p className={`mb-4 text-subtle`}>
        There isn't really a "best" one. It's up to you to find the one you
        prefer, either by watching videos or by installing them and trying them
        out.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          A few recommendations depending on the type of game:
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
                For VR:
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
                For a pixel art game:
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
                For a small 2D or 3D game:
              </strong>{" "}
              Godot
            </span>
          </li>
        </ul>
      </div>

      <p className={`mb-4 text-subtle`}>
        To discover more software, check out our full list of available game
        engines.
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        2. Scope (how big the project is)
      </h2>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Warning: making a video game is a HUGE amount of work!
        </p>
        <p className={`text-muted`}>
          For your first game, don't go for something too complicated (like an
          RPG or a giant open world full of quests...).
        </p>
      </div>

      <p className={`mb-4 text-subtle`}>
        You need to start with{" "}
        <strong className={"text-ink"}>
          small scopes
        </strong>
        , like:
      </p>
      <ul
        className={`list-disc list-inside mb-6 space-y-2 text-subtle`}
      >
        <li>A Flappy Bird</li>
        <li>A Pong</li>
        <li>A simple platformer</li>
      </ul>
      <p className={`mb-4 text-subtle`}>
        Just to get familiar with the software and gain experience.
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Users className="h-6 w-6" />
        3. Understanding the different roles
      </h2>
      <p className={`mb-4 text-subtle`}>
        Keep in mind that{" "}
        <strong className={"text-ink"}>
          each part of a game is a job in itself
        </strong>
        . Studios don't have whole teams developing a game just for show.
      </p>
      <p className={`mb-4 text-subtle`}>
        Sure, some people will wear several hats (in small studios, the
        developer often doubles as the game designer), but programming and game
        design are two different things.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          Main jobs in video games:
        </h3>
        <div className="grid md:grid-cols-2 gap-3">
          {[
            {
              role: "Game Designer",
              desc: "Designs the gameplay and mechanics",
            },
            { role: "Programmer", desc: "Develops and codes the game" },
            { role: "2D/3D Artist", desc: "Creates the visuals and assets" },
            {
              role: "Level Designer",
              desc: "Designs and builds the levels",
            },
            {
              role: "Sound Designer",
              desc: "Creates the music and sound effects",
            },
            {
              role: "Narrative Designer",
              desc: "Writes the story and dialogue",
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
        I recommend reading up on the jobs in the video game industry, so you
        better understand how complex a video game is and can spot{" "}
        <strong className={"text-ink"}>
          which part of the game interests you most
        </strong>
        .
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <FileText className="h-6 w-6" />
        4. The Game Design Document (GDD)
      </h2>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Whatever you do, DON'T start developing right away!
        </p>
      </div>

      <p className={`mb-4 text-subtle`}>
        Before you set off on the adventure, start by writing a document that
        explains your game idea in detail. It's called a{" "}
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
          What goes in the GDD:
        </h3>
        <ul
          className={`space-y-2 text-subtle`}
        >
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Type of game (platformer, FPS, RPG, puzzle...)</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>The gameplay and visual style you want</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>References (similar games, inspirations)</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Main game mechanics</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Story and world (if any)</span>
          </li>
          <li className="flex items-start gap-2">
            <span
              className={`mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-surface`}
            ></span>
            <span>Art direction and mood</span>
          </li>
        </ul>
      </div>

      <p className={`mb-4 text-subtle`}>
        This will keep you from drifting too far from the original idea during
        development. Of course you can edit the document to improve it, but{" "}
        <strong className={"text-ink"}>
          always refer back to the doc during development
        </strong>{" "}
        - it will save time and avoid disagreements within the team.
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Code className="h-6 w-6" />
        5. Development
      </h2>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Organizing the team
      </h3>
      <p className={`mb-4 text-subtle`}>
        Now that everyone knows what you want to make, it's finally time to
        develop!
      </p>
      <p className={`mb-4 text-subtle`}>
        Use collaborative tools to split up the tasks:
      </p>
      <ul
        className={`list-disc list-inside mb-6 space-y-2 text-subtle`}
      >
        <li>
          <strong className={"text-ink"}>
            Trello
          </strong>
          : simple and visual
        </li>
        <li>
          <strong className={"text-ink"}>
            Notion
          </strong>
          : full-featured (you can put your GDD there too)
        </li>
        <li>
          <strong className={"text-ink"}>
            Jira
          </strong>
          : for more complex projects
        </li>
      </ul>
      <p className={`mb-4 text-subtle`}>
        Remember to hold{" "}
        <strong className={"text-ink"}>
          regular meetings
        </strong>{" "}
        to see how development is going and stay on the same page as your team.
      </p>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Working solo, or no artist on the team?
      </h3>
      <p className={`mb-4 text-subtle`}>
        If programming is your thing, you can choose to go it alone using{" "}
        <strong className={"text-ink"}>
          asset packs
        </strong>{" "}
        (free or paid).
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h4
          className={`text-lg font-bold mb-3 text-ink`}
        >
          Free asset sites:
        </h4>
        <ul
          className={`space-y-2 text-subtle`}
        >
          <li>• itch.io (lots of free assets)</li>
          <li>• OpenGameArt.org</li>
          <li>• Kenney.nl (2D and 3D assets)</li>
          <li>• Unity Asset Store (free section)</li>
        </ul>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Not a fan of programming?
      </h3>
      <p className={`mb-4 text-subtle`}>
        You can either hire a developer or use a{" "}
        <strong className={"text-ink"}>
          "block-based"
        </strong>{" "}
        language (also called "no code" or "blueprint").
      </p>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> <strong>Important:</strong> Even if you don't type lines of
          code, it's still{" "}
          <strong className={"text-ink"}>
            programming logic
          </strong>
          . A video game is literally a piece of software run by your computer;
          it can't work without programming. One way or another, you'll have to
          get into it!
        </p>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Task priorities
      </h3>
      <p className={`mb-4 text-subtle`}>
        Rank your tasks by priority and stick to that order:
      </p>
      <ol
        className={`list-decimal list-inside mb-6 space-y-2 text-subtle`}
      >
        <li>
          <strong className={"text-ink"}>
            Game mechanics
          </strong>{" "}
          (what matters for the gameplay)
        </li>
        <li>
          <strong className={"text-ink"}>
            Feedback
          </strong>{" "}
          (showing players that their actions have an effect)
        </li>
        <li>
          <strong className={"text-ink"}>
            Game Feel
          </strong>{" "}
          (the more aesthetic side)
        </li>
      </ol>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h4
          className={`text-lg font-bold mb-3 flex items-center gap-2 text-ink`}
        >
          <Sparkles className="h-5 w-5" />
          Key definitions
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
              Small animations, lighting effects and other effects that make
              the game more pleasant to play. "Juiciness", for example, is part
              of game feel.
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
              Animations and effects that trigger when the player does
              something. They show players that their action worked (or not),
              that it had an impact on something.
            </p>
            <p
              className={`text-sm mt-2 italic text-subtle`}
            >
              Example: a branch falls from the tree when you hit it, to show
              that you've collected wood.
            </p>
          </div>
        </div>
      </div>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Game feel matters a lot to make a game pleasant and
          satisfying to play, but{" "}
          <strong className={"text-ink"}>
            if your game isn't even playable, there's no point adding game feel
          </strong>
          .
        </p>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        6. Starting your own studio
      </h2>
      <p className={`mb-4 text-subtle`}>
        If you want to go further and start your own video game studio, look
        into:
      </p>
      <ul
        className={`list-disc list-inside mb-6 space-y-2 text-subtle`}
      >
        <li>The legal side (setting up a company, legal structure)</li>
        <li>Funding (own funds, investors, crowdfunding)</li>
        <li>Marketing and communication</li>
        <li>
          Publishing on the different platforms (Steam, Epic, consoles...)
        </li>
        <li>Team management</li>
      </ul>

      <div
        className={`mt-8 p-6 rounded border-line`}
      >
        <h3
          className={`text-xl font-bold mb-3 text-ink`}
        >
          Final advice
        </h3>
        <p className={`text-muted`}>
          The most important thing:{" "}
          <strong className={"text-ink"}>
            start small, finish your projects, and learn from each one
          </strong>
          . Ten small finished games are better than one huge abandoned project!
        </p>
      </div>
    </div>
  );
};

export default FirstGameGuide;
