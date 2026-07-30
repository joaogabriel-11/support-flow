import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const resendSend = vi.hoisted(() => vi.fn());

vi.mock("resend", () => ({
  Resend: class {
    emails = { send: resendSend };
  },
}));

import { sendEmail } from "./email";

const message = {
  to: ["agent@example.com", "agent@example.com", "other@example.com"],
  subject: "Novo chamado",
  text: "Existe um novo chamado.",
  html: "<p>Existe um novo chamado.</p>",
};

describe("sendEmail", () => {
  beforeEach(() => {
    resendSend.mockReset();
    process.env.RESEND_API_KEY = "re_test";
    process.env.EMAIL_FROM = "Support Flow <noreply@example.com>";
    resendSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.RESEND_API_KEY;
    delete process.env.EMAIL_FROM;
  });

  it("envia individualmente e remove destinatarios duplicados", async () => {
    await sendEmail(message);

    expect(resendSend).toHaveBeenCalledTimes(2);
    expect(resendSend).toHaveBeenCalledWith({
      from: "Support Flow <noreply@example.com>",
      to: "agent@example.com",
      subject: message.subject,
      text: message.text,
      html: message.html,
    });
  });

  it("nao tenta enviar sem configuracao", async () => {
    delete process.env.RESEND_API_KEY;
    const warning = vi.spyOn(console, "warn").mockImplementation(() => {});

    await sendEmail(message);

    expect(resendSend).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalled();
  });

  it("registra erro do provedor sem interromper o fluxo", async () => {
    resendSend.mockResolvedValue({
      data: null,
      error: { message: "Limite excedido" },
    });
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(sendEmail(message)).resolves.toBeUndefined();
    expect(error).toHaveBeenCalledTimes(2);
  });
});
