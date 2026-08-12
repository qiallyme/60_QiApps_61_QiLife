import type { ComponentType } from "react";

export interface ModuleRoute {
  id: string;
  path: string;
  Component: ComponentType;
}

export interface NavigationItem {
  id: string;
  label: string;
  to: string;
  icon: string;
}

export interface CommandDefinition {
  id: string;
  label: string;
  to: string;
  keywords?: string[];
}

export interface DashboardWidgetDefinition {
  id: string;
  label: string;
  to: string;
  Component?: ComponentType<{ to: string }>;
}

export interface AgentCapabilityDefinition {
  name: string;
  description: string;
  consequential: boolean; // Requires human confirmation before execution
  parameters: Record<string, unknown>; // JSON Schema parameters
  handler: (args: Record<string, unknown>) => Promise<unknown>;
}

export interface QiLifeModule {
  key: string;
  name: string;
  routes: ModuleRoute[];
  navigation?: NavigationItem[];
  commands?: CommandDefinition[];
  widgets?: DashboardWidgetDefinition[];
  recordTypes?: string[];
  capabilities?: AgentCapabilityDefinition[];
}

export interface QiLifeModuleRegistry {
  modules: readonly QiLifeModule[];
  routes: readonly ModuleRoute[];
  navigation: readonly NavigationItem[];
  commands: readonly CommandDefinition[];
  widgets: readonly DashboardWidgetDefinition[];
  recordTypes: readonly string[];
  capabilities: readonly AgentCapabilityDefinition[];
}
