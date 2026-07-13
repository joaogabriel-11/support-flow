# MVP — Support Flow

Detalhamento funcional das funcionalidades da v1. **Se não está descrito aqui, não entra nesta versão.**

## 1. Autenticação e Perfis

O sistema possui três perfis de usuário:

- **Solicitante**: abre e acompanha os próprios chamados.
- **Agente**: visualiza a fila geral, assume e atende chamados atribuídos a ele.
- **Admin**: possui as permissões de agente e também gerencia usuários, categorias e atribuições.

Regras:

- Apenas usuários com papel `SOLICITANTE` podem criar chamados.
- O admin cria usuários informando:
  - nome;
  - e-mail;
  - senha;
  - papel (`SOLICITANTE`, `AGENTE` ou `ADMIN`).
- A senha definida pelo admin é uma **senha inicial simples**.
- Não existe, no MVP:
  - convite por e-mail;
  - troca obrigatória no primeiro login;
  - expiração de senha.
- O admin pode desativar usuários.
- Usuários desativados:
  - não podem realizar login;
  - permanecem vinculados ao histórico já existente.
- Não existe exclusão permanente de usuários no MVP.
- Agentes desativados:
  - não podem receber novos chamados;
  - não aparecem como opção de atribuição.
- Um agente com chamados atribuídos cujo status seja diferente de `FECHADO` não pode ser desativado.
- Antes da desativação, o admin deve reatribuir todos os chamados ativos desse agente.

---

## 2. Abertura de Chamado

A abertura de chamado é permitida apenas para usuários com papel `SOLICITANTE`.

Campos:

- título;
- descrição;
- categoria;
- prioridade.

### Categorias iniciais

- Hardware
- Software
- Rede
- Acesso

Regras:

- As categorias são gerenciáveis pelo admin.
- Apenas categorias ativas aparecem no formulário de abertura.
- A prioridade é escolhida diretamente pelo solicitante no momento da criação.

Prioridades disponíveis:

- `BAIXA`
- `MEDIA`
- `ALTA`
- `CRITICA`

Todo chamado novo é criado com:

- status `ABERTO`;
- nenhum agente responsável;
- categoria ativa;
- prioridade definida pelo solicitante.

Após a criação:

- o solicitante não pode alterar a prioridade;
- agentes e admins podem corrigir a prioridade;
- toda alteração de prioridade é registrada no Histórico de Atividades.

---

## 3. Fila, Atribuição e Reatribuição

### Fila geral

- Chamados com status `ABERTO` e sem agente responsável ficam visíveis na fila geral.
- Todos os agentes ativos e admins podem visualizar essa fila.
- Qualquer agente ativo ou admin pode assumir um chamado disponível.

### Ao assumir um chamado

- o usuário que assumiu passa a ser o agente responsável;
- o status muda automaticamente de `ABERTO` para `EM_ANDAMENTO`;
- a atribuição é registrada no Histórico de Atividades.

### Regra de concorrência

- Um chamado pode possuir apenas um agente responsável por vez.
- Se dois agentes tentarem assumir o mesmo chamado simultaneamente, apenas a primeira operação válida é concluída.
- A segunda tentativa deve ser rejeitada.

### Reatribuição

- Apenas admins podem transferir um chamado de um agente para outro.
- Agentes não podem reatribuir seus próprios chamados.
- Apenas agentes ativos podem receber atribuições ou reatribuições.
- Toda reatribuição deve ser registrada no Histórico de Atividades.

---

## 4. Visualização e Filtros

### Solicitante

- Visualiza somente os chamados criados por ele.
- Não visualiza a fila geral.
- Não visualiza chamados de outros solicitantes.
- Pode filtrar os próprios chamados por status.

### Agente

- Visualiza:
  - a fila geral de chamados abertos e sem responsável;
  - os chamados atribuídos a ele.
- Não visualiza chamados atribuídos a outros agentes.
- Não pode acessar diretamente um chamado de outro agente por alteração manual da URL.
- Pode filtrar seus chamados por status.

### Admin

