import React from "react";
import { Check, ExternalLink, Lightbulb, Package, Play, Terminal, TriangleAlert } from "lucide-react";

const UnityMLAgents = ({ darkMode }) => {
  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        Je refais un post pour donner plus d'explications (maintenant que j'ai
        bien galéré à setup le truc). Si vous préférez les vidéos, vous pouvez
        regarder{" "}
        <a
          href="https://youtu.be/RANRz9oyzko"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-blue-600 underline"
        >
          ce tutoriel en anglais
        </a>
        .
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        1. Installation du projet Unity
      </h2>
      <p className={`mb-4 text-subtle`}>
        Tout d'abord il vous faut un projet Unity. Vous avez deux options :
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          <Package className="inline h-5 w-5 mr-2" />
          Option 1 : Projet exemple
        </h3>
        <p className={`mb-2 text-subtle`}>
          Installer le projet exemple (un peu long à télécharger) :
        </p>
        <a
          href="https://github.com/Unity-Technologies/ml-agents"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-accent hover:text-blue-600 underline"
        >
          <ExternalLink className="h-4 w-4" />
          GitHub - Unity ML Agents
        </a>
      </div>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          <Package className="inline h-5 w-5 mr-2" />
          Option 2 : Nouveau projet
        </h3>
        <ul
          className={`list-disc list-inside space-y-2 text-subtle`}
        >
          <li>
            Créer un nouveau projet Unity (3D, 2D, VR, URP, HDR, comme vous
            voulez...)
          </li>
          <li>Ouvrir le Package Manager</li>
          <li>
            Dans "Unity Registry", installer le package{" "}
            <strong className={"text-ink"}>
              "ML Agents"
            </strong>
          </li>
        </ul>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        2. Installation de Python 3.9
      </h2>
      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Important : Python 3.9 requis !
        </p>
        <p className={`text-muted`}>
          Il vous faut spécifiquement Python 3.9, pas une version plus récente.
        </p>
        <a
          href="https://www.python.org/ftp/python/3.9.13/python-3.9.13-amd64.exe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 text-accent hover:text-blue-600 underline"
        >
          <ExternalLink className="h-4 w-4" />
          Télécharger Python 3.9.13
        </a>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        3. Configuration de l'environnement virtuel
      </h2>
      <p className={`mb-4 text-subtle`}>
        Rendez-vous dans le dossier de votre projet Unity et ouvrez un terminal
        à cet endroit.
      </p>

      <div
        className={`mb-4 p-4 rounded bg-surface font-mono text-sm`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-4 w-4 text-positive" />
          <span className="text-subtle">Créer l'environnement virtuel :</span>
        </div>
        <code className="text-positive">python -m venv venv</code>
      </div>

      <div
        className={`mb-6 p-4 rounded bg-surface font-mono text-sm`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-4 w-4 text-positive" />
          <span className="text-subtle">
            Activer l'environnement virtuel :
          </span>
        </div>
        <code className="text-positive">venv\scripts\activate.bat</code>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        4. Installation des packages Python
      </h2>
      <p className={`mb-4 text-subtle`}>
        Une fois l'environnement virtuel activé, installez les packages
        nécessaires :
      </p>

      <div className={`space-y-3 mb-6`}>
        <div
          className={`p-4 rounded bg-surface font-mono text-sm`}
        >
          <div className="text-subtle mb-1">1. Upgrade pip :</div>
          <code className="text-positive">
            python -m pip install --upgrade pip
          </code>
        </div>

        <div
          className={`p-4 rounded bg-surface font-mono text-sm`}
        >
          <div className="text-subtle mb-1">2. Installer PyTorch :</div>
          <code className="text-positive">
            pip install torch torchvision torchaudio
          </code>
        </div>

        <div
          className={`p-4 rounded bg-surface font-mono text-sm`}
        >
          <div className="text-subtle mb-1">3. Installer ML Agents :</div>
          <code className="text-positive">pip install mlagents</code>
        </div>

        <div
          className={`p-4 rounded bg-surface font-mono text-sm`}
        >
          <div className="text-subtle mb-1">4. Installer Protobuf 3.20 :</div>
          <code className="text-positive">pip install protobuf==3.20.0</code>
        </div>
      </div>

      <div
        className={`mb-6 p-4 rounded bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <Check aria-hidden="true" className="text-positive mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Pour vérifier que tout fonctionne, tapez{" "}
          <code
            className={`px-2 py-1 rounded bg-surface`}
          >
            mlagents-learn --help
          </code>
        </p>
        <p
          className={`mt-2 text-sm text-subtle`}
        >
          Vous devriez voir la liste des commandes de mlagents sans erreur.
        </p>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        5. Créer votre scène d'entraînement
      </h2>
      <p className={`mb-4 text-subtle`}>
        Sur votre projet Unity, créez une petite scène avec un cube qui doit
        atteindre une sphère (pour l'exemple).
      </p>
      <p className={`mb-4 text-subtle`}>
        Si vous n'avez jamais touché à Unity, je vous recommande les tutoriels
        de{" "}
        <a
          href="https://youtube.com/@TUTOUNITYFR"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-blue-600 underline"
        >
          TUTO UNITY FR
        </a>
        .
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        6. Créer le script Agent
      </h2>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          Configuration du script
        </h3>
        <ol
          className={`list-decimal list-inside space-y-2 text-subtle`}
        >
          <li>Créez un script (par exemple "MoveToTarget")</li>
          <li>
            Remplacez{" "}
            <code
              className={`px-2 py-1 rounded bg-surface`}
            >
              MonoBehaviour
            </code>{" "}
            par{" "}
            <code
              className={`px-2 py-1 rounded bg-surface`}
            >
              Agent
            </code>
          </li>
          <li>Glissez ce script sur le cube</li>
          <li>
            Un composant "Behaviour Parameters" apparaîtra automatiquement
          </li>
          <li>Dans "Behaviour Name", mettez "Move To Target"</li>
        </ol>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Récupérer les actions de l'IA
      </h3>
      <p className={`mb-4 text-subtle`}>
        L'IA envoie une liste de nombres à votre programme. C'est vous qui
        décidez quelle taille fait la liste et si ce sont des nombres entiers ou
        flottants.
      </p>
      <p className={`mb-4 text-subtle`}>
        Dans "Behaviour Parameters", déterminez combien vous voulez de :
      </p>
      <ul
        className={`list-disc list-inside mb-4 text-subtle`}
      >
        <li>
          <strong>Continuous Actions</strong> : nombres flottants (float)
        </li>
        <li>
          <strong>Discrete Branches</strong> : nombres entiers (int)
        </li>
      </ul>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <div className="text-subtle text-sm mb-2">Code C# :</div>
        <pre className="text-positive text-sm overflow-x-auto">
          {`public override void OnActionReceived(ActionBuffer actions)
{
    float moveX = actions.ContinuousActions[0];
    float moveZ = actions.ContinuousActions[1];
    
    // Utiliser moveX et moveZ pour déplacer le cube
    transform.position += new Vector3(moveX, 0, moveZ) * Time.deltaTime;
}`}
        </pre>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Donner des observations à l'IA
      </h3>
      <p className={`mb-4 text-subtle`}>
        Il faut dire à l'IA où se trouve l'objectif et où elle se trouve
        elle-même dans l'espace.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <div className="text-subtle text-sm mb-2">Code C# :</div>
        <pre className="text-positive text-sm overflow-x-auto">
          {`public override void CollectObservations(VectorSensor sensor)
{
    sensor.AddObservation(transform.position);      // Sa propre position
    sensor.AddObservation(targetTransform.position); // Position de la sphère
}`}
        </pre>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        7. Système de récompenses et punitions
      </h2>
      <p className={`mb-4 text-subtle`}>
        Une IA, pour apprendre, a besoin d'être récompensée quand elle fait une
        bonne action et punie quand elle fait une mauvaise action.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <div className="text-subtle text-sm mb-2">Code C# :</div>
        <pre className="text-positive text-sm overflow-x-auto">
          {`private void OnTriggerEnter(Collider other)
{
    if (other.CompareTag("Target")) // Si touche la sphère
    {
        SetReward(1f);  // Récompense
        EndEpisode();   // Fin de l'épisode
    }
    else if (other.CompareTag("Wall")) // Si touche un mur
    {
        SetReward(-1f); // Punition
        EndEpisode();
    }
}`}
        </pre>
      </div>

      <div
        className={`mb-6 p-4 rounded bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> <strong>Astuce :</strong> Un nombre positif = récompense, un nombre
          négatif = punition
        </p>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Définir le début d'un épisode
      </h3>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <div className="text-subtle text-sm mb-2">Code C# :</div>
        <pre className="text-positive text-sm overflow-x-auto">
          {`public override void OnEpisodeBegin()
{
    // Réinitialiser la position du cube
    transform.position = Vector3.zero;
    
    // Position aléatoire pour la sphère (optionnel)
    targetTransform.position = new Vector3(
        Random.Range(-5f, 5f),
        0.5f,
        Random.Range(-5f, 5f)
    );
}`}
        </pre>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Limiter le temps d'un épisode
      </h3>
      <p className={`mb-4 text-subtle`}>
        Comme les premiers mouvements de l'IA sont aléatoires, il faut lui
        donner un temps limité.
      </p>
      <p className={`mb-4 text-subtle`}>
        Dans l'Inspector Unity, dans le composant "MoveToTarget", réglez le
        champ <strong>"Max Step"</strong> à{" "}
        <code
          className={`px-2 py-1 rounded bg-surface`}
        >
          1000
        </code>
        .
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        8. Lancer l'entraînement
      </h2>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 flex items-center gap-2 text-ink`}
        >
          <Play className="h-5 w-5" />
          Étapes finales
        </h3>
        <ol
          className={`list-decimal list-inside space-y-3 text-subtle`}
        >
          <li>
            Dans votre terminal (environnement virtuel toujours actif), tapez :
          </li>
        </ol>
      </div>

      <div
        className={`mb-6 p-4 rounded bg-surface font-mono text-sm`}
      >
        <code className="text-positive">mlagents-learn --run-id=Test1</code>
      </div>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Important :
        </p>
        <ul
          className={`list-disc list-inside space-y-1 text-subtle`}
        >
          <li>Il faut changer l'ID à chaque nouveau test</li>
          <li>
            Ou utiliser{" "}
            <code
              className={`px-2 py-1 rounded bg-surface`}
            >
              --force
            </code>{" "}
            pour écraser le test précédent
          </li>
        </ul>
      </div>

      <p
        className={`mb-4 text-lg text-subtle`}
      >
        Une fois la commande lancée, cliquez sur{" "}
        <strong className={"text-ink"}>
          Play
        </strong>{" "}
        dans Unity et observez votre IA apprendre !
      </p>

      <hr
        className={`my-8 border-line`}
      />

      <div className={`text-muted`}>
        <p className="font-semibold mb-2">Ressources utiles :</p>
        <ul className="space-y-1">
          <li>
            <a
              href="https://github.com/Unity-Technologies/ml-agents"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              Documentation officielle Unity ML-Agents
            </a>
          </li>
          <li>
            <a
              href="https://youtu.be/RANRz9oyzko"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              Tutoriel vidéo (anglais)
            </a>
          </li>
          <li>
            <a
              href="https://youtube.com/@TUTOUNITYFR"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              TUTO UNITY FR (français)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UnityMLAgents;
