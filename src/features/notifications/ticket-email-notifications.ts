import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function ticketUrl(ticketId: string) {
  const baseUrl = process.env.APP_URL ?? process.env.AUTH_URL;
  return baseUrl
    ? `${baseUrl.replace(/\/$/, "")}/chamados/${ticketId}`
    : undefined;
}

async function deliver(input: {
  recipients: string[];
  subject: string;
  heading: string;
  message: string;
  ticket: { id: string; number: number; title: string };
}) {
  if (input.recipients.length === 0) return;

  const url = ticketUrl(input.ticket.id);
  const reference = `Chamado #${input.ticket.number}: ${input.ticket.title}`;
  const text = [
    input.heading,
    "",
    input.message,
    reference,
    url ? `Acesse: ${url}` : undefined,
  ]
    .filter(Boolean)
    .join("\n");
  const link = url
    ? `<p><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 18px;border-radius:8px;background:#0f766e;color:#fff;text-decoration:none;font-weight:700">Ver chamado</a></p>`
    : "";

  await sendEmail({
    to: input.recipients,
    subject: input.subject,
    text,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;color:#172033">
        <h1 style="font-size:24px">${escapeHtml(input.heading)}</h1>
        <p>${escapeHtml(input.message)}</p>
        <p><strong>${escapeHtml(reference)}</strong></p>
        ${link}
        <p style="margin-top:32px;color:#64748b;font-size:13px">Support Flow</p>
      </div>
    `,
  });
}

async function safelyNotify(notification: () => Promise<void>) {
  try {
    await notification();
  } catch (error) {
    console.error("Falha inesperada ao preparar notificacao por e-mail.", error);
  }
}

const ticketSelection = {
  id: true,
  number: true,
  title: true,
  requester: {
    select: { email: true, isActive: true },
  },
} as const;

export function notifyTicketCreated(ticketId: string) {
  return safelyNotify(async () => {
    const [ticket, agents] = await Promise.all([
      prisma.ticket.findUnique({
        where: { id: ticketId },
        select: ticketSelection,
      }),
      prisma.user.findMany({
        where: { role: "AGENTE", isActive: true },
        select: { email: true },
      }),
    ]);
    if (!ticket) return;

    await deliver({
      recipients: agents.map((agent) => agent.email),
      subject: `Novo chamado #${ticket.number}`,
      heading: "Novo chamado na fila",
      message: "Um novo chamado esta disponivel para atendimento.",
      ticket,
    });
  });
}

export function notifyTicketResolved(ticketId: string) {
  return safelyNotify(async () => {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: ticketSelection,
    });
    if (!ticket || !ticket.requester.isActive) return;

    await deliver({
      recipients: [ticket.requester.email],
      subject: `Chamado #${ticket.number} resolvido`,
      heading: "Chamado resolvido",
      message: "O atendimento foi marcado como concluido.",
      ticket,
    });
  });
}