- Visualiza todos os chamados do sistema.
- Pode visualizar chamados atribuídos a qualquer agente.
- Pode filtrar por:
  - status;
  - categoria;
  - prioridade;
  - agente responsável.

---

## 5. Fluxo de Status

Status disponíveis:

- `ABERTO`
- `EM_ANDAMENTO`
- `AGUARDANDO_SOLICITANTE`
- `RESOLVIDO`
- `FECHADO`

Fluxo principal:

```text
ABERTO
   │
   │ agente/admin assume
   ▼
EM_ANDAMENTO ───────────────► RESOLVIDO
   ▲                              │
   │                              ├── solicitante confirma ──► FECHADO
   │                              │
   │                              └── solicitante reabre ────► EM_ANDAMENTO
   │
   ▼
AGUARDANDO_SOLICITANTE
```

Regras:

- `ABERTO` é o status inicial.
- Ao ser assumido, o chamado muda automaticamente para `EM_ANDAMENTO`.
- Apenas agentes e admins podem alterar um chamado para `AGUARDANDO_SOLICITANTE`.
- Apenas agentes e admins podem marcar um chamado como `RESOLVIDO`.
- `AGUARDANDO_SOLICITANTE` é opcional.
- Um chamado pode ir diretamente de `EM_ANDAMENTO` para `RESOLVIDO`.
- Quando o solicitante adiciona um comentário público em um chamado com status `AGUARDANDO_SOLICITANTE`, o status volta automaticamente para `EM_ANDAMENTO`.
- Comentários internos não provocam mudança automática de status.
- Um chamado `RESOLVIDO` pode:
  - ser confirmado pelo solicitante e mudar para `FECHADO`;
  - ser reaberto pelo solicitante e retornar para `EM_ANDAMENTO`.
- `FECHADO` é um estado final.
- Chamados fechados não podem ser reabertos.
- Se o problema voltar após o fechamento, o solicitante deve criar um novo chamado.

### Matriz de Permissões

| Ação                                          | Solicitante | Agente | Admin |
| --------------------------------------------- | ----------: | -----: | ----: |
| Criar chamado                                 |          ✅ |     ❌ |    ❌ |
| Visualizar os próprios chamados               |          ✅ |      — |    ✅ |
| Visualizar fila geral                         |          ❌ |     ✅ |    ✅ |
| Visualizar chamado atribuído a outro agente   |          ❌ |     ❌ |    ✅ |
| Assumir chamado da fila                       |          ❌ |     ✅ |    ✅ |
| Marcar como `AGUARDANDO_SOLICITANTE`          |          ❌ |     ✅ |    ✅ |
| Marcar como `RESOLVIDO`                       |          ❌ |     ✅ |    ✅ |
| Confirmar resolução (`RESOLVIDO` → `FECHADO`) |          ✅ |     ✅ |    ✅ |
| Reabrir (`RESOLVIDO` → `EM_ANDAMENTO`)        |          ✅ |     ✅ |    ✅ |
| Alterar prioridade após a criação             |          ❌ |     ✅ |    ✅ |
| Reatribuir chamado                            |          ❌ |     ❌ |    ✅ |
| Criar comentário público                      |          ✅ |     ✅ |    ✅ |
| Criar nota interna                            |          ❌ |     ✅ |    ✅ |
| Editar ou excluir comentário/nota             |          ❌ |     ❌ |    ❌ |

---

## 6. Comentários e Notas Internas

Cada chamado pode possuir dois tipos de interação.

### Comentário público

- Visível para:
  - solicitante;
  - agente responsável;
  - admins.
- Pode ser criado por:
  - solicitante;
  - agente responsável;
  - admin.

### Nota interna

- Visível somente para agentes e admins.
- Pode ser criada por agentes e admins.
- Solicitantes não podem:
  - criar;
  - visualizar;
  - acessar notas internas.
- Notas internas nunca devem ser retornadas ao solicitante, inclusive em acesso direto à API.

### Regras gerais

- Comentários públicos e notas internas não podem ser editados.
- Comentários públicos e notas internas não podem ser excluídos.
- Todo o histórico de interação deve ser preservado.

---

## 7. Histórico de Atividades

