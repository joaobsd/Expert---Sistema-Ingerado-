# PostgreSQL do Expert no DBeaver

O ambiente de desenvolvimento do Expert nesta máquina usa uma instância exclusiva do **PostgreSQL 16.4**, em `127.0.0.1:5433`. O banco `expert_erp_dev` e o usuário de aplicação `expert_app_dev` já foram criados. As migrações `001_foundation.sql` e `002_product_hierarchy.sql` já foram aplicadas.

As instalações PostgreSQL existentes na porta `5432` não foram alteradas. A conexão antiga do DBeaver chamada **Expert ERP - PostgreSQL admin** aponta para `127.0.0.1:5432` e não deve ser usada para o Expert.

## Criar a conexão no DBeaver

Crie uma nova conexão do tipo **PostgreSQL** com estes dados:

| Campo | Valor |
| --- | --- |
| Nome da conexão | `Expert ERP Desenvolvimento` |
| Host | `127.0.0.1` |
| Porta | `5433` |
| Banco de dados | `expert_erp_dev` |
| Usuário | `expert_app_dev` |
| Senha | Valor após `EXPERT_APP_DEV_PASSWORD=` no arquivo local `C:\ProgramData\ExpertERP\PostgreSQL16\credentials.txt` |

O arquivo de credenciais é local e restrito ao administrador da máquina. Não copie a senha para o repositório, issues ou capturas de tela. A senha de `postgres` da **nova instância** está na linha `POSTGRES_ADMIN_PASSWORD=` do mesmo arquivo; a conexão normal do Expert usa `expert_app_dev`.

Clique em **Testar conexão**. Depois execute:

```sql
SELECT current_database(), current_user, current_setting('server_version'), inet_server_port();
```

O resultado esperado é `expert_erp_dev`, `expert_app_dev`, versão `16.4` e porta `5433`.

## API e migrações

O arquivo `apps/api/.env` já foi configurado localmente com a URL da nova instância. Ele é ignorado pelo Git. Para verificar a conexão e o estado das migrações, execute na raiz do repositório:

```powershell
pnpm db:check
pnpm db:migrate
```

`db:migrate` pode ser executado novamente: as migrações aplicadas são identificadas pelo controle de versão do banco. O banco atual contém somente a fundação estrutural; ainda não há dados operacionais de produtos ou vendas.

## Iniciar o banco após reiniciar o Windows

O PostgreSQL exclusivo do Expert está em `C:\ProgramData\ExpertERP\PostgreSQL16\data`. Como a configuração de inicialização automática foi negada pelo Windows nesta sessão, após reiniciar o computador execute no PowerShell:

```powershell
& .\scripts\Iniciar-Banco-Expert.ps1
```

O script verifica se a instância já está ativa e, se necessário, inicia somente a instância do Expert na porta `5433`. Ele não altera os serviços PostgreSQL existentes. Antes de cadastrar dados reais, defina uma rotina de backup e restauração testada.
