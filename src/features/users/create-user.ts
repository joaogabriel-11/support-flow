export const USER_ROLES = ["SOLICITANTE", "AGENTE", "ADMIN"] as const;

export type UserRole = (typeof USER_ROLES)[number];

type CreateUserInput = {
  name: string;
  email: string;
  password: string;
  role: string;
};

type CreateUserDependencies<TUser> = {
  emailExists: (email: string) => Promise<boolean>;
  hashPassword: (password: string) => Promise<string>;
  persistUser: (input: {
    name: string;
    email: string;
    passwordHash: string;
    role: UserRole;
  }) => Promise<TUser>;
};

type CreateUserErrors = Partial<
  Record<"name" | "email" | "password" | "role", string>
>;

export type CreateUserResult<TUser> =
  | { success: true; user: TUser }
  | { success: false; errors: CreateUserErrors };

export async function createUser<TUser>(
  input: CreateUserInput,
  dependencies: CreateUserDependencies<TUser>,
): Promise<CreateUserResult<TUser>> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const role = input.role.trim().toUpperCase();
  const errors: CreateUserErrors = {};

  if (name.length < 2 || name.length > 100) {
    errors.name = "Informe um nome entre 2 e 100 caracteres.";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Informe um e-mail valido.";
  }
  if (input.password.length < 8 || input.password.length > 72) {
    errors.password = "A senha deve ter entre 8 e 72 caracteres.";
  }
  if (!USER_ROLES.includes(role as UserRole)) {
    errors.role = "Selecione um perfil valido.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }
  if (await dependencies.emailExists(email)) {
    return {
      success: false,
      errors: { email: "Ja existe um usuario com este e-mail." },
    };
  }

  const passwordHash = await dependencies.hashPassword(input.password);
  const user = await dependencies.persistUser({
    name,
    email,
    passwordHash,
    role: role as UserRole,
  });

  return { success: true, user };
}
