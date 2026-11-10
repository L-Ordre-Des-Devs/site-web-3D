import React from "react";
import { ArrowUpRight } from "lucide-react";
import { useLang } from "./i18n";

const TEXT = {
  fr: {
    updated: "Décembre 2024",
    eyebrow: "Informations légales",
    title: "Mentions légales",
    lead: "Éditeur, hébergement, traitement des données personnelles et conditions d'utilisation du site.",
    reference: "",
    lastUpdate: "Dernière mise à jour",
    law: "Droit applicable",
    lawValue: "France",
    articles: "Articles",
    toc: "Sommaire",
    sections: {
      identification: "Identification du site",
      publication: "Responsables de la publication",
      hebergement: "Hébergement",
      objet: "Objet du site",
      donnees: "Protection des données personnelles",
      propriete: "Propriété intellectuelle",
      responsabilite: "Limitation de responsabilité",
      droit: "Droit applicable et juridiction",
      contact: "Contact",
    },
    siteName: "Nom du site",
    siteUrl: "URL du site",
    legalForm: "Nature juridique",
    legalFormValue: "Collectif bénévole sans but lucratif",
    status: "Statut",
    statusValue: "Association de fait, sans numéro SIRET",
    publisher: "La publication du site est assurée par L'Ordre des Devs, collectif.",
    directors: "Responsables de publication",
    generalContact: "Contact général",
    host: "Hébergeur",
    contact: "Contact",
    website: "Site web",
    purpose:
      "L'Ordre des Devs est une communauté bénévole dédiée au développement informatique et à la cybersécurité. Notre mission principale est de :",
    missions: [
      "Faciliter l'entraide et le partage de connaissances entre développeurs",
      "Mettre en relation clients et développeurs freelances pour la réalisation de projets",
      "Organiser des événements, formations et compétitions dans le domaine informatique",
      "Promouvoir les bonnes pratiques en développement et cybersécurité",
    ],
    important: "Important",
    noCommission:
      "L'Ordre des Devs ne perçoit aucune commission sur les mises en relation entre clients et freelances. Notre service est entièrement gratuit et bénévole.",
    noCollection: "Aucune collecte de données",
    noCollectionText:
      "L'Ordre des Devs ne collecte aucune donnée personnelle via son site web. Nous n'utilisons aucun système de tracking, analytics ou cookies.",
    principles: "Principes appliqués",
    principlesList: [
      "Aucun cookie n'est déposé sur votre navigateur",
      "Aucune donnée de navigation n'est enregistrée",
      "Aucun formulaire de contact sur le site",
      "Respect total de votre vie privée",
    ],
    note: "Note",
    discord: "Les échanges au sein de notre communauté s'effectuent via Discord, qui applique sa propre politique de confidentialité.",
    property:
      "L'ensemble des éléments constituant le site (textes, images, logos, design) sont la propriété exclusive de L'Ordre des Devs, sauf mention contraire.",
    allowed: "Utilisation autorisée",
    allowedList: ["Consultation personnelle et privée du site", "Partage des liens vers notre contenu"],
    forbidden: "Utilisation interdite",
    forbiddenList: [
      "Reproduction ou représentation sans autorisation",
      "Utilisation commerciale du contenu",
      "Modification ou altération des éléments",
    ],
    accuracy:
      "L'Ordre des Devs s'efforce de fournir des informations exactes et à jour. Cependant, nous ne pouvons garantir l'exactitude, la complétude ou l'actualité de toutes les informations présentes sur le site.",
    matching: "Mise en relation",
    matchingText:
      "L'Ordre des Devs facilite la mise en relation entre clients et freelances mais n'est pas partie prenante des contrats conclus. Nous ne sommes pas responsables des litiges pouvant survenir entre les parties.",
    exclusions: "Exclusions de responsabilité",
    exclusionsList: [
      "Interruptions techniques du site",
      "Contenus publiés par les membres de la communauté",
      "Dommages résultant de l'utilisation du site",
    ],
    governingLaw:
      "Les présentes mentions légales sont régies par le droit français. En cas de litige, les tribunaux français seront seuls compétents.",
    statutes:
      "Conformément à l'article 6 de la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique et à l'article 19 de la loi n° 86-1067 du 30 septembre 1986.",
    questions: "Pour toute question concernant ces mentions légales ou le fonctionnement du site :",
  },
  en: {
    updated: "December 2024",
    eyebrow: "Legal information",
    title: "Legal notice",
    lead: "Publisher, hosting, personal data and terms of use of the site.",
    reference: "This English version is a translation provided for convenience. The French version is the reference.",
    lastUpdate: "Last updated",
    law: "Governing law",
    lawValue: "France",
    articles: "Sections",
    toc: "Contents",
    sections: {
      identification: "Site identification",
      publication: "Publication directors",
      hebergement: "Hosting",
      objet: "Purpose of the site",
      donnees: "Personal data protection",
      propriete: "Intellectual property",
      responsabilite: "Limitation of liability",
      droit: "Governing law and jurisdiction",
      contact: "Contact",
    },
    siteName: "Site name",
    siteUrl: "Site URL",
    legalForm: "Legal form",
    legalFormValue: "Non-profit volunteer collective",
    status: "Status",
    statusValue: "Unregistered association, with no SIRET number",
    publisher: "The site is published by L'Ordre des Devs, a collective.",
    directors: "Publication directors",
    generalContact: "General contact",
    host: "Host",
    contact: "Contact",
    website: "Website",
    purpose:
      "L'Ordre des Devs is a volunteer community dedicated to software development and cybersecurity. Our main mission is to:",
    missions: [
      "Make it easier for developers to help each other and share knowledge",
      "Connect clients with freelance developers for their projects",
      "Organize events, training sessions and competitions in computing",
      "Promote good practices in development and cybersecurity",
    ],
    important: "Important",
    noCommission:
      "L'Ordre des Devs takes no commission on connections between clients and freelancers. Our service is entirely free and run by volunteers.",
    noCollection: "No data collection",
    noCollectionText:
      "L'Ordre des Devs does not collect any personal data through its website. We use no tracking, analytics or cookies.",
    principles: "Principles we follow",
    principlesList: [
      "No cookies are stored in your browser",
      "No browsing data is recorded",
      "No contact form on the site",
      "Full respect for your privacy",
    ],
    note: "Note",
    discord: "Conversations within our community take place on Discord, which applies its own privacy policy.",
    property:
      "All elements of the site (texts, images, logos, design) are the exclusive property of L'Ordre des Devs, unless stated otherwise.",
    allowed: "Permitted use",
    allowedList: ["Personal, private viewing of the site", "Sharing links to our content"],
    forbidden: "Prohibited use",
    forbiddenList: ["Reproduction or display without permission", "Commercial use of the content", "Modifying or altering any element"],
    accuracy:
      "L'Ordre des Devs strives to provide accurate and up-to-date information. However, we cannot guarantee that all information on the site is accurate, complete or current.",
    matching: "Connecting clients and freelancers",
    matchingText:
      "L'Ordre des Devs helps clients and freelancers get in touch but is not a party to the contracts they sign. We are not responsible for disputes that may arise between the parties.",
    exclusions: "Exclusions of liability",
    exclusionsList: ["Technical interruptions of the site", "Content published by community members", "Damage resulting from use of the site"],
    governingLaw:
      "This legal notice is governed by French law. In the event of a dispute, the French courts have sole jurisdiction.",
    statutes:
      "In accordance with Article 6 of French Law No. 2004-575 of 21 June 2004 on confidence in the digital economy, and Article 19 of Law No. 86-1067 of 30 September 1986.",
    questions: "For any question about this legal notice or how the site works:",
  },
};

