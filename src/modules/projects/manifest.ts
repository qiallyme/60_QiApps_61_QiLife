import type { QiLifeModule } from "../../app/moduleTypes";
import { ProjectDetailRoute, ProjectEditRoute, ProjectNewRoute, ProjectsIndexRoute } from "./routes";

export const projectsModule: QiLifeModule = {
  key: "projects", name: "Projects",
  routes: [
    { id: "projects-index", path: "/projects", Component: ProjectsIndexRoute },
    { id: "projects-new", path: "/projects/new", Component: ProjectNewRoute },
    { id: "projects-detail", path: "/projects/:id", Component: ProjectDetailRoute },
    { id: "projects-edit", path: "/projects/:id/edit", Component: ProjectEditRoute },
  ],
  navigation: [{ id: "projects-nav", label: "Projects", to: "/projects", icon: "◇" }],
  commands: [{ id: "projects-new", label: "New Project", to: "/projects/new", keywords: ["project", "outcome"] }],
  recordTypes: ["project"],
};
