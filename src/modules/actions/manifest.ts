import type { QiLifeModule } from "../../app/moduleTypes";
import { ActionDetailRoute, ActionNewRoute, ActionsIndexRoute } from "./routes";

export const actionsModule: QiLifeModule = {
  key: "actions",
  name: "Actions",
  routes: [
    { id: "actions-index", path: "/actions", Component: ActionsIndexRoute },
    { id: "actions-new", path: "/actions/new", Component: ActionNewRoute },
    { id: "actions-detail", path: "/actions/:id", Component: ActionDetailRoute },
  ],
  navigation: [{ id: "actions-nav", label: "Actions", to: "/actions", icon: "✓" }],
  commands: [{ id: "actions-new", label: "New Action", to: "/actions/new", keywords: ["task", "action"] }],
  recordTypes: ["task"],
};
