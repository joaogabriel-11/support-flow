# Scripts de banco de dados

Estes comandos destinam-se somente aos ambientes de desenvolvimento e teste.

## Popular o banco

Configure as senhas no `.env`:

```env
SEED_ADMIN_PASSWORD="senha-do-administrador"
SEED_REQUESTER_PASSWORD="senha-do-solicitante"
```

Execute:

```powershell
npm run db:seed
```

A seed pode ser executada novamente sem duplicar administrador, solicitante,
categorias ou chamados.
