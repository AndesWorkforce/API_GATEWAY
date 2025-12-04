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

---

## 📊 Colección ADT (Analytical Data Tables)

### Importar la Colección

1. Abre Postman
2. Click en **Import**
3. Selecciona el archivo `adt-collection.json`
4. La colección se importará con todos los endpoints ADT

### Configurar Variables

La colección usa las siguientes variables (puedes configurarlas en la colección o en el environment):

- `baseUrl`: URL base del API Gateway (default: `http://localhost:3001`)
- `accessToken`: Token de autenticación (se obtiene al hacer login)
- `contractorId`: ID del contractor para las consultas

### Endpoints Incluidos

#### 📊 Consultas (Requieren: Superadmin, TeamAdmin o Visualizer)

1. **Métricas Diarias** - `GET /adt/daily-metrics/:contractorId`
2. **Métricas en Tiempo Real** - `GET /adt/realtime-metrics/:contractorId`
3. **Resúmenes de Sesión** - `GET /adt/sessions/:contractorId`
4. **Actividad Detallada** - `GET /adt/activity/:contractorId`
5. **Uso de Aplicaciones** - `GET /adt/app-usage/:contractorId`
6. **Ranking de Productividad** - `GET /adt/ranking`

#### ⚙️ ETL (Solo Superadmin)

7. **Procesar Eventos** - `GET /adt/etl/process-events`
8. **Procesar Métricas Diarias** - `GET /adt/etl/process-daily-metrics`
9. **Procesar Resúmenes de Sesión** - `GET /adt/etl/process-session-summaries`

### Uso Rápido

1. **Configurar Token:**
   - Primero haz login usando la colección principal
   - El token se guardará automáticamente en `accessToken`

2. **Configurar Contractor ID:**
   - Edita la variable `contractorId` en la colección
   - O usa un ID específico directamente en la URL

3. **Ejecutar Consultas:**
   - Selecciona cualquier endpoint de consulta
   - Click en **Send**
   - Los resultados se mostrarán en la respuesta

### Notas

- Todos los endpoints requieren autenticación (Bearer Token)
- Los endpoints de ETL solo están disponibles para Superadmin
- El endpoint de "Métricas en Tiempo Real" usa caché de 30 segundos
- Para más detalles, consulta `ADT_ENDPOINTS.md` en la raíz del proyecto
