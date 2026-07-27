export type CompleteTicketInput = {
  ticketId: string;
  agentId: string;
};

type CompleteTicketDependencies<TTicket> = {
  complete: (input: {
    ticketId: string;
    agentId: string;
  }) => Promise<TTicket | null>;
};

export type CompleteTicketResult<TTicket> =
  | { success: true; ticket: TTicket }
  | { success: false; reason: "INVALID_INPUT" | "NOT_AVAILABLE" };

export async function completeTicket<TTicket>(
  input: CompleteTicketInput,
  dependencies: CompleteTicketDependencies<TTicket>,
): Promise<CompleteTicketResult<TTicket>> {
  const ticketId = input.ticketId.trim();
  const agentId = input.agentId.trim();

  if (!ticketId || !agentId) {
    return { success: false, reason: "INVALID_INPUT" };
  }

  const ticket = await dependencies.complete({
    ticketId,
    agentId,
  });

  if (!ticket) {
    return { success: false, reason: "NOT_AVAILABLE" };
  }

  return { success: true, ticket };
}
