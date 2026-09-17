# PostgreSQL do Expert no DBeaver

O DBeaver é o cliente para administrar e consultar o banco. A API do Expert se conecta diretamente ao PostgreSQL com as mesmas informações de servidor, banco e usuário. O banco de desenvolvimento escolhido é **`expert_erp_dev`**, separado das conexões DB2, SQL Server e MySQL já existentes no DBeaver.

Na verificação local de 17/09/2026, os serviços PostgreSQL 15 e 16 estavam ativos e `127.0.0.1:5432` aceitava conexões. A versão que atende nessa porta será confirmada após a autenticação. A conexão **Expert ERP - PostgreSQL admin** já foi salva no DBeaver para `127.0.0.1:5432/postgres`, usuário `postgres`, com tipo Desenvolvimento e sem senha salva. O acesso exige senha; ela não está no repositório e não deve ser enviada por mensagem.

## Criar o banco

1. No DBeaver, conecte **Expert ERP - PostgreSQL admin**. Digite a senha do usuário `postgres` diretamente no aplicativo e confirme que a conexão funciona.
2. Nessa conexão administrativa, crie o papel `expert_app_dev` com **LOGIN** e uma senha própria. Deixe desativadas as permissões **SUPERUSER**, **CREATEDB** e **CREATEROLE**. Use a interface de administração de papéis do DBeaver para definir a senha, sem colocá-la em scripts do projeto.
3. No editor SQL da conexão administrativa, execute esta instrução isolada, com autocommit:

   ```sql
   CREATE DATABASE expert_erp_dev OWNER expert_app_dev;
   ```

4. Crie outra conexão PostgreSQL no DBeaver, chamada **Expert ERP Desenvolvimento**, para host `127.0.0.1`, porta `5432`, banco `expert_erp_dev` e usuário `expert_app_dev`. Teste a conexão com a senha desse papel.

Se o banco `expert_erp_dev` já existir, pare antes de executar migrações e confirme a propriedade e as tabelas. Não reutilize um banco com dados de outro sistema.

## Ligar a API

Copie `apps/api/.env.example` para `apps/api/.env` e preencha `DATABASE_URL` localmente:

```dotenv
PORT=3333
DATABASE_EXPECTED_NAME=expert_erp_dev
DATABASE_URL=postgresql://expert_app_dev:SENHA_CODIFICADA_PARA_URL@127.0.0.1:5432/expert_erp_dev
```

Se a senha contiver caracteres especiais, codifique-os para URL. O arquivo `.env` é ignorado pelo Git. Não coloque senhas no README, em issues ou em commits.

Na raiz do repositório, confira a conexão **antes** de criar tabelas:

```bash
pnpm db:check
pnpm db:migrate
```

`db:check` mostra banco, papel e versão, sem mostrar a senha. A migração compara `current_database()` com `DATABASE_EXPECTED_NAME` e é bloqueada se não coincidirem. Após migrar, confira no DBeaver as tabelas `schema_migrations`, `tenants`, `branches`, `departments` e `products` no banco `expert_erp_dev`. A rota `http://127.0.0.1:3333/health/db` também pode verificar a conexão da API após iniciá-la.

Referências: [conexões no DBeaver](https://dbeaver.com/docs/dbeaver/Create-Connection/), [driver PostgreSQL no DBeaver](https://dbeaver.com/docs/dbeaver/Database-driver-PostgreSQL/) e [criação de banco no PostgreSQL](https://www.postgresql.org/docs/16/manage-ag-createdb.html).
