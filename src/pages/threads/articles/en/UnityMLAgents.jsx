import React from "react";
import { Check, ExternalLink, Lightbulb, Package, Play, Terminal, TriangleAlert } from "lucide-react";

const UnityMLAgents = ({ darkMode }) => {
  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        I'm writing a new post to explain things in more detail (now that I've
        had a real struggle setting the thing up). If you prefer videos, you can
        watch{" "}
        <a
          href="https://youtu.be/RANRz9oyzko"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-blue-600 underline"
        >
          this video tutorial
        </a>
        .
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        1. Setting up the Unity project
      </h2>
      <p className={`mb-4 text-subtle`}>
        First of all, you need a Unity project. You have two options:
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          <Package className="inline h-5 w-5 mr-2" />
          Option 1: Example project
        </h3>
        <p className={`mb-2 text-subtle`}>
          Install the example project (it takes a while to download):
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
          Option 2: New project
        </h3>
        <ul
          className={`list-disc list-inside space-y-2 text-subtle`}
        >
          <li>
            Create a new Unity project (3D, 2D, VR, URP, HDR, whatever you
            like...)
          </li>
          <li>Open the Package Manager</li>
          <li>
            In "Unity Registry", install the{" "}
            <strong className={"text-ink"}>
              "ML Agents"
            </strong>{" "}
            package
          </li>
        </ul>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        2. Installing Python 3.9
      </h2>
      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p
          className={`font-semibold mb-2 text-ink`}
        >
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Important: Python 3.9 required!
        </p>
        <p className={`text-muted`}>
          You specifically need Python 3.9, not a more recent version.
        </p>
        <a
          href="https://www.python.org/ftp/python/3.9.13/python-3.9.13-amd64.exe"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-2 text-accent hover:text-blue-600 underline"
        >
          <ExternalLink className="h-4 w-4" />
          Download Python 3.9.13
        </a>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        3. Setting up the virtual environment
      </h2>
      <p className={`mb-4 text-subtle`}>
        Go to your Unity project folder and open a terminal there.
      </p>

      <div
        className={`mb-4 p-4 rounded bg-surface font-mono text-sm`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-4 w-4 text-positive" />
          <span className="text-subtle">Create the virtual environment:</span>
        </div>
        <code className="text-positive">python -m venv venv</code>
      </div>

      <div
        className={`mb-6 p-4 rounded bg-surface font-mono text-sm`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Terminal className="h-4 w-4 text-positive" />
          <span className="text-subtle">
            Activate the virtual environment:
          </span>
        </div>
        <code className="text-positive">venv\scripts\activate.bat</code>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        4. Installing the Python packages
      </h2>
      <p className={`mb-4 text-subtle`}>
        Once the virtual environment is active, install the required packages:
      </p>

      <div className={`space-y-3 mb-6`}>
        <div
          className={`p-4 rounded bg-surface font-mono text-sm`}
        >
          <div className="text-subtle mb-1">1. Upgrade pip:</div>
          <code className="text-positive">
            python -m pip install --upgrade pip
          </code>
        </div>

        <div
          className={`p-4 rounded bg-surface font-mono text-sm`}
        >
          <div className="text-subtle mb-1">2. Install PyTorch:</div>
          <code className="text-positive">
            pip install torch torchvision torchaudio
          </code>
        </div>

        <div
          className={`p-4 rounded bg-surface font-mono text-sm`}
        >
          <div className="text-subtle mb-1">3. Install ML Agents:</div>
          <code className="text-positive">pip install mlagents</code>
        </div>

        <div
          className={`p-4 rounded bg-surface font-mono text-sm`}
        >
          <div className="text-subtle mb-1">4. Install Protobuf 3.20:</div>
          <code className="text-positive">pip install protobuf==3.20.0</code>
        </div>
      </div>

      <div
        className={`mb-6 p-4 rounded bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <Check aria-hidden="true" className="text-positive mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> To check that everything works, type{" "}
          <code
            className={`px-2 py-1 rounded bg-surface`}
          >
            mlagents-learn --help
          </code>
        </p>
        <p
          className={`mt-2 text-sm text-subtle`}
        >
          You should see the list of mlagents commands, with no errors.
        </p>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        5. Create your training scene
      </h2>
      <p className={`mb-4 text-subtle`}>
        In your Unity project, create a small scene with a cube that has to
        reach a sphere (for this example).
      </p>
      <p className={`mb-4 text-subtle`}>
        If you've never used Unity before, I recommend the tutorials from{" "}
        <a
          href="https://youtube.com/@TUTOUNITYFR"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:text-blue-600 underline"
        >
          TUTO UNITY FR
        </a>{" "}
        (in French).
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        6. Create the Agent script
      </h2>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 text-ink`}
        >
          Setting up the script
        </h3>
        <ol
          className={`list-decimal list-inside space-y-2 text-subtle`}
        >
          <li>Create a script (for example "MoveToTarget")</li>
          <li>
            Replace{" "}
            <code
              className={`px-2 py-1 rounded bg-surface`}
            >
              MonoBehaviour
            </code>{" "}
            with{" "}
            <code
              className={`px-2 py-1 rounded bg-surface`}
            >
              Agent
            </code>
          </li>
          <li>Drag this script onto the cube</li>
          <li>
            A "Behaviour Parameters" component will appear automatically
          </li>
          <li>In "Behaviour Name", enter "Move To Target"</li>
        </ol>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Getting the AI's actions
      </h3>
      <p className={`mb-4 text-subtle`}>
        The AI sends a list of numbers to your program. You decide how long the
        list is and whether the numbers are integers or floats.
      </p>
      <p className={`mb-4 text-subtle`}>
        In "Behaviour Parameters", set how many you want of:
      </p>
      <ul
        className={`list-disc list-inside mb-4 text-subtle`}
      >
        <li>
          <strong>Continuous Actions</strong>: floating-point numbers (float)
        </li>
        <li>
          <strong>Discrete Branches</strong>: whole numbers (int)
        </li>
      </ul>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <div className="text-subtle text-sm mb-2">C# code:</div>
        <pre className="text-positive text-sm overflow-x-auto">
          {`public override void OnActionReceived(ActionBuffer actions)
{
    float moveX = actions.ContinuousActions[0];
    float moveZ = actions.ContinuousActions[1];

    // Use moveX and moveZ to move the cube
    transform.position += new Vector3(moveX, 0, moveZ) * Time.deltaTime;
}`}
        </pre>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Giving the AI observations
      </h3>
      <p className={`mb-4 text-subtle`}>
        You need to tell the AI where the target is and where it is itself in
        space.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <div className="text-subtle text-sm mb-2">C# code:</div>
        <pre className="text-positive text-sm overflow-x-auto">
          {`public override void CollectObservations(VectorSensor sensor)
{
    sensor.AddObservation(transform.position);      // Its own position
    sensor.AddObservation(targetTransform.position); // Position of the sphere
}`}
        </pre>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 text-ink`}
      >
        7. Rewards and penalties
      </h2>
      <p className={`mb-4 text-subtle`}>
        To learn, an AI needs to be rewarded when it does something right and
        penalized when it does something wrong.
      </p>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <div className="text-subtle text-sm mb-2">C# code:</div>
        <pre className="text-positive text-sm overflow-x-auto">
          {`private void OnTriggerEnter(Collider other)
{
    if (other.CompareTag("Target")) // If it touches the sphere
    {
        SetReward(1f);  // Reward
        EndEpisode();   // End of the episode
    }
    else if (other.CompareTag("Wall")) // If it touches a wall
    {
        SetReward(-1f); // Penalty
        EndEpisode();
    }
}`}
        </pre>
      </div>

      <div
        className={`mb-6 p-4 rounded bg-surface border-line`}
      >
        <p className={`text-muted`}>
          <Lightbulb aria-hidden="true" className="text-accent mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> <strong>Tip:</strong> A positive number = reward, a negative
          number = penalty
        </p>
      </div>

      <h3
        className={`text-xl font-bold mt-6 mb-3 text-ink`}
      >
        Defining the start of an episode
      </h3>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <div className="text-subtle text-sm mb-2">C# code:</div>
        <pre className="text-positive text-sm overflow-x-auto">
          {`public override void OnEpisodeBegin()
{
    // Reset the cube's position
    transform.position = Vector3.zero;

    // Random position for the sphere (optional)
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
        Limiting the length of an episode
      </h3>
      <p className={`mb-4 text-subtle`}>
        Since the AI's first moves are random, you need to give it a time limit.
      </p>
      <p className={`mb-4 text-subtle`}>
        In the Unity Inspector, in the "MoveToTarget" component, set the{" "}
        <strong>"Max Step"</strong> field to{" "}
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
        8. Start the training
      </h2>

      <div
        className={`mb-6 p-4 rounded bg-surface`}
      >
        <h3
          className={`text-lg font-bold mb-3 flex items-center gap-2 text-ink`}
        >
          <Play className="h-5 w-5" />
          Final steps
        </h3>
        <ol
          className={`list-decimal list-inside space-y-3 text-subtle`}
        >
          <li>
            In your terminal (with the virtual environment still active), type:
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
          <TriangleAlert aria-hidden="true" className="text-warning mr-2 inline h-4 w-4 shrink-0 align-[-3px]" /> Important:
        </p>
        <ul
          className={`list-disc list-inside space-y-1 text-subtle`}
        >
          <li>You need to change the ID for each new test</li>
          <li>
            Or use{" "}
            <code
              className={`px-2 py-1 rounded bg-surface`}
            >
              --force
            </code>{" "}
            to overwrite the previous test
          </li>
        </ul>
      </div>

      <p
        className={`mb-4 text-lg text-subtle`}
      >
        Once the command is running, click{" "}
        <strong className={"text-ink"}>
          Play
        </strong>{" "}
        in Unity and watch your AI learn!
      </p>

      <hr
        className={`my-8 border-line`}
      />

      <div className={`text-muted`}>
        <p className="font-semibold mb-2">Useful resources:</p>
        <ul className="space-y-1">
          <li>
            <a
              href="https://github.com/Unity-Technologies/ml-agents"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              Official Unity ML-Agents documentation
            </a>
          </li>
          <li>
            <a
              href="https://youtu.be/RANRz9oyzko"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              Video tutorial (English)
            </a>
          </li>
          <li>
            <a
              href="https://youtube.com/@TUTOUNITYFR"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              TUTO UNITY FR (French)
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UnityMLAgents;
