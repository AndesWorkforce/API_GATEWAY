# Postman

Carpeta canónica con TODO lo referente a Postman para `API_GATEWAY`. No hay otros archivos de Postman fuera de este directorio.

## Contenido

- `collection.json`: colección completa (roles, flujos, tests de captura de IDs).
- `environment.andes.json`: environment con todas las variables requeridas.
- `setup-postman.ps1`: script para generar/actualizar el environment y asegurar un cliente inicial.

## Setup Rápido

```powershell
cd API_GATEWAY/postman
powershell -ExecutionPolicy Bypass -File .\setup-postman.ps1 -BaseUrl "http://localhost:3001" `
  -SuperadminEmail "superadmin@example.com" -SuperadminPassword "Password123!" `
  -TeamadminEmail "teamadmin@example.com" -TeamadminPassword "Password123!" `
  -VisualizerEmail "visualizer@example.com" -VisualizerPassword "Password123!" `
  -ClientEmail "client@example.com" -ClientPassword "Password123!"
```

Importa luego `collection.json` y `environment.andes.json` en Postman y selecciona el environment.

## Orden de Ejecución de Flujos

1. Flujo Superadmin (crea y captura IDs principales)
2. Flujo Público (registra `agentId` y heartbeat)
3. Flujo TeamAdmin (gestión y días libres)
4. Flujo Visualizer (lecturas generales)
5. Flujo Client (lecturas filtradas)

## Reset de Variables

Agrega temporalmente en un test:

```javascript
[
  'clientId',
  'teamId',
  'contractorId',
  'activationKey',
  'appId',
  'sessionId',
  'agentSessionId',
  'agentId',
  'dayOffId',
  'accessToken',
].forEach((v) => pm.collectionVariables.unset(v));
```

## Convenciones

- Endpoints públicos usan header `X-No-Auth` y se elimina `Authorization` en pre-request.
- IDs se almacenan en variables de colección para reuso en flujos posteriores.

## Mantenimiento

Actualiza endpoints solo en `collection.json`. Si cambias la estructura, re-exporta este archivo para compartirlo.
