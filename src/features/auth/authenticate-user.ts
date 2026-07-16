export type UserRole = "SOLICITANTE" | "AGENTE" | "ADMIN";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
};

type AuthenticateUserDependencies = {
  findUserByEmail: (email: string) => Promise<AuthUser | null>;
  verifyPassword: (
    plainPassword: string,
    passwordHash: string,
  ) => Promise<boolean>;
};

type AuthenticateUserInput = {
  email: string;
  password: string;
};

export async function authenticateUser(
  input: AuthenticateUserInput,
  dependencies: AuthenticateUserDependencies,
) {
  const email = input.email.trim().toLowerCase();

  if (!email || !input.password) return null;

  const user = await dependencies.findUserByEmail(email);

  if (!user?.isActive) return null;

  const passwordMatches = await dependencies.verifyPassword(
    input.password,
    user.passwordHash,
  );

  if (!passwordMatches) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
}
