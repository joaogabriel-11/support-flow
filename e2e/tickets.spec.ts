import { expect, test } from "@playwright/test";

const requesterEmail =
  process.env.E2E_REQUESTER_EMAIL ?? "solicitante.e2e@supportflow.com";
const requesterPassword = process.env.E2E_ADMIN_PASSWORD;
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const agentEmail =
  process.env.E2E_AGENT_EMAIL ?? "agente.e2e@supportflow.com";

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
  await page
    .getByRole("article", { name: title })
    .getByRole("link", { name: "Ver detalhes" })
    .click();
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Historico" })).toBeVisible();
  await expect(page.getByText("Chamado criado")).toBeVisible();
  const ticketDetailsUrl = page.url();
  const requesterMessage = `Mensagem publica do solicitante ${Date.now()}`;
  await page.getByLabel("Mensagem").fill(requesterMessage);
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Mensagem enviada com sucesso.",
  );
  await expect(page.getByText(requesterMessage)).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(adminEmail!);
  await page.getByLabel("Senha").fill(requesterPassword!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/fila");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(agentEmail);
  await page.getByLabel("Senha").fill(requesterPassword!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page).toHaveURL(/\/fila$/);

  const ticketInQueue = page.getByRole("article", { name: title });
  await ticketInQueue.getByRole("button", { name: "Assumir chamado" }).click();
  await expect(ticketInQueue).toBeHidden();

  await page.goto("/meus-atendimentos");
  const assignedTicket = page.getByRole("article", { name: title });
  await expect(assignedTicket.getByRole("heading", { name: title })).toBeVisible();
  await assignedTicket.getByRole("link", { name: "Ver detalhes" }).click();
  await expect(page.getByText("Chamado assumido")).toBeVisible();
  await expect(page.getByText(requesterMessage)).toBeVisible();
  const agentMessage = `Resposta publica do agente ${Date.now()}`;
  await page.getByLabel("Visibilidade").selectOption("PUBLICO");
  await page.getByLabel("Mensagem").fill(agentMessage);
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  await expect(page.getByText(agentMessage)).toBeVisible();

  const internalNote = `Nota interna do agente ${Date.now()}`;
  await page.getByLabel("Visibilidade").selectOption("INTERNO");
  await page.getByLabel("Mensagem").fill(internalNote);
  await page.getByRole("button", { name: "Enviar mensagem" }).click();
  const internalNoteCard = page.getByRole("article").filter({
    hasText: internalNote,
  });
  await expect(internalNoteCard).toBeVisible();
  await expect(internalNoteCard).toContainText("Nota interna");
  await page.getByRole("link", { name: "Voltar para a listagem" }).click();
  await expect(page).toHaveURL(/\/meus-atendimentos$/);

  const resolvedDetails = page.locator("details").filter({
    hasText: "Resolvidos",
  });
  const showResolvedButton = resolvedDetails.locator("summary");
  const showResolvedLabel = showResolvedButton.getByText(
    /Mostrar resolvidos/,
  );
  const resolvedCountBefore = Number(
    (await showResolvedLabel.textContent())?.match(/\d+/)?.[0] ?? 0,
  );

  await assignedTicket
    .getByRole("button", { name: "Marcar como concluido" })
    .click();

  await expect(assignedTicket).toBeHidden();
  await expect(showResolvedLabel).toHaveText(
    `Mostrar resolvidos (${resolvedCountBefore + 1})`,
  );
  await showResolvedButton.click();
  await expect(resolvedDetails).toHaveAttribute("open", "");
  await expect(assignedTicket).toContainText("Resolvido");
  await expect(
    assignedTicket.getByRole("button", { name: "Marcar como concluido" }),
  ).toHaveCount(0);
  await showResolvedButton.click();
  await expect(resolvedDetails).not.toHaveAttribute("open", "");
  await expect(assignedTicket).toBeHidden();

  await page.context().clearCookies();
  await page.goto("/login");
  await page.getByLabel("E-mail").fill(requesterEmail);
  await page.getByLabel("Senha").fill(requesterPassword!);
  await page.getByRole("button", { name: "Entrar" }).click();
  await page.goto(ticketDetailsUrl);
  await expect(page.getByText(agentMessage)).toBeVisible();
  await expect(page.getByText(internalNote)).toHaveCount(0);
});
