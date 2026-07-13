# Regras de Negócio — Support Flow

## 1. Chamados

- Apenas usuários com papel `SOLICITANTE` podem criar chamados.
- Todo chamado é criado com:
  - status `ABERTO`;
  - nenhum agente responsável;
  - prioridade definida pelo solicitante;
  - uma categoria ativa.
- Um chamado pode possuir apenas um agente responsável por vez.
- Chamados fechados permanecem disponíveis para consulta e histórico.
- Um chamado com status `FECHADO` não pode ser reaberto.
- Caso o problema volte após o fechamento, o solicitante deve criar um novo chamado.

## 2. Atribuição de Chamados

- Chamados com status `ABERTO` e sem agente responsável ficam disponíveis na fila geral.
- Todos os agentes ativos podem visualizar a fila geral.
- Um agente pode assumir um chamado disponível.
- Ao assumir um chamado:
  - o agente passa a ser o responsável;
  - o status muda automaticamente de `ABERTO` para `EM_ANDAMENTO`;
  - a atribuição é registrada no histórico de atividades.
- Um chamado pode ser assumido por apenas um agente.
- Caso dois agentes tentem assumir o mesmo chamado simultaneamente, apenas a primeira operação válida deve ser concluída.
- Apenas administradores podem reatribuir um chamado de um agente para outro.
- Agentes não podem transferir seus próprios chamados.
- Apenas agentes ativos podem receber novas atribuições.

## 3. Status

Os status disponíveis são:

- `ABERTO`
- `EM_ANDAMENTO`
- `AGUARDANDO_SOLICITANTE`
- `RESOLVIDO`
- `FECHADO`

Regras:

- `ABERTO` é o status inicial de todo chamado.
- Ao ser assumido, o chamado muda automaticamente para `EM_ANDAMENTO`.
- Apenas agentes e administradores podem alterar um chamado para `AGUARDANDO_SOLICITANTE`.
- Apenas agentes e administradores podem marcar um chamado como `RESOLVIDO`.
- O status `AGUARDANDO_SOLICITANTE` é opcional.
- Quando o solicitante adiciona um comentário público em um chamado com status `AGUARDANDO_SOLICITANTE`, o status retorna automaticamente para `EM_ANDAMENTO`.
- Comentários internos não alteram automaticamente o status do chamado.
- Um chamado `RESOLVIDO` pode:
  - ser confirmado pelo solicitante e mudar para `FECHADO`;
  - ser reaberto pelo solicitante e retornar para `EM_ANDAMENTO`.
- `FECHADO` é um estado final.

## 4. Prioridade

As prioridades disponíveis são:

- `BAIXA`
- `MEDIA`
- `ALTA`
- `CRITICA`

Regras:

- O solicitante define a prioridade no momento da abertura.
- Após a criação, o solicitante não pode alterar a prioridade.
- Agentes e administradores podem alterar a prioridade.
- Toda alteração de prioridade deve ser registrada no histórico de atividades, incluindo:
  - prioridade anterior;
  - nova prioridade;
  - usuário responsável;
  - data e hora.

## 5. Visibilidade dos Chamados

### Solicitante

- Visualiza somente os chamados criados por ele.
- Não visualiza a fila geral.
- Não visualiza chamados de outros solicitantes.

### Agente

- Visualiza:
  - a fila geral de chamados abertos e sem responsável;
  - os chamados atribuídos a ele.
- Não visualiza chamados atribuídos a outros agentes.
- Não pode acessar diretamente um chamado de outro agente por alteração manual da URL.

### Administrador

- Visualiza todos os chamados do sistema.
- Pode visualizar chamados atribuídos a qualquer agente.
- Pode atribuir e reatribuir chamados.

## 6. Comentários e Notas Internas

- Cada chamado pode possuir comentários públicos e notas internas.

### Comentário público

- É visível para:
  - solicitante;
  - agente responsável;
  - administradores.
- Pode ser criado por solicitantes, agentes e administradores.

### Nota interna

- É visível somente para agentes e administradores.
- Solicitantes não podem:
  - criar;
  - visualizar;
  - acessar notas internas.
- Notas internas nunca devem ser retornadas ao solicitante, mesmo por acesso direto à API.

### Regras gerais

- Comentários e notas internas não podem ser editados.
- Comentários e notas internas não podem ser excluídos.
- Todo o histórico de interação deve ser preservado.

## 7. Histórico de Atividades

- Cada chamado possui um histórico cronológico de atividades.
- Devem ser registrados:
  - criação do chamado;
  - atribuição inicial;
  - reatribuição;
  - alteração de status;
  - alteração de prioridade;
  - transições automáticas de status.
- Cada registro deve armazenar:
  - tipo da ação;
  - usuário responsável, quando aplicável;
  - data e hora;
  - valor anterior e novo valor, quando aplicável.
- Registros do histórico não podem ser editados ou excluídos.

## 8. Usuários

- Usuários desativados não podem realizar login.
- Usuários desativados permanecem vinculados ao histórico já existente.
- Não existe exclusão permanente de usuários no MVP.
- Agentes desativados:
  - não podem receber novos chamados;
  - não aparecem como opção de atribuição.
- Um agente com chamados cujo status seja diferente de `FECHADO` não pode ser desativado.
- Antes da desativação, o administrador deve reatribuir todos os chamados ativos do agente.

## 9. Categorias

- Apenas categorias ativas aparecem no formulário de abertura de chamados.
- Administradores podem:
  - criar categorias;
  - editar categorias;
  - ativar categorias;
  - desativar categorias.
- Categorias não podem ser excluídas permanentemente no MVP.
- Uma categoria desativada permanece associada aos chamados antigos.
- Desativar uma categoria não altera chamados já existentes.

## 10. Permissões

- O papel do usuário deve ser validado no servidor.
- Ocultar botões ou páginas no frontend não é considerado proteção suficiente.
- Toda ação protegida deve validar:
  - usuário autenticado;
  - papel do usuário;
  - acesso ao chamado solicitado.
