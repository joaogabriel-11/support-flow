export function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export function validateCategoryName(name: string) {
  const normalizedName = normalizeCategoryName(name);

  if (normalizedName.length < 2 || normalizedName.length > 60) {
    return {
      success: false as const,
      error: "O nome deve ter entre 2 e 60 caracteres.",
    };
  }

  return { success: true as const, name: normalizedName };
}
