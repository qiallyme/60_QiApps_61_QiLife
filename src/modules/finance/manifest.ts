import type { QiLifeModule } from "../../app/moduleTypes";
import { QiFiEmbeddedView } from "./components/QiFiEmbeddedView";

export const financeModule: QiLifeModule = {
  key: "finance",
  name: "Finance",
  routes: [
    {
      id: "finance-index",
      path: "/finance",
      Component: QiFiEmbeddedView,
    },
    {
      id: "finance-ledger",
      path: "/finance/ledger",
      Component: QiFiEmbeddedView,
    },
    {
      id: "finance-receipts",
      path: "/finance/receipts",
      Component: QiFiEmbeddedView,
    },
    {
      id: "finance-accounts",
      path: "/finance/accounts",
      Component: QiFiEmbeddedView,
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
