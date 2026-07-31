<div align="center">

# Support Flow

### Plataforma Full Stack para gestao de chamados de suporte, atribuicao de agentes e acompanhamento de atendimentos

<br/>

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=nextdotjs)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Neon](https://img.shields.io/badge/Neon-00E599?style=for-the-badge&logo=neon&logoColor=black)

<br/>

<p align="center">
  <a href="https://support-flow.joaogabriels.com"><img src="https://img.shields.io/badge/Live_Demo-000000?style=for-the-badge&logo=vercel&logoColor=white"/></a>
  <a href="https://github.com/joaogabriel-11/support-flow"><img src="https://img.shields.io/badge/Code-181717?style=for-the-badge&logo=github&logoColor=white"/></a>
</p>

<br/>

<img width="1890" height="916" alt="support-flow" src="https://github.com/user-attachments/assets/244a2585-cf91-43a3-8c21-4cb8e89fc5c9" />


*Um sistema centralizado para abertura, distribuicao e acompanhamento de chamados internos de suporte de TI.*

</div>

---

# Sobre

O **Support Flow** e uma aplicacao Full Stack desenvolvida com **Next.js App Router** para organizar o suporte interno de empresas. A plataforma substitui solicitacoes dispersas em e-mails, mensagens e planilhas por um fluxo rastreavel, com responsaveis definidos, historico de atividades e controle de acesso por perfil.

O projeto foi desenvolvido com foco em:

* Regras de negocio separadas da infraestrutura
* Autorizacao validada em diferentes camadas do servidor
* Transacoes para operacoes criticas
* Prevencao de conflitos na atribuicao de chamados
* Componentes e fluxos reutilizaveis
* Testes automatizados de regras e integracoes
* Interface responsiva para solicitantes, agentes e administradores
* Deploy continuo com GitHub Actions e Vercel

---

# Demonstracao

A aplicacao publicada possui contas exclusivas para avaliacao:

| Perfil | E-mail | Senha |
| --- | --- | --- |
| Solicitante | `solicitante@supportflow.com` | `solicitante` |
| Agente | `agente@supportflow.com` | `agente00` |

> As credenciais acima pertencem somente ao ambiente de demonstracao e nao concedem acesso administrativo.

---

# Funcionalidades

## Solicitante

* Login com e-mail e senha
* Abertura de chamados com titulo, descricao, categoria e prioridade
* Visualizacao exclusiva dos proprios chamados
* Ordenacao por status e prioridade
* Separacao dos chamados resolvidos em uma secao expansivel
* Comentarios publicos no atendimento
* Consulta do historico completo do chamado
* Notificacao por e-mail quando o chamado e resolvido

---

## Agente

* Visualizacao da fila geral de chamados abertos
* Recebimento de aviso por e-mail sobre novos chamados
* Atribuicao segura de um chamado disponivel
* Listagem dos proprios atendimentos
* Comentarios publicos e notas internas
* Conclusao de chamados em andamento
* Separacao dos atendimentos resolvidos
* Bloqueio de acesso a chamados atribuidos a outros agentes

---

## Administrador

* Cadastro de solicitantes, agentes e administradores
* Ativacao e desativacao de usuarios
* Protecao contra desativacao da propria conta
* CRUD de categorias
* Desativacao de categorias sem alterar chamados antigos
* Exclusao permanente de categorias sem chamados vinculados
* Visualizacao de todos os chamados
* Filtros por status, prioridade, categoria e agente
* Paginacao da listagem administrativa
* Atribuicao e reatribuicao manual entre agentes ativos
* Possibilidade de assumir e concluir chamados

---

## Regras de Negocio

* Apenas solicitantes podem abrir chamados
* Todo chamado inicia como `ABERTO` e sem responsavel
* Ao ser assumido, o chamado muda para `EM_ANDAMENTO`
* Apenas o agente responsavel pode concluir seu atendimento
* Chamados concluidos mudam para `RESOLVIDO`
* Apenas um agente pode assumir o mesmo chamado
* Atribuicoes concorrentes sao protegidas por atualizacao condicional
* Somente categorias ativas aparecem na abertura de chamados
* Notas internas nunca sao exibidas ao solicitante
* Criacao, atribuicao, reatribuicao e conclusao ficam registradas no historico
* Usuarios desativados perdem o acesso imediatamente

---

# Tecnologias Utilizadas

| Tecnologia | Descricao |
| --- | --- |
| Next.js 16 | Framework Full Stack com App Router |
| React 19 | Biblioteca de interfaces e Server Components |
| TypeScript | Tipagem estatica e contratos das regras de negocio |
| Tailwind CSS 4 | Estilizacao responsiva |
| Auth.js | Autenticacao por credenciais e sessoes JWT |
| bcryptjs | Hash seguro das senhas |
| Prisma 7 | ORM, migrations e transacoes |
| PostgreSQL | Banco de dados relacional |
| Neon | Hospedagem PostgreSQL e separacao entre production e CI |
| Resend | Notificacoes transacionais por e-mail |
| Vitest | Testes automatizados e cobertura |
| GitHub Actions | Integracao continua |
| Vercel | Deploy da aplicacao |

---

# Estrutura do Projeto

```text
src
|-- app
|   |-- login
|   |-- chamados
|   |   `-- [id]
|   |-- fila
|   |-- meus-atendimentos
|   |-- admin
|   |   |-- categorias
|   |   `-- chamados
|   `-- api/auth/[...nextauth]
|
|-- components
|   |-- app-shell.tsx
|   `-- resolved-tickets-section.tsx
|
|-- features
|   |-- auth
|   |-- categories
|   |-- notifications
|   |-- tickets
|   `-- users
|
|-- lib
|   |-- authorization.ts
|   |-- email.ts
|   |-- prisma.ts
|   `-- server-authorization.ts
|
|-- test
|-- types
|-- auth.ts
`-- proxy.ts

prisma
|-- migrations
|-- schema.prisma
`-- seed.ts

docs
|-- ESCOPO.md
|-- MVP.md
|-- REGRAS_DE_NEGOCIO.md
|-- ROADMAP.md
`-- TESTES.md
```

---

# Arquitetura

As operacoes seguem um fluxo em camadas:

```text
Pagina ou formulario
        |
Server Action valida sessao e papel
        |
Feature normaliza dados e aplica regras de negocio
        |
Adaptador Prisma executa consultas e transacoes
        |
PostgreSQL persiste a operacao e o historico
        |
Next.js revalida as paginas afetadas
```

As funcoes em `src/features` recebem dependencias por parametro. Dessa forma, as regras podem ser testadas com mocks, sem acessar o banco real. Os arquivos `prisma-*-dependencies.ts` implementam essas dependencias usando Prisma.

---

# Seguranca e Autorizacao

* Senhas armazenadas somente como hash bcrypt
* Sessao JWT com papel e situacao do usuario
* Situacao da conta recarregada do banco durante a validacao da sessao
* Falha fechada quando o banco nao confirma a autorizacao
* Proxy para interceptar rotas privadas
* Layouts protegidos no servidor
* Server Actions com validacao de sessao e perfil
* Consultas filtradas pelo solicitante ou agente responsavel
* Protecao contra acesso direto por alteracao manual da URL
* Notas internas filtradas no servidor
* Segredos mantidos em variaveis de ambiente

---

# Banco de Dados

O modelo relacional possui cinco entidades principais:

* `User`: usuario, papel e situacao da conta
* `Category`: classificacao ativa ou inativa do chamado
* `Ticket`: solicitacao, prioridade, status e responsavel
* `TicketComment`: comentario publico ou nota interna
* `TicketActivity`: historico imutavel das operacoes

O Neon utiliza branches separadas:

* `production`: dados da aplicacao publicada
* `ci`: migrations e validacoes do GitHub Actions

A aplicacao utiliza uma conexao com pooling em execucao, enquanto migrations utilizam uma conexao direta.

---

# Primeiros Passos

Clone o repositorio:

```bash
git clone https://github.com/joaogabriel-11/support-flow.git
```

Acesse a pasta:

```bash
cd support-flow
```

Instale as dependencias:

```bash
npm install
```

Configure as variaveis de ambiente:

```bash
cp .env.example .env
```

Gere o Prisma Client e aplique as migrations:

```bash
npx prisma generate
npx prisma migrate deploy
```

Opcionalmente, execute a seed:

```bash
npm run db:seed
```

Inicie o projeto:

```bash
npm run dev
```

Abra `http://localhost:3000`.

---

# Variaveis de Ambiente

```env
DATABASE_URL=""
DIRECT_DATABASE_URL=""

AUTH_SECRET=""
AUTH_URL="http://localhost:3000"

RESEND_API_KEY=""
EMAIL_FROM="Support Flow <noreply@seudominio.com>"
APP_URL="http://localhost:3000"

SEED_ADMIN_PASSWORD=""
SEED_REQUESTER_PASSWORD=""
```

---

# Scripts Disponiveis

| Comando | Descricao |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de producao |
| `npm run start` | Inicia o servidor de producao |
| `npm run lint` | Executa o ESLint |
| `npm test` | Executa os testes em modo interativo |
| `npm run test:run` | Executa todos os testes uma vez |
| `npm run test:coverage` | Gera o relatorio de cobertura |
| `npm run db:seed` | Insere ou atualiza os dados iniciais |

---

# Principais Fluxos

## Abertura e Atendimento

```text
Solicitante abre o chamado
        |
Chamado entra na fila como ABERTO
        |
Agentes ativos recebem um e-mail
        |
Um agente assume o chamado
        |
Status muda para EM_ANDAMENTO
        |
Agente e solicitante podem comentar
        |
Agente conclui o atendimento
        |
Status muda para RESOLVIDO
        |
Solicitante recebe um e-mail
```

## Atribuicao Administrativa

```text
Admin localiza o chamado
        |
Seleciona um agente ativo
        |
Sistema valida chamado e responsavel
        |
Atribuicao ou reatribuicao ocorre em transacao
        |
Alteracao e registrada no historico
```

---

# Testes e Qualidade

O projeto possui testes automatizados para:

* Autenticacao e usuarios desativados
* Matriz de papeis e autorizacao de rotas
* Criacao e conclusao de chamados
* Atribuicao concorrente e reatribuicao
* Comentarios publicos e notas internas
* CRUD e restricoes de categorias
* Criacao e ativacao de usuarios
* Historico transacional
* Integracao isolada com o Resend

A suite final possui **67 testes**, com mais de **90% de cobertura de statements** e **94% de cobertura de linhas**.

O workflow de CI executa migrations na branch `ci` do Neon, ESLint, testes e build antes da integracao com a `main`.

---

# Design Responsivo

A interface foi desenvolvida para desktop, notebook, tablet e celular. Cada perfil visualiza apenas a navegacao e as acoes relacionadas ao seu papel, mantendo o fluxo simples e objetivo.

---

# Desempenho e Confiabilidade

* Server Components para consultas e renderizacao no servidor
* Server Actions para mutacoes internas
* Connection pooling para o ambiente serverless
* Indices PostgreSQL para filtros e relacionamentos frequentes
* Transacoes Prisma para chamado e historico
* Atualizacao condicional para evitar atribuicoes concorrentes
* E-mails tratados como efeito secundario, sem desfazer a operacao principal
* Revalidacao seletiva das paginas alteradas
* Separacao entre regras de negocio e infraestrutura

---

# Capturas de Tela

Uma visao das principais areas do Support Flow para cada perfil de acesso.

## Area do Solicitante

### Meus chamados

<p align="center">
  <img width="100%" alt="Lista de chamados do solicitante" src="https://github.com/user-attachments/assets/fc3bd64e-2bb5-4591-9fa4-cc00ca4c0fef" />
</p>

<br><br>

## Area Administrativa

### Fila de atendimento

<p align="center">
  <img width="100%" alt="Fila de atendimento dos agentes" src="https://github.com/user-attachments/assets/6a771186-a43d-478c-b85b-bdc33ffff05c" />
</p>

### Gestao de usuarios

<p align="center">
  <img width="100%" alt="Gestao de usuarios" src="https://github.com/user-attachments/assets/b51ac901-517f-4c4a-be69-6fd398465201" />
</p>

### Gestao de chamados

<p align="center">
  <img width="100%" alt="Gestao de todos os chamados" src="https://github.com/user-attachments/assets/863ba8af-9c78-4af5-8e0f-ded694951523" />
</p>

### Gestao de categorias

<p align="center">
  <img width="100%" alt="Gestao de categorias" src="https://github.com/user-attachments/assets/b72212eb-ab1f-4ffa-8420-1344a5f212d2" />
</p>


# Proximas Implementacoes

* SLA por prioridade
* Dashboard e relatorios analiticos
* Anexos nos chamados
* Notificacoes internas no sistema
* Base de conhecimento
* Integracao com Slack e Microsoft Teams
* Suporte multiempresa

---

# Contribuindo

Contribuicoes sao bem-vindas!

1. Faca um fork do projeto.
2. Crie uma branch com `git checkout -b feature/new-feature`.
3. Faca o commit com `git commit -m "feat: add new feature"`.
4. Envie com `git push origin feature/new-feature`.
5. Abra um Pull Request.

---

# Autor

**Joao Gabriel dos Santos**

GitHub

[![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/joaogabriel-11)

LinkedIn

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/joaogabriel11)

---

<div align="center">

### Se voce gostou deste projeto, deixe uma estrela no repositorio!

</div>
