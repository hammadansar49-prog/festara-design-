import { describe, expect, it } from "vitest";
import { ACTIONS, can, type Action, type Role } from "./permissions";

// [action, admin, member, guest] straight from report Table 5.2
const TABLE: [Action, boolean, boolean, boolean][] = [
  ["event.viewBasic", true, true, true],
  ["event.viewFull", true, true, false],
  ["event.edit", true, false, false],
  ["event.delete", true, false, false],
  ["invite.create", true, false, false],
  ["member.manage", true, false, false],
  ["guest.add", true, true, false],
  ["expense.log", true, true, false],
  ["task.create", true, false, false],
  ["task.updateOwn", true, true, false],
  ["rsvp.confirmOwn", true, true, true],
  ["dashboard.view", true, false, false],
];

describe("can", () => {
  it("covers every action in the table exactly once", () => {
    expect(TABLE.map((r) => r[0]).sort()).toEqual([...ACTIONS].sort());
  });

  for (const [action, admin, member, guest] of TABLE) {
    it(`${action}: admin=${admin} member=${member} guest=${guest}`, () => {
      const roles: [Role, boolean][] = [["admin", admin], ["member", member], ["guest", guest]];
      for (const [role, expected] of roles) expect(can(role, action)).toBe(expected);
    });
  }

  it("denies everything without a role", () => {
    for (const action of ACTIONS) {
      expect(can(null, action)).toBe(false);
      expect(can(undefined, action)).toBe(false);
    }
  });
});
