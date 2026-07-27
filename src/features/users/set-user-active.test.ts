import { describe, expect, it, vi } from "vitest";

import { setUserActive } from "./set-user-active";

describe("setUserActive", () => {
  it("altera a situacao de outro usuario", async () => {
    const setActive = vi.fn().mockResolvedValue({ id: "user-1" });

    const result = await setUserActive(
      { userId: "user-1", adminId: "admin-1", isActive: false },
      { setActive },
    );

    expect(result.success).toBe(true);
    expect(setActive).toHaveBeenCalledWith({
      userId: "user-1",
      isActive: false,
    });
  });

  it("impede que o administrador desative a propria conta", async () => {
    const setActive = vi.fn();

    const result = await setUserActive(
      { userId: "admin-1", adminId: "admin-1", isActive: false },
      { setActive },
    );

    expect(result).toEqual({ success: false, reason: "SELF_UPDATE" });
    expect(setActive).not.toHaveBeenCalled();
  });
});
