# QiLife: Personal LifeDesk

QiLife is Cody's private **Personal LifeDesk** – a single-agent helpdesk for life, turning chaos into structured, actionable, and retrievable **QiBits**.

---

## 📊 Repository Status
*   **Stage**: Documentation & Build-Spec Stage
*   **Application Code**: **No app code exists yet.**
*   **Next Step**: Documentation validation (Codex review pass), followed by the **v1 Spine build**.

---

## 📁 Documentation Architecture
The documentation is organized systematically under the `docs/` and `planning/` directories:

*   **`docs/00_overview/`** – High-level product canvas, doctrine, and glossary.
*   **`docs/10_product/`** – Master build specifications, QiBit lifecycle, and user flows.
*   **`docs/20_architecture/`** – App shell architecture, knowledge models, and documentation syncing.
*   **`docs/30_data_model/`** – Data schemas, seed data specifications, and the database stability strategy (ULIDs, money representations, WAL settings).
*   **`docs/40_ui_flows/`** – Master screen designs and navigation paths.
*   **`docs/50_modules/`** – Individual specifications for the 11 app modules (`actions`, `ask_qilife`, `calendar`, `documents`, `inbox`, `knowledge`, `money`, `people`, `qibits`, `threads`, `timeline`).
*   **`docs/60_ai_layer/`** – AI service contracts and the human-in-the-loop review workflow.
*   **`docs/70_deployment/`** – Setup instructions for local development, dockerizing, and QiServer deployment.
*   **`docs/80_prompts/`** – AI research, build, and documentation consistency prompts.
*   **`docs/90_decisions/`** – Architectural Decision Records (ADRs 0001 - 0005).
*   **`planning/`** – Development build checklists, validation checklists, and open design questions.
*   **`archive/review_packet_original/`** – The original unedited review packet materials preserved for reference.

---

## 🚀 Execution Path
1.  **Documentation Validation**: Execute the `/api/review` prompt to check documentation integrity.
2.  **Spine Build**: Implement the FastAPI backend + React Vite frontend scaffolding with SQLite and WAL mode enabled.
3.  **Core Seeding**: Load seed dataset including Cody, Zai, and current active sprint threads.
