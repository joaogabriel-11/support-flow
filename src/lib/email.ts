import { Resend } from "resend";

type EmailMessage = {
  to: string[];
  subject: string;
  text: string;
  html: string;
};

function emailConfiguration() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    console.warn(
      "E-mail nao enviado: configure RESEND_API_KEY e EMAIL_FROM.",
    );
    return null;
  }

  return { resend: new Resend(apiKey), from };
}

export async function sendEmail(message: EmailMessage) {
  const configuration = emailConfiguration();
  if (!configuration || message.to.length === 0) return;

  const recipients = [...new Set(message.to)];
  const results = await Promise.allSettled(
    recipients.map((to) =>
      configuration.resend.emails.send({
        from: configuration.from,
        to,
        subject: message.subject,
        text: message.text,
        html: message.html,
      }),
    ),
  );

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`Falha ao enviar e-mail para ${recipients[index]}.`);
      return;
    }

    if (result.value.error) {
      console.error(
        `Resend recusou o e-mail para ${recipients[index]}: ${result.value.error.message}`,
      );
    }
  });
}
