import { expect, test } from "@playwright/test";

const requesterEmail =
  process.env.E2E_REQUESTER_EMAIL ?? "solicitante.e2e@supportflow.com";
const requesterPassword = process.env.E2E_ADMIN_PASSWORD;
const adminEmail = process.env.E2E_ADMIN_EMAIL;

test.skip(
  !requesterPassword,
  "Defina E2E_ADMIN_PASSWORD para executar o teste de chamados.",
);

test("solicitante abre um chamado e visualiza no historico", async ({
  page,
}) => {
  const title = `Falha de rede E2E ${Date.now()}`;

  await page.goto("/login");
  await page.getByLabel("E-mail").fill(requesterEmail);
  await page.getByLabel("Senha").fill(requesterPassword!);
  await page.getByRole("button", { name: "Entrar" }).click();

  await expect(page).toHaveURL(/\/chamados$/);
  await page.getByLabel("Titulo").fill(title);
  await page.getByLabel("Categoria").selectOption({ index: 1 });
  await page.getByLabel("Prioridade").selectOption("ALTA");
  await page
    .getByLabel("Descricao")
    .fill("O equipamento perdeu o acesso a rede durante o teste E2E.");
  await page.getByRole("button", { name: "Abrir chamado" }).click();

  await expect(page.getByRole("status")).toContainText(
    "Chamado aberto com sucesso.",
  );
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(adminEmail!);
  await page.getByLabel("Senha").fill(requesterPassword!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/fila");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});
