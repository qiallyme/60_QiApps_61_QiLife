import type { QiLifeModule } from "../../app/moduleTypes";
import {
  SoftwareDetailRoute,
  SoftwareEditRoute,
  SoftwareHistoryRoute,
  SoftwareIndexRoute,
  SoftwareNewRoute,
} from "./routes";

export const softwareModule: QiLifeModule = {
  key: "software",
  name: "Software & Services",
  routes: [
    { id: "software.index", path: "/software", Component: SoftwareIndexRoute },
    { id: "software.new", path: "/software/new", Component: SoftwareNewRoute },
    { id: "software.detail", path: "/software/:id", Component: SoftwareDetailRoute },
    { id: "software.edit", path: "/software/:id/edit", Component: SoftwareEditRoute },
    { id: "software.history", path: "/software/:id/history", Component: SoftwareHistoryRoute },
  ],
  navigation: [{ id: "software", label: "Software & Services", to: "/software", icon: "◫" }],
  commands: [{ id: "software.new", label: "Add Software & Service", to: "/software/new", keywords: ["account", "subscription", "provider"] }],
  recordTypes: ["object", "object_identifier", "object_relationship", "object_record", "secret_reference"],
};