Cada chamado possui um histórico cronológico separado dos comentários.

Devem ser registrados:

- criação do chamado;
- atribuição inicial;
- reatribuição;
- alteração de status;
- alteração de prioridade;
- transições automáticas de status.

Cada registro deve armazenar:

- tipo da ação;
- usuário responsável, quando aplicável;
- data e hora;
- valor anterior, quando aplicável;
- novo valor, quando aplicável.

Regras:

- O Histórico de Atividades não substitui comentários públicos nem notas internas.
- Registros do histórico não podem ser editados.
- Registros do histórico não podem ser excluídos.

---

## 8. Notificações por E-mail

Integração via **Resend**.

Regra geral:

> O autor de uma ação não recebe e-mail sobre a própria ação, exceto quando houver uma confirmação explícita prevista pelo sistema, como a confirmação de abertura de um chamado.

| Evento                                      | Destinatário(s)                                                        |
| ------------------------------------------- | ---------------------------------------------------------------------- |
| Chamado criado                              | Solicitante recebe confirmação + todos os agentes ativos recebem aviso |
| Agente assume chamado da fila               | Solicitante                                                            |
| Admin atribui chamado a um agente           | Solicitante + agente escolhido                                         |
| Admin reatribui chamado                     | Solicitante + novo agente responsável                                  |
| Mudança de status                           | Solicitante                                                            |
| Comentário público do solicitante           | Agente responsável                                                     |
| Comentário público do agente                | Solicitante                                                            |
| Comentário público do admin                 | Solicitante + agente responsável, quando aplicável                     |
| Nota interna criada pelo admin              | Agente responsável, se existir                                         |
| Nota interna criada pelo agente responsável | Nenhum e-mail                                                          |

Regras adicionais:

- O conteúdo do e-mail de mudança de status varia conforme o novo status.
- Não existem e-mails separados para `RESOLVIDO` e `FECHADO`; ambos são cobertos pelo evento de mudança de status.
- Notas internas nunca notificam o solicitante.
- Admins não recebem automaticamente notificações de notas internas no MVP.
- Usuários desativados não recebem notificações.
- O envio de e-mail é implementado após o fluxo principal.
- Ordem de implementação:
  1. chamados;
  2. comentários;
  3. status;
  4. e-mails.
- Falhas no envio de e-mail não devem apagar nem desfazer uma operação de negócio já concluída.

---

## 9. Gerenciamento de Categorias

Funcionalidade exclusiva do admin.

O admin pode:

- criar categorias;
- editar o nome de categorias;
- ativar categorias;
- desativar categorias.

Regras:

- Não existe exclusão permanente de categorias no MVP.
- Apenas categorias ativas aparecem na abertura de novos chamados.
- Categorias desativadas permanecem vinculadas aos chamados antigos.
- Desativar uma categoria não altera chamados já existentes.

---

## 10. Regras de Segurança e Autorização

- O papel do usuário deve ser validado no servidor.
- Ocultar botões ou páginas no frontend não é considerado proteção suficiente.
- Toda ação protegida deve validar:
  - usuário autenticado;
  - papel do usuário;
  - acesso ao recurso solicitado.
- Alterar manualmente uma URL não deve permitir acesso a dados de outro usuário ou agente.
- O controle de acesso deve ser aplicado nas páginas, consultas ao banco, Server Actions e rotas de API utilizadas pelo sistema.

---

## 11. Fora do MVP

As funcionalidades abaixo não entram nesta versão:

- SLA por prioridade;
- chat em tempo real;
- anexos e upload de arquivos;
- notificações internas no sistema;
- aplicativo mobile;
- integração com Slack ou Microsoft Teams;
- relatórios e dashboards analíticos;
- base de conhecimento ou FAQ;
- suporte multiempresa/multi-tenant;
- convite por e-mail;
- troca obrigatória de senha no primeiro login;
- exclusão permanente de usuários, comentários, históricos ou categorias.

---

_Próximo passo: criar `DECISOES_TECNICAS.md` para documentar arquitetura, autenticação, RBAC, modelo de dados, estratégia de testes, CI/CD e integrações antes de implementar o `schema.prisma`._
