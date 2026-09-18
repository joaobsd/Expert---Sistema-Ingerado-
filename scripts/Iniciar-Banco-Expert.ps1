$ErrorActionPreference = 'Stop'

$pgCtl = 'C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe'
$pgIsReady = 'C:\Program Files\PostgreSQL\16\bin\pg_isready.exe'
$data = 'C:\ProgramData\ExpertERP\PostgreSQL16\data'
$log = 'C:\ProgramData\ExpertERP\PostgreSQL16\postgresql.log'

if (-not (Test-Path -LiteralPath $pgCtl) -or -not (Test-Path -LiteralPath $data)) {
    throw 'PostgreSQL do Expert nao encontrado nos caminhos configurados.'
}

& $pgCtl status -D $data *> $null
if ($LASTEXITCODE -ne 0) {
    & $pgCtl -D $data -l $log -w start
    if ($LASTEXITCODE -ne 0) {
        throw "Falha ao iniciar o banco. Consulte o log em $log"
    }
}

& $pgIsReady -h 127.0.0.1 -p 5433 -d expert_erp_dev
if ($LASTEXITCODE -ne 0) {
    throw 'A instancia Expert iniciou, mas ainda nao aceita conexoes na porta 5433.'
}

Write-Host 'PostgreSQL do Expert pronto em 127.0.0.1:5433.'
