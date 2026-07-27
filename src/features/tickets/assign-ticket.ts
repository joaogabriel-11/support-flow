export type AssignTicketInput = {
  ticketId: string;
  agentId: string;
};

type AssignTicketDependencies<TTicket> = {
  claimTicket: (input: AssignTicketInput) => Promise<TTicket | null>;
};

export type AssignTicketResult<TTicket> =
  | { success: true; ticket: TTicket }
  | { success: false; reason: "INVALID_INPUT" | "NOT_AVAILABLE" };

export async function assignTicket<TTicket>(
  input: AssignTicketInput,
  dependencies: AssignTicketDependencies<TTicket>,
): Promise<AssignTicketResult<TTicket>> {
  const ticketId = input.ticketId.trim();
  const agentId = input.agentId.trim();

  if (!ticketId || !agentId) {
    return { success: false, reason: "INVALID_INPUT" };
  }

  const ticket = await dependencies.claimTicket({ ticketId, agentId });

  if (!ticket) {
    return { success: false, reason: "NOT_AVAILABLE" };
  }

  return { success: true, ticket };
}
