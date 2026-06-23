// src/features/qilife/components/HomeDashboard.tsx

import { entityRegistry } from "../data/entityRegistry";

interface HomeDashboardProps {
  onOpenEntity: (entityKey: string) => void;
}

const DASHBOARD_CARDS = [
  {
    entityKey: "task",
    title: "Today",
    desc: "Tasks, reminders, and open loops that need action today.",
  },
  {
    entityKey: "care_note",
    title: "Care",
    desc: "Notes, symptoms, medications, supplies, and follow-up for Gigi and you.",
  },
  {
    entityKey: "expense",
    title: "Finance",
    desc: "Expenses, receipts, household costs, and money tracking.",
  },
  {
    entityKey: "legal_matter",
    title: "Legal",
    desc: "Active matters, deadlines, evidence, filings, and event trails.",
  },
  {
    entityKey: "project",
    title: "Projects",
    desc: "Active builds, repairs, systems, and major life containers.",
  },
  {
    entityKey: "document",
    title: "Documents",
    desc: "Drive and QiNexus-linked files, records, and source documents.",
  },
  {
    entityKey: "person",
    title: "People",
    desc: "Everyone who matters: care contacts, providers, partners, family.",
  },
  {
    entityKey: "home_item",
    title: "Home",
    desc: "Items needed, repairs tracked, supplies ordered for the house.",
  },
] as const;

export function HomeDashboard({ onOpenEntity }: HomeDashboardProps) {
  return (
    <div className="qi-page">
      <div className="qi-hero">
        <div className="qi-eyebrow">Command Center</div>
        <h2>What needs your attention?</h2>
        <p>
          One entry point for daily action, care, finance, legal, files, home,
          and projects. No scattered apps.
        </p>
      </div>

      <div className="qi-card-grid">
        {DASHBOARD_CARDS.map((card) => {
          const entity = entityRegistry[card.entityKey];
          return (
            <button
              key={card.entityKey}
              type="button"
              className="qi-card"
              onClick={() => onOpenEntity(card.entityKey)}
            >
              <div className="qi-card-title">{card.title}</div>
              <div className="qi-card-desc">{card.desc}</div>
              <div className="qi-card-meta">{entity?.plural}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
