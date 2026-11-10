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
        Blockchains have attracted a lot of interest in recent years. Popular
        belief pictures them as completely out of reach of cyberattacks. In
        reality, several threats weigh on the integrity of this technology.
      </p>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Database className="h-6 w-6" />
        1. What is a blockchain?
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
                The Chain of Blocks
              </h3>
              <p
                className={`text-sm text-subtle`}
              >
                Each block contains a set of transactions and is linked to the
                previous one by a <strong>cryptographic hash</strong>, which
                guarantees the integrity of the chain.
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
                Decentralization (P2P)
              </h3>
              <p
                className={`text-sm text-subtle`}
              >
                The network runs on <strong>nodes</strong> spread all over the
                world. Each node holds a copy of the blockchain, which avoids a
                single point of failure.
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Lock className="h-6 w-6" />
        2. Consensus protocols
      </h2>
      <p className={`mb-4 text-subtle`}>
        The consensus algorithm keeps the nodes in sync so they can validate
        blocks and prevent cheating. Here are the three main ones:
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
            Used by <strong>Bitcoin</strong>. Requires a lot of computing power
            (mining) to find a cryptographic hash. Very secure but
            energy-hungry.
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
            The validator is picked at random among token holders (the stake).
            Greener, since it replaces physical mining with virtual mining.
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
            The right to validate is given to a small number of identified,
            trusted nodes. Fast, but more centralized.
          </p>
        </div>
      </div>

      <h2
        className={`text-2xl font-bold mt-10 mb-6 flex items-center gap-2 text-ink`}
      >
        <AlertTriangle className="h-6 w-6 text-warning" />
        3. Major vulnerabilities
      </h2>

      <div
        className={`mb-8 p-5 rounded border bg-surface border-line`}
      >
        <h3
          className={`text-xl font-bold mb-3 flex items-center gap-2 text-warning`}
        >
          The 51% attack (Goldfinger)
        </h3>
        <p className={`mb-4 text-subtle`}>
          If a group controls more than half of the computing power (PoW) or of
          the tokens (PoS), it can rewrite history.
        </p>

        <div className="my-6 bg-surface rounded overflow-hidden border-line">
          <img
            src="/assets_threads/images/51-percent-attack.png"
            alt="Diagram of the 51% attack"
            width={1400}
            height={1367}
            loading="lazy"
            decoding="async"
            className="w-full object-cover"
          />
          <p
            className={`text-xs py-2 text-center text-subtle`}
          >
            How the 51% attack works
          </p>
        </div>

        <div
          className={`p-4 rounded bg-surface`}
        >
          <h4
            className={`font-bold mb-2 text-subtle`}
          >
            Consequence: Double Spending
          </h4>
          <p
            className={`text-sm text-subtle`}
          >
            The attacker spends tokens, then builds a parallel chain (longer,
            thanks to their computing power) in which that transaction does not
            exist. The network adopts the new chain, and the attacker gets their
            tokens back while keeping what they bought.
          </p>
          <p
            className={`mt-2 text-xs italic text-muted`}
          >
            Real example: Bitcoin Gold (the 26th-largest cryptocurrency at the
            time) suffered this attack.
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
            The Sybil attack
          </h3>
          <p
            className={`text-sm text-subtle`}
          >
            An attacker creates a large number of fake nodes (identities) to
            gain disproportionate influence over the network. This can make a
            51% attack easier if the reputation system is weak.
          </p>
        </div>

        <div
          className={`p-5 rounded border bg-surface border-line`}
        >
          <h3
            className={`text-lg font-bold mb-3 flex items-center gap-2 text-ink`}
          >
            <Server className="h-5 w-5 text-accent" />
            Oligarchy (DPoS)
          </h3>
          <p
            className={`text-sm text-subtle`}
          >
            In "Delegated Proof of Stake", if few people vote, a small,
            organized group of delegates can take control of the network and
            centralize power.
          </p>
        </div>
      </div>

      <h2
        className={`text-2xl font-bold mt-8 mb-4 flex items-center gap-2 text-ink`}
      >
        <Cpu className="h-6 w-6" />
        4. The future: the Quantum Threat
      </h2>

      <div
        className={`mb-6 p-4 rounded border bg-surface border-line`}
      >
        <p className={`mb-3 text-subtle`}>
          Quantum computing threatens today's cryptography (RSA, elliptic
          curves). <strong>Shor</strong>'s algorithm could, in theory, recover
          private keys from public keys.
        </p>
        <p
          className={`text-sm font-semibold text-accent`}
        >
          Impact: Bitcoin's "Pay To Pubkey" scheme would become vulnerable.
          NIST is developing post-quantum cryptography solutions.
        </p>
      </div>

      <div
        className={`mt-10 p-6 rounded border-line`}
      >
        <h3
          className={`text-xl font-bold mb-4 flex items-center gap-2 text-ink`}
        >
          <Globe className="h-5 w-5" />
          Beyond cryptocurrencies
        </h3>
        <p className={`mb-4 text-subtle`}>
          Security matters because blockchains handle much more than money:
        </p>
        <ul className="grid md:grid-cols-2 gap-3">
          {[
            "Electronic voting systems",
            "Smart contracts (insurance, law)",
            "Energy distribution",
            "Agricultural traceability",
            "Land registries",
            "Health records and diplomas",
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
        <p className="font-semibold mb-2">Further reading:</p>
        <ul className="space-y-1">
          <li>
            <a
              href="https://bitcoin.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              Bitcoin documentation on consensus
            </a>
          </li>
          <li>
            <a
              href="https://ethereum.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:text-blue-600 underline"
            >
              Ethereum and Proof of Stake
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
