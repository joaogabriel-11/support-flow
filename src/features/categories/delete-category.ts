type DeleteCategoryDependencies<TCategory> = {
  deleteSafely: (id: string) => Promise<
    | { success: true; category: TCategory }
    | {
        success: false;
        reason: "NOT_FOUND" | "IN_USE" | "LAST_ACTIVE";
      }
  >;
};

export async function deleteCategory<TCategory>(
  idInput: string,
  dependencies: DeleteCategoryDependencies<TCategory>,
) {
  const id = idInput.trim();
  if (!id) return { success: false as const, reason: "INVALID_INPUT" as const };
  return dependencies.deleteSafely(id);
}
