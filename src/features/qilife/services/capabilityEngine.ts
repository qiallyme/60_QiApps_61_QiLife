import type { AgentCapabilityDefinition } from "../../../app/moduleTypes";

export interface CapabilityExecutionResult {
  success: boolean;
  requiresConfirmation?: boolean;
  confirmationDetails?: {
    capabilityName: string;
    consequential: boolean;
    reason: string;
    proposedArguments: Record<string, unknown>;
  };
  output?: unknown;
  error?: string;
}

/**
 * Dual-Surface Capability Execution Engine (ADR 0007)
 * Guarantees that AI agent actions run through identical capability logic and authorization boundaries as UI form submissions.
 */
export class CapabilityEngine {
  private capabilities: Map<string, AgentCapabilityDefinition> = new Map();

  constructor(initialCapabilities: AgentCapabilityDefinition[] = []) {
    initialCapabilities.forEach((cap) => this.capabilities.set(cap.name, cap));
  }

  public registerCapability(capability: AgentCapabilityDefinition) {
    this.capabilities.set(capability.name, capability);
  }

  public getCapability(name: string): AgentCapabilityDefinition | undefined {
    return this.capabilities.get(name);
  }

  public listCapabilities(): AgentCapabilityDefinition[] {
    return Array.from(this.capabilities.values());
  }

  /**
   * Executes a capability with automatic consequential action checking
   */
  public async executeCapability(
    name: string,
    args: Record<string, unknown>,
    bypassConfirmation = false,
  ): Promise<CapabilityExecutionResult> {
    const cap = this.capabilities.get(name);
    if (!cap) {
      return {
        success: false,
        error: `Capability "${name}" is not registered in module registry.`,
      };
    }

    // Require human confirmation for consequential side-effects unless explicitly authorized
    if (cap.consequential && !bypassConfirmation) {
      return {
        success: false,
        requiresConfirmation: true,
        confirmationDetails: {
          capabilityName: name,
          consequential: true,
          reason: `Action "${name}" modifies external systems or persistent state and requires human authorization.`,
          proposedArguments: args,
        },
      };
    }

    try {
      const output = await cap.handler(args);
      return {
        success: true,
        output,
      };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Capability execution failed.",
      };
    }
  }
}
