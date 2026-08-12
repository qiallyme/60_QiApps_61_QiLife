import { lazy } from "react";
import type { QiLifeModule } from "../../app/moduleTypes";

const LazyQiFiEmbeddedView = lazy(() =>
  import("./components/QiFiEmbeddedView").then((m) => ({ default: m.QiFiEmbeddedView })),
);

export const financeModule: QiLifeModule = {
  key: "finance",
  name: "Finance",
  routes: [
    {
      id: "finance-index",
      path: "/finance",
      Component: LazyQiFiEmbeddedView,
    },
    {
      id: "finance-ledger",
      path: "/finance/ledger",
      Component: LazyQiFiEmbeddedView,
    },
    {
      id: "finance-receipts",
      path: "/finance/receipts",
      Component: LazyQiFiEmbeddedView,
    },
    {
      id: "finance-accounts",
      path: "/finance/accounts",
      Component: LazyQiFiEmbeddedView,
    },
  ],
  navigation: [
    {
      id: "nav-finance",
      label: "Finance",
      to: "/finance",
      icon: "💳",
    },
  ],
  recordTypes: ["expense"],
};
