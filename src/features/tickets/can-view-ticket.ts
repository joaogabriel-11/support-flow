export type TicketViewer = {
  id: string;
  role: "SOLICITANTE" | "AGENTE" | "ADMIN";
};

export type ViewableTicket = {
  requesterId: string;
  agentId: string | null;
};

export function canViewTicket(viewer: TicketViewer, ticket: ViewableTicket) {
  if (viewer.role === "ADMIN") return true;
  if (viewer.role === "SOLICITANTE") {
    return ticket.requesterId === viewer.id;
  }
  return ticket.agentId === viewer.id;
}
