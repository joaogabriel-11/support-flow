import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const requesterEmail =
  process.env.E2E_REQUESTER_EMAIL ?? "solicitante.e2e@supportflow.com";
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
  test.describe.configure({ mode: "serial" });

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
    test.setTimeout(60_000);
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

  test("gerencia o ciclo completo de uma categoria", async ({ page }) => {
    test.setTimeout(60_000);
    const suffix = Date.now();
    const initialName = `Categoria E2E ${suffix}`;
    const renamedCategory = `Categoria Renomeada E2E ${suffix}`;

    await page.goto("/admin/categorias");
    await page.getByLabel("Nome da categoria").fill(initialName);
    await page.getByRole("button", { name: "Criar categoria" }).click();
    await expect(page.getByRole("status")).toContainText(
      "Categoria criada com sucesso.",
    );

    await page.getByLabel("Nome da categoria").fill(initialName.toLowerCase());
    await page.getByRole("button", { name: "Criar categoria" }).click();
    await expect(page.getByText("Ja existe uma categoria com este nome.")).toBeVisible();

    const initialCard = page.getByRole("article").filter({
      hasText: initialName,
    });
    await initialCard.getByLabel("Nome").fill(renamedCategory);
    await initialCard.getByRole("button", { name: "Salvar nome" }).click();

    const categoryCard = page.getByRole("article").filter({
      hasText: renamedCategory,
    });
    await expect(categoryCard).toBeVisible();
    await categoryCard.getByRole("button", { name: "Desativar" }).click();
    await expect(categoryCard.getByText("Inativa", { exact: true })).toBeVisible();

    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("E-mail").fill(requesterEmail);
    await page.getByLabel("Senha").fill(adminPassword!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/chamados$/);
    await expect(
      page.getByLabel("Categoria").getByRole("option", {
        name: renamedCategory,
      }),
    ).toHaveCount(0);

    await page.context().clearCookies();
    await loginAsAdmin(page);
    await page.goto("/admin/categorias");
    const inactiveCard = page.getByRole("article").filter({
      hasText: renamedCategory,
    });
    await inactiveCard.getByRole("button", { name: "Ativar" }).click();
    await expect(inactiveCard.getByText("Ativa", { exact: true })).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await inactiveCard
      .getByRole("button", { name: "Excluir permanentemente" })
      .click();
    await expect(
      page.getByRole("article").filter({ hasText: renamedCategory }),
    ).toHaveCount(0);
  });
});
