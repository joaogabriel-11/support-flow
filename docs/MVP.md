# MVP — Support Flow

Detalhamento funcional das funcionalidades da v1. Se não está descrito aqui, não entra nessa versão.

## 1. Autenticação e Perfis

- Login para os 3 perfis: **Solicitante**, **Agente**, **Admin**.
- Admin cria usuários (agente ou solicitante) informando: **nome, e-mail, senha e papel (role)**.
- Admin pode **desativar** um usuário (ex: agente que saiu da empresa) sem apagar o histórico de chamados associado a ele. Não há exclusão permanente no MVP.

## 2. Abertura de Chamado

- Campos: título, descrição, categoria e prioridade.
- **Categorias** (gerenciáveis pelo admin, com tela própria para criar/editar/desativar):
  - Hardware
  - Software
  - Rede
  - Acesso
- **Prioridades**: Baixa, Média, Alta, Crítica.
- Chamado criado nasce com status **ABERTO** e sem agente atribuído.

## 3. Fila de Chamados

- Chamados com status **ABERTO** (sem agente atribuído) ficam visíveis em uma fila geral para todos os agentes.
- Qualquer agente (ou admin) pode assumir um chamado da fila.
- Ao assumir, o chamado passa a ter um `agenteId` e muda de status automaticamente.

## 4. Fluxo de Status

```
ABERTO
  ↓ (agente/admin assume)
EM_ANDAMENTO
  ↕ (agente/admin alterna conforme necessário)
AGUARDANDO_SOLICITANTE
  ↓ (agente/admin marca solução)
RESOLVIDO
  ├── solicitante confirma → FECHADO (estado final)
  └── solicitante reabre → volta para EM_ANDAMENTO
```

**Regra importante:** um chamado **FECHADO não pode ser reaberto**. Se o problema voltar, o solicitante deve abrir um novo chamado. Isso evita reaproveitamento indefinido de um chamado antigo.

### Matriz de Permissões por Status

| Ação                                       | Solicitante | Agente | Admin |
| ------------------------------------------ | ----------- | ------ | ----- |
| Criar chamado                              | ✅          | ✅     | ✅    |
| Assumir chamado (Aberto → Em Andamento)    | ❌          | ✅     | ✅    |
| Marcar como Aguardando Solicitante         | ❌          | ✅     | ✅    |
| Marcar como Resolvido                      | ❌          | ✅     | ✅    |
| Confirmar resolução (Resolvido → Fechado)  | ✅          | ✅     | ✅    |
| Reabrir chamado (Resolvido → Em Andamento) | ✅          | ✅     | ✅    |

## 5. Comentários

- Dois tipos de comentário em cada chamado:
  - **Público**: visível para solicitante, agente e admin.
  - **Interno**: visível apenas para agente e admin (uso para notas técnicas, não deve vazar para o solicitante).

## 6. Notificações por E-mail (via Resend)

Disparadas nos seguintes eventos:

- Chamado criado (notifica agentes disponíveis / fila)
- Chamado atribuído a um agente (notifica o agente)
- Mudança de status (notifica solicitante, exceto quando o novo status é resultado de comentário interno)
- Novo comentário:
  - **Público** → dispara e-mail para o solicitante
  - **Interno** → dispara e-mail apenas para agente/admin envolvidos, nunca para o solicitante

## 7. Gerenciamento de Categorias (Admin)

- Tela dedicada para o admin criar, editar e desativar categorias de chamado.

---

_Próximo passo: `DECISOES_TECNICAS.md`, para fechar RBAC, modelo de dados e stack de notificações antes de mexer no `schema.prisma`._
