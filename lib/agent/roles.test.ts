import { describe, it, expect } from "vitest";
import { ROLES, role, reasoningRoles } from "./roles";

describe("agent roster — no two agents share a job", () => {
  it("every role owns a unique artifact", () => {
    const owned = ROLES.map((r) => r.owns);
    expect(new Set(owned).size).toBe(owned.length);
  });

  it("every role performs a unique task", () => {
    const tasks = ROLES.map((r) => r.task);
    expect(new Set(tasks).size).toBe(tasks.length);
  });

  it("every role has a unique key", () => {
    const keys = ROLES.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("only reasoning roles carry a model", () => {
    for (const r of ROLES) {
      if (r.kind === "reasoning") expect(r.model).toBeTruthy();
      else expect(r.model).toBeUndefined();
    }
  });

  it("role() looks up and rejects unknown keys", () => {
    expect(role("critic").kind).toBe("reasoning");
    expect(() => role("nope")).toThrow();
  });

  it("has 4 reasoning roles and 7 services", () => {
    expect(reasoningRoles()).toHaveLength(4);
    expect(ROLES.filter((r) => r.kind === "service")).toHaveLength(7);
  });
});
