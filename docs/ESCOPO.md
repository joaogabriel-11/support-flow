# Escopo — Support Flow

## Visão Geral

**Support Flow** é um sistema de gerenciamento de chamados (tickets) voltado para o **suporte de TI interno** de uma empresa. Substitui o fluxo informal de abertura de chamados via e-mail, WhatsApp ou planilhas por um sistema centralizado, com rastreabilidade de status, histórico de atividades e atribuição de responsáveis.

Projeto desenvolvido como **portfólio**, para demonstração em processos seletivos de vagas júnior e estágio em desenvolvimento.

## Problema que Resolve

Empresas sem um sistema formal de chamados de TI costumam perder solicitações, não possuem visibilidade sobre o que está pendente, não sabem quem está responsável por cada problema e não mantêm um histórico confiável do que já foi resolvido.

O Support Flow centraliza essas informações em um único sistema.

## Perfis de Usuário

| Perfil          | Descrição                                                                                                                                      |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Solicitante** | Funcionário que abre chamados de TI. Possui login e visualiza o histórico dos próprios chamados.                                               |
| **Agente**      | Técnico de TI responsável por visualizar a fila geral, assumir chamados e atender, atualizar status e comentar nos chamados atribuídos a ele.  |
| **Admin**       | Além de atuar como agente, gerencia usuários, define papéis, desativa contas, gerencia categorias e possui acesso administrativo aos chamados. |

## Categorias de Chamado (MVP)

Os chamados são classificados por categoria no momento da abertura:

- Hardware
- Software
- Rede
- Acesso

## O que ESTÁ no MVP

- Login para os três perfis: Solicitante, Agente e Admin
- Abertura de chamado com título, descrição, categoria e prioridade escolhida pelo solicitante
- Listagem de chamados com filtros por status
- Fila geral de chamados abertos e não atribuídos
- Possibilidade de agentes assumirem chamados da fila
- Atribuição e reatribuição manual de chamados pelo admin
- Fluxo controlado de status
- Comentários públicos e notas internas
- Histórico de atividades, incluindo alterações de status, atribuição, reatribuição e prioridade
- Notificações por e-mail via Resend
- Gerenciamento de usuários pelo admin
- Gerenciamento de categorias pelo admin

## O que NÃO está no MVP

As funcionalidades abaixo ficam planejadas para versões futuras:

- **SLA** — prazo de atendimento e resolução por prioridade, planejado para a v2
- Chat em tempo real entre solicitante e agente
- Aplicativo mobile
- Integração com Slack, Microsoft Teams ou outras ferramentas de comunicação
- Anexos e upload de arquivos
- Relatórios e dashboards analíticos
- Base de conhecimento ou FAQ integrada
- Suporte a múltiplas empresas ou arquitetura multi-tenant

---

_Próximo passo: definir `DECISOES_TECNICAS.md`, documentando arquitetura, autenticação, RBAC, modelo de dados, testes e integrações antes da implementação._
