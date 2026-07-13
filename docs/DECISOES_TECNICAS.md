# Decisões Técnicas — Support Flow

## Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- PostgreSQL
- Supabase
- Prisma
- NextAuth/Auth.js
- Resend

## Autenticação

- Credentials Provider
- Login por e-mail e senha
- Sessão via JWT ou banco
- Usuários desativados não autenticam

## RBAC

- Enum no Prisma:
  - SOLICITANTE
  - AGENTE
  - ADMIN

- Autorização validada no servidor
- Interface também oculta ações não permitidas

## Banco de Dados

Entidades iniciais:

- User
- Ticket
- Category
- Comment
- ActivityLog

## Testes

- Vitest
- React Testing Library
- Playwright

## CI

- GitHub Actions
- lint
- testes
- build

## Deploy

- Vercel
- Supabase PostgreSQL
