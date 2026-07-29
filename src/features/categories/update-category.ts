import { validateCategoryName } from "./category-name";

type UpdateCategoryDependencies<TCategory> = {
  nameExistsForAnother: (input: { id: string; name: string }) => Promise<boolean>;
  updateCategory: (input: { id: string; name: string }) => Promise<TCategory | null>;
};

export type UpdateCategoryResult<TCategory> =
  | { success: true; category: TCategory }
  | {
      success: false;
      reason: "INVALID_INPUT" | "DUPLICATE" | "NOT_FOUND";
      error: string;
    };

export async function updateCategory<TCategory>(
  input: { id: string; name: string },
  dependencies: UpdateCategoryDependencies<TCategory>,
): Promise<UpdateCategoryResult<TCategory>> {
  const id = input.id.trim();
  const validation = validateCategoryName(input.name);
  if (!id || !validation.success) {
    return {
      success: false,
      reason: "INVALID_INPUT",
      error: validation.success ? "Categoria invalida." : validation.error,
    };
  }
  if (
    await dependencies.nameExistsForAnother({
      id,
      name: validation.name,
    })
  ) {
    return {
      success: false,
      reason: "DUPLICATE",
      error: "Ja existe uma categoria com este nome.",
    };
  }

  const category = await dependencies.updateCategory({
    id,
    name: validation.name,
  });
  return category
    ? { success: true, category }
    : {
        success: false,
        reason: "NOT_FOUND",
        error: "Categoria nao encontrada.",
      };
}
