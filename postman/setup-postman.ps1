param(
  [string]$BaseUrl = "http://localhost:3001",
  [string]$SuperadminEmail = "superadmin@example.com",
  [string]$SuperadminPassword = "Password123!",
  [string]$TeamadminEmail = "teamadmin@example.com",
  [string]$TeamadminPassword = "Password123!",
  [string]$VisualizerEmail = "visualizer@example.com",
  [string]$VisualizerPassword = "Password123!",
  [string]$ClientEmail = "client@example.com",
  [string]$ClientPassword = "Password123!",
  [string]$EnvName = "Andes Gateway Env",
  [string]$OutFile = "environment.andes.json"
)

function Write-Info($msg){ Write-Host "[postman-setup] $msg" -ForegroundColor Cyan }
function Write-Warn($msg){ Write-Host "[postman-setup] $msg" -ForegroundColor Yellow }

try {
  Write-Info "Intentando registrar cliente inicial ($ClientEmail)"
  $body = @{ email = $ClientEmail; password = $ClientPassword; name = "Client Name" } | ConvertTo-Json
  Invoke-RestMethod -Method Post -Uri "$BaseUrl/auth/register/client" -ContentType 'application/json' -Body $body -ErrorAction Stop | Out-Null
  Write-Info "Registro de cliente OK (o ya existe)."
} catch {
  Write-Warn "No se pudo registrar cliente (probablemente ya existe o servicio caído): $($_.Exception.Message)"
}

$now = (Get-Date).ToString('s') + 'Z'
$env = [ordered]@{
  name = $EnvName
  values = @(
    @{ key='baseUrl'; value=$BaseUrl; enabled=$true },
    @{ key='accessToken'; value=''; enabled=$true },
    @{ key='superadmin_email'; value=$SuperadminEmail; enabled=$true },
    @{ key='superadmin_password'; value=$SuperadminPassword; enabled=$true },
    @{ key='teamadmin_email'; value=$TeamadminEmail; enabled=$true },
    @{ key='teamadmin_password'; value=$TeamadminPassword; enabled=$true },
    @{ key='visualizer_email'; value=$VisualizerEmail; enabled=$true },
    @{ key='visualizer_password'; value=$VisualizerPassword; enabled=$true },
    @{ key='client_email'; value=$ClientEmail; enabled=$true },
    @{ key='client_password'; value=$ClientPassword; enabled=$true },
    @{ key='appId'; value=''; enabled=$true },
    @{ key='clientId'; value=''; enabled=$true },
    @{ key='teamId'; value=''; enabled=$true },
    @{ key='contractorId'; value=''; enabled=$true },
    @{ key='userId'; value=''; enabled=$true },
    @{ key='sessionId'; value=''; enabled=$true },
    @{ key='agentId'; value=''; enabled=$true },
    @{ key='agentSessionId'; value=''; enabled=$true },
    @{ key='dayOffId'; value=''; enabled=$true },
    @{ key='activationKey'; value=''; enabled=$true }
  )
  _postman_variable_scope = 'environment'
  _postman_exported_at = $now
  _postman_exported_using = 'postman/setup-script'
}

$env | ConvertTo-Json -Depth 6 | Out-File -FilePath (Join-Path $PSScriptRoot $OutFile) -Encoding UTF8
Write-Info "Environment escrito: $(Join-Path $PSScriptRoot $OutFile)"
Write-Info "Importa este environment y ejecuta los flujos en Postman."
