type ChangeCategoryStatusDependencies<TCategory> = {
  changeStatus: (input: {
    id: string;
    isActive: boolean;
  }) => Promise<
    | { success: true; category: TCategory }
    | { success: false; reason: "NOT_FOUND" | "LAST_ACTIVE" }
  >;
};

export async function changeCategoryStatus<TCategory>(
  input: { id: string; isActive: boolean },
  dependencies: ChangeCategoryStatusDependencies<TCategory>,
) {
  const id = input.id.trim();
  if (!id) return { success: false as const, reason: "INVALID_INPUT" as const };
  return dependencies.changeStatus({ id, isActive: input.isActive });
}
