import React from "react";
import { PeopleList } from "./components/PeopleList";
import { PersonDashboard } from "./components/PersonDashboard";
import { PersonEditor } from "./components/PersonEditor";

export interface PeopleRouteDefinition {
  path: string;
  element: React.ReactNode;
  label: string;
  exact?: boolean;
}

/**
 * Route declarations for the QiLife People CRM module.
 * Ready to mount into the shared router shell after rebasing with the Journal/router foundation branch.
 */
export const peopleRoutes: PeopleRouteDefinition[] = [
  {
    path: "/people",
    element: <PeopleList />,
    label: "People List",
    exact: true,
  },
  {
    path: "/people/new",
    element: <PersonEditorSeam />,
    label: "New Person",
  },
  {
    path: "/people/:id",
    element: <PersonDashboardWrapper />,
    label: "Person Profile",
  },
  {
    path: "/people/:id/edit",
    element: <PersonDashboardWrapper isEdit />,
    label: "Edit Person",
  },
  {
    path: "/people/:id/sync",
    element: <PersonDashboardWrapper defaultTab="sync" />,
    label: "Google Contact Sync",
  },
];

function PersonEditorSeam() {
  return <PersonListWrapperSeam />;
}

function PersonListWrapperSeam() {
  return <PeopleList />;
}

function PersonDashboardWrapper({ isEdit, defaultTab }: { isEdit?: boolean; defaultTab?: string }) {
  // Simple url helper seam for route integration
  const urlParams = typeof window !== "undefined" ? window.location.pathname.split("/") : [];
  const id = urlParams[2] || "person-101";
  return <PersonDashboard personId={id} />;
}
