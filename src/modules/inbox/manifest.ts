import { lazy } from "react";
import type { QiLifeModule } from "../../app/moduleTypes";

const LazyInboxView = lazy(() =>
  import("./components/InboxView").then((m) => ({ default: m.InboxView })),
);

export const inboxModule: QiLifeModule = {
  key: "inbox",
  name: "Inbox",
  routes: [
    {
      id: "inbox-index",
      path: "/inbox",
      Component: LazyInboxView,
    },
  ],
  navigation: [
    {
      id: "nav-inbox",
      label: "Inbox",
      to: "/inbox",
      icon: "📥",
    },
  ],
  recordTypes: ["qibit"],
};
