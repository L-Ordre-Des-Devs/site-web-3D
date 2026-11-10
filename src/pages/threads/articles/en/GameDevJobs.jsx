import React from "react";
import { Briefcase, Bug, Code, FileText, Mic, Music, Palette, TriangleAlert } from "lucide-react";

const GameDevJobs = ({ darkMode }) => {
  const jobs = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "The Developer",
      description: "Easy one: the person who writes the code",
      details:
        "Depending on the size of the studio, there may be different kinds of developers. For example, the game developer (who codes the gameplay mechanics) won't be the same person as the online developer (who handles the online side, making sure information gets correctly from one end of the network to the other).",
      color: "blue",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "The Game Designer",
      description: "No, it's not someone who draws!",
      details:
        "The game designer is the one who handles the game's balance. They also tell the developers where to add game feel (elements that make the game more pleasant to play) and where to add feedback (elements that show players their actions have an impact on the game). Basically, their job is to make the game fun.",
      color: "purple",
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: "The Level Designer",
      description: "Architect of the game's levels",
      details:
        "They lay out the level, which has to be coherent while also being a good playground that's enjoyable to move around in. Usually the Game Designer and the Level Designer are the same person, but sometimes (especially in big studios) they're two different people.",
      color: "green",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "The 2D Artist",
      description: "Creator of the 2D visuals",
      details:
        "In a 2D game, they make the assets; in a 3D game, they often do the character designs to help the 3D modelers. If the game has a story, they'll also do the storyboard.",
      color: "pink",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "The UI Designer / Graphic Designer",
      description: "Creator of the interfaces",
      details:
        "They draw the graphical interfaces (menus and other HUDs, for example). Every game needs them, 3D games included, so if you choose 2D, you'll be able to find work on every kind of game",
      color: "cyan",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "The 3D Modeler",
      description: "Digital sculptor",
      details:
        "Well, as the name says, they're the one who models xD They create the 3D characters, objects and environments that bring the game to life.",
      color: "orange",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "The Rigger",
      description: "Builder of 3D skeletons",
      details:
        "They build the skeleton of the 3D model (the rig). That's what makes it possible to animate the 3D model. A clean 3D model is needed to rig it properly, and a clean rig is needed to animate it properly.",
      color: "yellow",
    },
    {
      icon: <Palette className="h-6 w-6" />,
      title: "The Animator",
      description: "Brings things to life",
      details:
        "In 2D, it's usually the artist who animates their own assets. In 3D, if the modeler made their own rig, they'll probably do the animation too; otherwise, there'll be a different person at each step.",
      color: "red",
    },
    {
      icon: <Music className="h-6 w-6" />,
      title: "The Sound Designer",
      description: "Creator of soundscapes",
      details:
        "They make all the little sound effects in the game, for example footsteps, slamming doors, etc...",
      color: "indigo",
    },
    {
      icon: <Music className="h-6 w-6" />,
      title: "The Composer",
      description: "Creator of the music",
      details:
        "They create the game's music, for example for the menu or for the different areas.",
      color: "violet",
    },
    {
      icon: <Mic className="h-6 w-6" />,
      title: "The Voice Actor",
      description: "Voices the characters",
      details:
        "Yeah, in the end we've got pretty much the same jobs as in film xD Anyway, the voice actor is the person who lends their voice to a character in the game (if there are characters who speak).",
      color: "teal",
    },
    {
      icon: <FileText className="h-6 w-6" />,
      title: "The Writer",
      description: "Storyteller",
      details:
        "They write the script, deciding when dialogue between which characters happens and when the cutscenes start.",
      color: "emerald",
    },
    {
      icon: <Bug className="h-6 w-6" />,
      title: "The Beta Tester",
      description: "Professional bug hunter",
      details:
        "Well, usually nobody bothers paying people for this xD but sometimes professionals do get hired for it. No, it's not just playing the game and giving your opinion. You have to TEST the game: press every button, try to get into places and do things that aren't supposed to be possible; basically, go bug hunting. And when they find a bug, they write a detailed report on how the bug appeared, how to reproduce it and how it could be patched.",
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
        In this thread I'm going to list the jobs in the video game industry and
        roughly explain what each one involves. There are a huge number of
        different jobs, so I may have missed some!
      </p>

      <div
        className={`mb-8 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Good to know
        </p>
        <p className={`text-muted`}>
          In small studios, it's very rare for someone to have just one role.
          Usually each employee wears 2 or 3 hats (if not more). For example,
          the developer very often also handles game design and level design.
          That's why some jobs are easy to mix up.
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
          Finding your path
        </h3>
        <p className={`mb-4 text-subtle`}>
          Every job matters when making a video game. The best approach is to
          try several fields to find out what you're really passionate about!
        </p>
        <div className={`grid md:grid-cols-3 gap-4 mt-4`}>
          <div
            className={`p-4 rounded bg-surface`}
          >
            <h4
              className={`font-bold mb-2 text-accent`}
            >
              Technical profile
            </h4>
            <p
              className={`text-sm text-subtle`}
            >
              Developer, Rigger, Online Developer
            </p>
          </div>
          <div
            className={`p-4 rounded bg-surface`}
          >
            <h4
              className={`font-bold mb-2 text-accent`}
            >
              Creative profile
            </h4>
            <p
              className={`text-sm text-subtle`}
            >
              2D Artist, 3D Modeler, Animator, Sound Designer
            </p>
          </div>
          <div
            className={`p-4 rounded bg-surface`}
          >
            <h4
              className={`font-bold mb-2 text-positive`}
            >
              Design profile
            </h4>
            <p
              className={`text-sm text-subtle`}
            >
              Game Designer, Level Designer, Writer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameDevJobs;
