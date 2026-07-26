import type { QiLifeModule } from "../../app/moduleTypes";
import { TodayRoute } from "./routes";

export const todayModule: QiLifeModule = {
  key: "today",
  name: "Today",
  routes: [{ id: "today-index", path: "/today", Component: TodayRoute }],
};
