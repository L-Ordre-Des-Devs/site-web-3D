import React from "react";
import {
  ShieldAlert,
  Network,
  Lock,
  Cpu,
  Zap,
  Server,
  Link,
  Users,
  AlertTriangle,
  Globe,
  Database,
} from "lucide-react";

const VulnerabilitiesBlockchains = ({ darkMode }) => {
  return (
    <div className="text-justify">
      <p
        className={`mb-6 text-lg text-subtle`}
      >
        Les blockchains ont suscité un grand intérêt ces dernières années.
        L'imaginaire collectif se les imagine comme totalement hors de portée
        des cyberattaques. En réalité, plusieurs menaces pèsent sur l'intégrité
        de cette technologie.
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Database className="h-6 w-6" />
        1. Qu'est-ce qu'une blockchain ?
      </h2>

      <div
        className={`mb-6 p-5 rounded border bg-surface border-line`}
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded bg-surface text-accent`}
            >
              <Link className="h-5 w-5" />
            </div>
            <div>
              <h3
                className={`font-bold text-ink`}
              >
                La Chaîne de Blocs
              </h3>
              <p
                className={`text-sm text-subtle`}
              >
                Chaque bloc contient un ensemble de transactions et est lié au
                précédent par un <strong>hash cryptographique</strong>,
                garantissant l'intégrité de la chaîne.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded bg-surface text-accent`}
            >
              <Network className="h-5 w-5" />
            </div>
            <div>
              <h3
                className={`font-bold text-ink`}
              >
                Décentralisation (P2P)
              </h3>
              <p
                className={`text-sm text-subtle`}
              >
                Le réseau fonctionne grâce à des <strong>nœuds</strong> répartis
                dans le monde entier. Chaque nœud possède une copie de la
                blockchain, ce qui évite un point unique de défaillance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Lock className="h-6 w-6" />
        2. Les protocoles de consensus
      </h2>
      <p className={`mb-4 text-subtle`}>
        L'algorithme de consensus synchronise les nœuds pour valider les blocs
        et empêcher la triche. Voici les trois principaux :
      </p>

      <div className="grid md:grid-cols-1 gap-4 mb-6">
        <div
          className={`p-4 rounded border bg-surface border-line`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Cpu
              className={`h-5 w-5 text-warning`}
            />
            <h3
              className={`font-bold text-lg text-ink`}
            >
              Proof of Work (PoW)
            </h3>
          </div>
          <p
            className={`text-sm text-subtle`}
          >
            Utilisé par <strong>Bitcoin</strong>. Nécessite une grande puissance
            de calcul (minage) pour trouver une empreinte cryptographique. Très
            sécurisé mais énergivore.
          </p>
        </div>

        <div
          className={`p-4 rounded border bg-surface border-line`}
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap
              className={`h-5 w-5 text-positive`}
            />
            <h3
              className={`font-bold text-lg text-ink`}
            >
              Proof of Stake (PoS)
            </h3>
          </div>
          <p
            className={`text-sm text-subtle`}
          >
            Le validateur est choisi aléatoirement parmi les possesseurs de
            jetons (stake). Plus écologique car il supprime le minage physique
            au profit d'un minage virtuel.
          </p>
        </div>

        <div
          className={`p-4 rounded border bg-surface border-line`}
        >
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert
              className={`h-5 w-5 text-accent`}
            />
            <h3
              className={`font-bold text-lg text-ink`}
            >
              Proof of Authority (PoA)
            </h3>
          </div>
          <p
            className={`text-sm text-subtle`}
          >
            Le droit de validation est donné à un nombre restreint de nœuds
            identifiés et fiables. Rapide mais plus centralisé.
          </p>
        </div>
      </div>

      <h2
        className={`text-2xl font-bold mt-10 mb-6 flex items-center gap-2 text-ink`}
      >
        <AlertTriangle className="h-6 w-6 text-warning" />
        3. Vulnérabilités majeures
      </h2>

      <div
        className={`mb-8 p-5 rounded border bg-surface border-line`}
      >
        <h3
          className={`text-xl font-bold mb-3 flex items-center gap-2 text-warning`}
        >
          L'attaque des 51% (Goldfinger)
        </h3>
        <p className={`mb-4 text-subtle`}>
          Si un groupe contrôle plus de la moitié de la puissance de calcul
          (PoW) ou des jetons (PoS), il peut réécrire l'histoire.
        </p>

        <div className="my-6 bg-surface rounded overflow-hidden border-line">
          <img
            src="/assets_threads/images/51-percent-attack.png"
            alt="Schéma de l'attaque des 51%"
            width={1400}
            height={1367}
            loading="lazy"
            decoding="async"
            className="w-full object-cover"
          />
          <p
            className={`text-xs py-2 text-center text-subtle`}
          >
            Schéma explicatif de l'attaque des 51%
          </p>
        </div>

        <div
          className={`p-4 rounded bg-surface`}
        >
          <h4
            className={`font-bold mb-2 text-subtle`}
          >
            Conséquences : La Double Dépense
          </h4>
          <p
            className={`text-sm text-subtle`}
          >
            L'attaquant dépense des jetons, puis crée une chaîne parallèle (plus
            longue grâce à sa puissance) où cette transaction n'existe pas. Le
            réseau adopte la nouvelle chaîne, et l'attaquant récupère ses jetons
            tout en gardant ce qu'il a acheté.
          </p>
          <p
            className={`mt-2 text-xs italic text-muted`}
          >
            Exemple réel : Bitcoin Gold (26ème crypto à l'époque) a subi cette
            attaque.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div
          className={`p-5 rounded border bg-surface border-line`}
        >
          <h3
            className={`text-lg font-bold mb-3 flex items-center gap-2 text-ink`}
          >
            <Users className="h-5 w-5 text-accent" />
            L'attaque Sybil
          </h3>
          <p
            className={`text-sm text-subtle`}
          >
            Un attaquant crée une multitude de faux nœuds (identités) pour avoir
            une influence disproportionnée sur le réseau. Cela peut faciliter
            une attaque des 51% si le système de réputation est faible.
          </p>
        </div>

        <div
          className={`p-5 rounded border bg-surface border-line`}
        >
          <h3
            className={`text-lg font-bold mb-3 flex items-center gap-2 text-ink`}
          >
            <Server className="h-5 w-5 text-accent" />
            L'Oligarchie (DPoS)
          </h3>
          <p
            className={`text-sm text-subtle`}
          >
            Dans le "Delegated Proof of Stake", si peu de gens votent, un petit
            groupe organisé de délégués peut prendre le contrôle du réseau et
            centraliser le pouvoir.
          </p>
        </div>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Cpu className="h-6 w-6" />
        4. Le futur : Menace Quantique
      </h2>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p className={`mb-3 text-subtle`}>
          L'informatique quantique menace la cryptographie actuelle (RSA,
          courbes elliptiques). L'algorithme de <strong>Shor</strong> pourrait
          théoriquement casser les clés privées à partir des clés publiques.
        </p>
        <p
          className={`text-sm font-semibold text-accent`}
        >
          Impact : Le système "Pay To Pubkey" du Bitcoin deviendrait vulnérable.
          Des solutions de cryptographie post-quantique sont en cours de
          développement par le NIST.
        </p>
      </div>

      <div
        className={`mt-10 p-6 rounded border-line`}
      >
        <h3
          className={`text-xl font-bold mb-4 flex items-center gap-2 text-ink`}
        >
          <Globe className="h-5 w-5" />
          Au-delà des cryptomonnaies
        </h3>
        <p className={`mb-4 text-subtle`}>
          La sécurité est cruciale car la blockchain gère bien plus que de
          l'argent :
        </p>
        <ul className="grid md:grid-cols-2 gap-3">
          {[
            "Systèmes de votes électroniques",
            "Smart Contracts (Assurances, Droit)",
            "Distribution d'énergie",
            "Traçabilité agricole",
            "Registres fonciers",
            "Santé et diplômes",
          ].map((item, idx) => (
            <li
              key={idx}
              className={`flex items-center gap-2 text-sm text-subtle`}
            >
              <div
                className={`h-1.5 w-1.5 rounded-full bg-surface`}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <hr
        className={`my-8 border-line`}
      />

      <div className={`text-muted`}>
        <p className="font-semibold mb-2">Pour aller plus loin :</p>
        <ul className="space-y-1">
          <li>
            <a
              href="https://bitcoin.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              Documentation Bitcoin sur le consensus
            </a>
          </li>
          <li>
            <a
              href="https://ethereum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              Ethereum et le Proof of Stake
            </a>
          </li>
          <li>
            <a
              href="https://csrc.nist.gov"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              NIST - Post-Quantum Cryptography
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default VulnerabilitiesBlockchains;
