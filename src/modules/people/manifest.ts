import type { QiLifeModule } from "../../app/moduleTypes";
import {
  PeopleDetailRoute,
  PeopleEditRoute,
  PeopleIndexRoute,
  PeopleNewRoute,
  PeopleSyncRoute,
} from "./routes";
import { FollowUpsWidget } from "./widgets/FollowUpsWidget";
import { RecentContactsWidget } from "./widgets/RecentContactsWidget";
import { RelationshipPulseWidget } from "./widgets/RelationshipPulseWidget";

export const peopleModule: QiLifeModule = {
  key: "people",
  name: "People",
  routes: [
    { id: "people-index", path: "/people", Component: PeopleIndexRoute },
    { id: "people-new", path: "/people/new", Component: PeopleNewRoute },
    { id: "people-detail", path: "/people/:id", Component: PeopleDetailRoute },
    { id: "people-edit", path: "/people/:id/edit", Component: PeopleEditRoute },
    { id: "people-sync", path: "/people/:id/sync", Component: PeopleSyncRoute },
  ],
  navigation: [{ id: "people-nav", label: "People", to: "/people", icon: "◎" }],
  commands: [{
    id: "people-new",
    label: "Add person",
    to: "/people/new",
    keywords: ["people", "contact", "crm"],
  }],
  widgets: [
    { id: "people-recent", label: "Recent contacts", to: "/people", Component: RecentContactsWidget },
    { id: "people-followups", label: "People follow-ups", to: "/people", Component: FollowUpsWidget },
    { id: "people-pulse", label: "Relationship pulse", to: "/people", Component: RelationshipPulseWidget },
  ],
  recordTypes: ["person", "interaction"],
};
