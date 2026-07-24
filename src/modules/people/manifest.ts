/**
 * QiLife People Module Local Manifest Seam
 *
 * Designed for immediate compilation and seamless replacement with the shared `QiLifeModule`
 * type once the router & module registry foundation branch is rebased.
 */

export interface TemporaryQiLifeModuleManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  icon: string;
  routes: string[];
  widgets: string[];
  entityKeys: string[];
}

export const peopleModuleManifest: TemporaryQiLifeModuleManifest = {
  id: "people",
  name: "People / Personal CRM",
  version: "0.1.0",
  description: "Personal contact management, relationship cadence tracking, interaction timeline, and evidence-backed insights.",
  icon: "👥",
  routes: ["/people", "/people/new", "/people/:id", "/people/:id/edit", "/people/:id/sync"],
  widgets: ["RecentContactsWidget", "FollowUpsWidget", "RelationshipPulseWidget"],
  entityKeys: ["person"],
};
