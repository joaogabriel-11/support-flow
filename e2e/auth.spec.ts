import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const hasAdminCredentials = Boolean(adminEmail && adminPassword);

async function loginAsAdmin(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(adminEmail!);
  await page.getByLabel("Senha").fill(adminPassword!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("redireciona visitante de rota privada para o login", async ({ page }) => {
  await page.goto("/admin");

  await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fadmin$/);
  await expect(
    page.getByRole("heading", { name: "Acesse sua conta" }),
  ).toBeVisible();
});

test("exibe erro para credenciais invalidas", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("E-mail").fill("inexistente@supportflow.com");
  await page.getByLabel("Senha").fill("senha-incorreta");
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page.getByRole("alert")).toContainText("E-mail ou senha");
});

test.describe("administrador autenticado", () => {
  test.skip(
    !hasAdminCredentials,
    "Defina E2E_ADMIN_EMAIL e E2E_ADMIN_PASSWORD para executar estes testes.",
  );

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("entra no sistema e acessa as areas permitidas", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Gestao de usuarios" }),
    ).toBeVisible();

    await page.goto("/fila");
    await expect(
      page.getByRole("heading", { name: "Fila de atendimento" }),
    ).toBeVisible();

    await page.goto("/chamados");
    await expect(page).not.toHaveURL(/\/acesso-negado$/);
  });

  test("e redirecionado ao tentar acessar area nao permitida", async ({
    page,
  }) => {
    await page.goto("/meus-atendimentos");

    await expect(page).toHaveURL(/\/acesso-negado$/);
    await expect(
      page.getByRole("heading", { name: "Acesso negado" }),
    ).toBeVisible();
  });

  test("cria, desativa e reativa um usuario", async ({ page }) => {
    const suffix = Date.now();
    const name = `Agente Admin E2E ${suffix}`;

    await page.getByLabel("Nome").fill(name);
    await page.getByLabel("E-mail").fill(`agente.admin.${suffix}@supportflow.com`);
    await page.getByLabel("Perfil").selectOption("AGENTE");
    await page.getByLabel("Senha inicial").fill("senha-e2e-segura");
    await page.getByRole("button", { name: "Criar usuario" }).click();

    await expect(page.getByRole("status")).toContainText(
      "Usuario criado com sucesso.",
    );
    const userRow = page.getByRole("row", { name: new RegExp(name) });
    await expect(userRow).toContainText("Agente");
    await expect(userRow).toContainText("Ativo");

    await userRow.getByRole("button", { name: "Desativar" }).click();
    await expect(userRow).toContainText("Inativo");
    await userRow.getByRole("button", { name: "Ativar" }).click();
    await expect(userRow).toContainText("Ativo");
  });
});