const SECTION_IDS = ["identification", "publication", "hebergement", "objet", "donnees", "propriete", "responsabilite", "droit", "contact"];

const rank = (id) => SECTION_IDS.indexOf(id);
const numberOf = (id) => String(rank(id) + 1).padStart(2, "0");

const Article = ({ id, children }) => (
  <li className="border-t border-line pt-8" id={id}>
    <p className="font-mono text-eyebrow text-subtle">{numberOf(id)}</p>
    <h2 className="mt-3 font-display text-xl font-semibold tracking-tight">{TEXT[useLang()].sections[id]}</h2>
    <div className="mt-5 max-w-prose">{children}</div>
  </li>
);

const SubHeading = ({ children }) => <h3 className="mt-9 font-mono text-eyebrow uppercase text-subtle">{children}</h3>;

const Items = ({ items }) => (
  <ul className="mt-4 grid gap-3 text-muted">
    {items.map((item) => (
      <li key={item} className="grid grid-cols-[1.5rem_1fr]">
        <span aria-hidden="true" className="font-mono text-subtle">
          -
        </span>
        <span>{item}</span>
      </li>
    ))}
  </ul>
);

const Facts = ({ rows }) => (
  <dl className="mt-5">
    {rows.map(({ term, value }) => (
      <div
        key={term}
        className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-line py-3 first:border-t"
      >
        <dt className="text-sm text-muted">{term}</dt>
        <dd className="text-sm font-medium">{value}</dd>
      </div>
    ))}
  </dl>
);

const Note = ({ label, children }) => (
  <aside className="mt-7 border border-line bg-surface p-5">
    <p className="font-mono text-eyebrow uppercase text-subtle">{label}</p>
    <p className="mt-2.5 text-muted">{children}</p>
  </aside>
);

