import type { QiLifeModule } from "../../app/moduleTypes";
import {
  JournalEntryRoute,
  JournalIndexRoute,
  JournalNewRoute,
} from "./routes";
import { JournalWidget } from "./widgets/JournalWidget";

export const journalModule: QiLifeModule = {
  key: "journal",
  name: "Journal",
  routes: [
    { id: "journal-index", path: "/journal", Component: JournalIndexRoute },
    { id: "journal-new", path: "/journal/new", Component: JournalNewRoute },
    { id: "journal-entry", path: "/journal/:id", Component: JournalEntryRoute },
  ],
  navigation: [{ id: "journal-nav", label: "Journal", to: "/journal", icon: "✎" }],
  commands: [{
    id: "journal-new",
    label: "Quick journal",
    to: "/journal/new",
    keywords: ["journal", "write", "reflection"],
  }],
  widgets: [{
    id: "journal-widget",
    label: "Journal",
    to: "/journal",
    Component: JournalWidget,
  }],
  recordTypes: ["journal_entry"],
};
