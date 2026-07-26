import type { QiLifeModule } from "../../app/moduleTypes";
import { ProjectDetailRoute, ProjectDocumentLinkRoute, ProjectEditRoute, ProjectEventNewRoute, ProjectNewRoute, ProjectPersonLinkRoute, ProjectsIndexRoute } from "./routes";

export const projectsModule: QiLifeModule = {
  key: "projects", name: "Projects",
  routes: [
    { id: "projects-index", path: "/projects", Component: ProjectsIndexRoute },
    { id: "projects-new", path: "/projects/new", Component: ProjectNewRoute },
    { id: "projects-detail", path: "/projects/:id", Component: ProjectDetailRoute },
    { id: "projects-edit", path: "/projects/:id/edit", Component: ProjectEditRoute },
    { id: "projects-link-person", path: "/projects/:id/link-person", Component: ProjectPersonLinkRoute },
    { id: "projects-link-document", path: "/projects/:id/link-document", Component: ProjectDocumentLinkRoute },
    { id: "projects-event-new", path: "/events/new", Component: ProjectEventNewRoute },
  ],
  navigation: [{ id: "projects-nav", label: "Projects", to: "/projects", icon: "◇" }],
  commands: [{ id: "projects-new", label: "New Project", to: "/projects/new", keywords: ["project", "outcome"] }],
  recordTypes: ["project"],
};
