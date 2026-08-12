import { describe, expect, it, vi } from "vitest";
import { CapabilityEngine } from "./capabilityEngine";
import type { AgentCapabilityDefinition } from "../../../app/moduleTypes";

describe("CapabilityEngine (Dual-Surface Contract)", () => {
  it("executes non-consequential capabilities without confirmation", async () => {
    const handler = vi.fn().mockResolvedValue({ id: "bit_123" });
    const capability: AgentCapabilityDefinition = {
      name: "search_memory",
      description: "Search Open Brain memory",
      consequential: false,
      parameters: {},
      handler,
    };

    const engine = new CapabilityEngine([capability]);
    const res = await engine.executeCapability("search_memory", { query: "test" });

    expect(res.success).toBe(true);
    expect(res.output).toEqual({ id: "bit_123" });
    expect(handler).toHaveBeenCalledWith({ query: "test" });
  });

  it("blocks consequential capabilities until human confirmation is provided", async () => {
    const handler = vi.fn().mockResolvedValue({ status: "sent" });
    const capability: AgentCapabilityDefinition = {
      name: "send_external_email",
      description: "Send an email to a contact",
      consequential: true,
      parameters: {},
      handler,
    };

    const engine = new CapabilityEngine([capability]);
    
    // First attempt without bypass confirmation
    const res1 = await engine.executeCapability("send_external_email", { to: "user@example.com" });
    expect(res1.success).toBe(false);
    expect(res1.requiresConfirmation).toBe(true);
    expect(handler).not.toHaveBeenCalled();

    // Second attempt with human authorization (bypassConfirmation = true)
    const res2 = await engine.executeCapability("send_external_email", { to: "user@example.com" }, true);
    expect(res2.success).toBe(true);
    expect(res2.output).toEqual({ status: "sent" });
    expect(handler).toHaveBeenCalledWith({ to: "user@example.com" });
  });
});
