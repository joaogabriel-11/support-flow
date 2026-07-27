type SetUserActiveDependencies<TUser> = {
  setActive: (input: { userId: string; isActive: boolean }) => Promise<TUser | null>;
};

export type SetUserActiveResult<TUser> =
  | { success: true; user: TUser }
  | { success: false; reason: "INVALID_INPUT" | "SELF_UPDATE" | "NOT_FOUND" };

export async function setUserActive<TUser>(
  input: { userId: string; adminId: string; isActive: boolean },
  dependencies: SetUserActiveDependencies<TUser>,
): Promise<SetUserActiveResult<TUser>> {
  const userId = input.userId.trim();
  const adminId = input.adminId.trim();

  if (!userId || !adminId) return { success: false, reason: "INVALID_INPUT" };
  if (userId === adminId && !input.isActive) {
    return { success: false, reason: "SELF_UPDATE" };
  }

  const user = await dependencies.setActive({
    userId,
    isActive: input.isActive,
  });

  return user
    ? { success: true, user }
    : { success: false, reason: "NOT_FOUND" };
}
