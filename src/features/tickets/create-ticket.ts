export const TICKET_PRIORITIES = ["BAIXA", "MEDIA", "ALTA", "CRITICA"] as const;

export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export type CreateTicketInput = {
  requesterId: string;
  title: string;
  description: string;
  categoryId: string;
  priority: string;
};

export type CreateTicketField =
  | "title"
  | "description"
  | "categoryId"
  | "priority";

export type CreateTicketErrors = Partial<Record<CreateTicketField, string>>;

type CreateTicketDependencies<TTicket> = {
  categoryExists: (categoryId: string) => Promise<boolean>;
  persistTicket: (input: {
    requesterId: string;
    title: string;
    description: string;
    categoryId: string;
    priority: TicketPriority;
  }) => Promise<TTicket>;
};

export type CreateTicketResult<TTicket> =
  | { success: true; ticket: TTicket }
  | { success: false; errors: CreateTicketErrors };

function normalizeInput(input: CreateTicketInput) {
  return {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    categoryId: input.categoryId.trim(),
    priority: input.priority.trim().toUpperCase(),
  };
}

export async function createTicket<TTicket>(
  input: CreateTicketInput,
  dependencies: CreateTicketDependencies<TTicket>,
): Promise<CreateTicketResult<TTicket>> {
  const normalized = normalizeInput(input);
  const errors: CreateTicketErrors = {};

  if (normalized.title.length < 5 || normalized.title.length > 120) {
    errors.title = "Informe um titulo entre 5 e 120 caracteres.";
  }

  if (
    normalized.description.length < 10 ||
    normalized.description.length > 5000
  ) {
    errors.description =
      "Informe uma descricao entre 10 e 5000 caracteres.";
  }

  if (!normalized.categoryId) {
    errors.categoryId = "Selecione uma categoria.";
  }

  if (
    !TICKET_PRIORITIES.includes(normalized.priority as TicketPriority)
  ) {
    errors.priority = "Selecione uma prioridade valida.";
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors };
  }

  const categoryExists = await dependencies.categoryExists(
    normalized.categoryId,
  );

  if (!categoryExists) {
    return {
      success: false,
      errors: { categoryId: "A categoria selecionada nao esta disponivel." },
    };
  }

  const ticket = await dependencies.persistTicket({
    requesterId: normalized.requesterId,
    title: normalized.title,
    description: normalized.description,
    categoryId: normalized.categoryId,
    priority: normalized.priority as TicketPriority,
  });

  return { success: true, ticket };
}
