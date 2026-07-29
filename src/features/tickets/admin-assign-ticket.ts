export type AdminAssignTicketInput = {
  ticketId: string;
  adminId: string;
  targetAgentId: string;
};

export type AdminAssignmentFailure =
  | "INVALID_INPUT"
  | "TARGET_NOT_AVAILABLE"
  | "TICKET_NOT_AVAILABLE"
  | "SAME_AGENT"
  | "FINAL_STATUS";

type AdminAssignTicketDependencies<TTicket> = {
  assign: (input: AdminAssignTicketInput) => Promise<
    | { success: true; ticket: TTicket }
    | { success: false; reason: Exclude<AdminAssignmentFailure, "INVALID_INPUT"> }
  >;
};

export type AdminAssignTicketResult<TTicket> =
  | { success: true; ticket: TTicket }
  | { success: false; reason: AdminAssignmentFailure };

export async function adminAssignTicket<TTicket>(
  input: AdminAssignTicketInput,
  dependencies: AdminAssignTicketDependencies<TTicket>,
): Promise<AdminAssignTicketResult<TTicket>> {
  const ticketId = input.ticketId.trim();
  const adminId = input.adminId.trim();
  const targetAgentId = input.targetAgentId.trim();

  if (!ticketId || !adminId || !targetAgentId) {
    return { success: false, reason: "INVALID_INPUT" };
  }

  return dependencies.assign({ ticketId, adminId, targetAgentId });
}