export const LegalContent = ({ as: Tag = "main" }) => {
  const t = TEXT[useLang()];
  return (
    <Tag id="main">
      <header className="border-b border-line">
        <div className="mx-auto max-w-5xl px-6 pb-12 pt-32">
          <p className="eyebrow mb-6">{t.eyebrow}</p>
          <h1 className="text-title">{t.title}</h1>
          <p className="mt-5 max-w-prose text-lead text-muted">{t.lead}</p>
          {t.reference && <p className="mt-3 max-w-prose text-sm text-subtle">{t.reference}</p>}

          <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-2 border-t border-line pt-5 font-mono text-xs uppercase text-subtle">
            <div className="flex gap-2">
              <dt>{t.lastUpdate}</dt>
              <dd className="text-muted">{t.updated}</dd>
            </div>
            <div className="flex gap-2">
              <dt>{t.law}</dt>
              <dd className="text-muted">{t.lawValue}</dd>
            </div>
            <div className="flex gap-2">
              <dt>{t.articles}</dt>
              <dd className="text-muted">{SECTION_IDS.length}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-12 px-6 py-16 lg:grid-cols-[13rem_1fr] lg:gap-16">
        <nav aria-labelledby="sommaire" className="lg:sticky lg:top-28 lg:self-start">
          <p id="sommaire" className="font-mono text-eyebrow uppercase text-subtle">
            {t.toc}
          </p>
          <ol className="mt-4 border-t border-line">
            {SECTION_IDS.map((id) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="flex items-baseline gap-3 border-b border-line py-2.5 text-sm text-muted transition-colors hover:text-ink"
                >
                  <span className="font-mono text-eyebrow text-subtle">{numberOf(id)}</span>
                  <span>{t.sections[id]}</span>
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <ol className="grid gap-14">
          <Article id="identification">
            <Facts
              rows={[
                { term: t.siteName, value: "L'Ordre des Devs" },
                { term: t.siteUrl, value: "ordre-des-devs.org" },
                { term: t.legalForm, value: t.legalFormValue },
                { term: t.status, value: t.statusValue },
              ]}
            />
          </Article>

          <Article id="publication">
            <p className="text-muted">{t.publisher}</p>
            <Facts
              rows={[
                { term: t.directors, value: <span>Osiris &amp; Mizari</span> },
                { term: t.generalContact, value: <span className="font-mono">contact[at]ordre-des-devs.org</span> },
              ]}
            />
          </Article>

          <Article id="hebergement">
            <Facts
              rows={[
                { term: t.host, value: "LWS (Line Web Services)" },
                { term: "SIRET", value: <span className="font-mono">851 993 683 00024</span> },
                { term: t.contact, value: <span className="font-mono">support@lws.fr</span> },
                {
                  term: t.website,
                  value: (
                    <a
                      href="https://www.lws.fr"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-1.5 transition-colors hover:text-accent"
                    >
                      www.lws.fr
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </a>
                  ),
                },
              ]}
            />
          </Article>

          <Article id="objet">
            <p className="text-muted">{t.purpose}</p>
            <Items items={t.missions} />
            <Note label={t.important}>{t.noCommission}</Note>
          </Article>

          <Article id="donnees">
            <SubHeading>{t.noCollection}</SubHeading>
            <p className="mt-3 text-muted">{t.noCollectionText}</p>

            <SubHeading>{t.principles}</SubHeading>
            <Items items={t.principlesList} />

            <Note label={t.note}>{t.discord}</Note>
          </Article>

          <Article id="propriete">
            <p className="text-muted">{t.property}</p>

            <SubHeading>{t.allowed}</SubHeading>
            <Items items={t.allowedList} />

            <SubHeading>{t.forbidden}</SubHeading>
            <Items items={t.forbiddenList} />
          </Article>

          <Article id="responsabilite">
            <p className="text-muted">{t.accuracy}</p>

            <SubHeading>{t.matching}</SubHeading>
            <p className="mt-3 text-muted">{t.matchingText}</p>

            <SubHeading>{t.exclusions}</SubHeading>
            <Items items={t.exclusionsList} />
          </Article>

          <Article id="droit">
            <p className="text-muted">{t.governingLaw}</p>
            <p className="mt-6 border-t border-line pt-4 font-mono text-xs leading-relaxed text-subtle">{t.statutes}</p>
          </Article>

          <Article id="contact">
            <p className="text-muted">{t.questions}</p>
            <p className="mt-4 font-mono">contact[at]ordre-des-devs.org</p>
          </Article>
        </ol>
      </div>
    </Tag>
  );
};
