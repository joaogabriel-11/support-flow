import { validateCategoryName } from "./category-name";

type CreateCategoryDependencies<TCategory> = {
  nameExists: (name: string) => Promise<boolean>;
  persistCategory: (name: string) => Promise<TCategory>;
};

export type CreateCategoryResult<TCategory> =
  | { success: true; category: TCategory }
  | { success: false; reason: "INVALID_NAME" | "DUPLICATE"; error: string };

export async function createCategory<TCategory>(
  name: string,
  dependencies: CreateCategoryDependencies<TCategory>,
): Promise<CreateCategoryResult<TCategory>> {
  const validation = validateCategoryName(name);
  if (!validation.success) {
    return {
      success: false,
      reason: "INVALID_NAME",
      error: validation.error,
    };
  }
  if (await dependencies.nameExists(validation.name)) {
    return {
      success: false,
      reason: "DUPLICATE",
      error: "Ja existe uma categoria com este nome.",
    };
  }

  const category = await dependencies.persistCategory(validation.name);
  return { success: true, category };
}
