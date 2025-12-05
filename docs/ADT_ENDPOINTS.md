# Endpoints ADT - API Gateway

Este documento lista todos los endpoints HTTP disponibles para consultar las tablas ADT (Analytical Data Tables).

**Base URL:** `http://localhost:{PORT}/adt` (donde `{PORT}` es el puerto configurado en `envs.port`)

**Autenticación:** Todos los endpoints requieren autenticación y roles:

- `Superadmin`, `TeamAdmin`, `Visualizer` - Para consultas
- `Superadmin` - Para ejecutar ETL

---

## 📊 Endpoints de Consulta

### 1. Métricas Diarias

Obtiene métricas diarias de productividad de un contractor desde la tabla `contractor_daily_metrics`.

**Endpoint:** `GET /adt/daily-metrics/:contractorId`

**Parámetros:**

- `contractorId` (path) - ID del contractor
- `days` (query, opcional) - Número de días hacia atrás (default: 30)

**Ejemplo:**

```bash
GET /adt/daily-metrics/contractor-123?days=7
```

**Respuesta:**

```json
[
  {
    "contractor_id": "contractor-123",
    "workday": "2025-01-15",
    "total_beats": 1200,
    "active_beats": 900,
    "idle_beats": 300,
    "active_percentage": 75.0,
    "total_keyboard_inputs": 4500,
    "total_mouse_clicks": 1200,
    "avg_keyboard_per_min": 12.5,
    "avg_mouse_per_min": 3.3,
    "total_session_time_seconds": 18000,
    "effective_work_seconds": 13500,
    "productivity_score": 82.5,
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

---

### 2. Métricas en Tiempo Real ⚡

Obtiene métricas de productividad calculadas en tiempo real desde `contractor_activity_15s`. Ideal para dashboards que necesitan actualización frecuente.

**Endpoint:** `GET /adt/realtime-metrics/:contractorId`

**Parámetros:**

- `contractorId` (path) - ID del contractor
- `workday` (query, opcional) - Fecha del día (formato: `YYYY-MM-DD`). Si no se especifica, usa el día actual
- `from` (query, opcional) - Fecha de inicio del rango (formato: `YYYY-MM-DD`). Si se especifica junto con `to`, devuelve métricas agregadas del rango
- `to` (query, opcional) - Fecha de fin del rango (formato: `YYYY-MM-DD`). Debe usarse junto con `from`
- `useCache` (query, opcional) - Usar caché (default: `true`). Poner `false` para forzar recálculo

**Ejemplos:**

```bash
# Obtener métricas de un día específico
GET /adt/realtime-metrics/contractor-123?workday=2025-01-15&useCache=true

# Obtener métricas agregadas de un rango de fechas
GET /adt/realtime-metrics/contractor-123?from=2025-12-01&to=2025-12-05&useCache=true
```

**Nota:** Si se especifican `from` y `to`, se ignorará `workday` y se devolverán métricas agregadas del rango de fechas.

**Respuesta:**

```json
{
  "contractor_id": "contractor-123",
  "workday": "2025-01-15",
  "total_beats": 1200,
  "active_beats": 900,
  "idle_beats": 300,
  "active_percentage": 75.0,
  "total_keyboard_inputs": 4500,
  "total_mouse_clicks": 1200,
  "avg_keyboard_per_min": 12.5,
  "avg_mouse_per_min": 3.3,
  "total_session_time_seconds": 18000,
  "effective_work_seconds": 13500,
  "productivity_score": 82.5,
  "is_realtime": true,
  "calculated_at": "2025-01-15T10:30:00.000Z"
}
```

**Nota:** Este endpoint usa caché de 30 segundos para optimizar performance. Para datos históricos, usa `/daily-metrics`.

---

### 3. Resúmenes de Sesión

Obtiene resúmenes de sesiones de trabajo de un contractor.

**Endpoint:** `GET /adt/sessions/:contractorId`

**Parámetros:**

- `contractorId` (path) - ID del contractor
- `days` (query, opcional) - Número de días hacia atrás (default: 30)

**Ejemplo:**

```bash
GET /adt/sessions/contractor-123?days=7
```

**Respuesta:**

```json
[
  {
    "session_id": "session-456",
    "contractor_id": "contractor-123",
    "session_start": "2025-01-15T09:00:00Z",
    "session_end": "2025-01-15T17:00:00Z",
    "total_seconds": 28800,
    "active_seconds": 21600,
    "idle_seconds": 7200,
    "productivity_score": 82.5,
    "created_at": "2025-01-15T17:00:00Z"
  }
]
```

---

### 4. Actividad Detallada

Obtiene actividad detallada (beats de 15 segundos) de un contractor.

**Endpoint:** `GET /adt/activity/:contractorId`

**Parámetros:**

- `contractorId` (path) - ID del contractor
- `from` (query, opcional) - Fecha de inicio (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)
- `to` (query, opcional) - Fecha de fin (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)
- `limit` (query, opcional) - Límite de resultados (default: 1000)

**Ejemplo:**

```bash
GET /adt/activity/contractor-123?from=2025-01-15&to=2025-01-15&limit=100
```

**Respuesta:**

```json
[
  {
    "contractor_id": "contractor-123",
    "agent_id": "agent-789",
    "session_id": "session-456",
    "agent_session_id": "agent-session-101",
    "beat_timestamp": "2025-01-15T09:00:00Z",
    "is_idle": false,
    "keyboard_count": 45,
    "mouse_clicks": 12,
    "workday": "2025-01-15"
  }
]
```

---

### 5. Uso de Aplicaciones

Obtiene uso de aplicaciones de un contractor.

**Endpoint:** `GET /adt/app-usage/:contractorId`

**Parámetros:**

- `contractorId` (path) - ID del contractor
- `from` (query, opcional) - Fecha inicio (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)
- `to` (query, opcional) - Fecha fin (`YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)

> Compatibilidad: también acepta `days` si no se envían `from/to`, pero se recomienda `from/to`.

**Ejemplo:**

```bash
GET /adt/app-usage/contractor-123?days=7
```

**Respuesta:**

```json
[
  {
    "contractor_id": "contractor-123",
    "app_name": "Code",
    "workday": "2025-01-15",
    "active_beats": 800,
    "created_at": "2025-01-15T10:00:00Z"
  },
  {
    "contractor_id": "contractor-123",
    "app_name": "Chrome",
    "workday": "2025-01-15",
    "active_beats": 400,
    "created_at": "2025-01-15T10:00:00Z"
  }
]
```

---

### 6. Ranking de Productividad

Obtiene ranking de productividad por día.

**Endpoint:** `GET /adt/ranking`

**Parámetros:**

- `workday` (query, opcional) - Fecha del día (formato: `YYYY-MM-DD`). Si no se especifica, usa el día anterior
- `limit` (query, opcional) - Número de resultados (default: 10)

**Ejemplo:**

```bash
GET /adt/ranking?workday=2025-01-15&limit=20
```

**Respuesta:**

```json
[
  {
    "contractor_id": "contractor-123",
    "workday": "2025-01-15",
    "total_beats": 1200,
    "active_beats": 900,
    "active_percentage": 75.0,
    "productivity_score": 82.5,
    "total_keyboard_inputs": 4500,
    "total_mouse_clicks": 1200,
    "effective_work_seconds": 13500
  }
]
```

---

## ⚙️ Endpoints de ETL (Solo Superadmin)

### 7. Procesar Eventos

Ejecuta ETL para convertir eventos RAW en beats de 15 segundos (`contractor_activity_15s`).

**Endpoint:** `GET /adt/etl/process-events`

**Parámetros:**

- `from` (query, opcional) - Fecha de inicio (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)
- `to` (query, opcional) - Fecha de fin (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)

**Ejemplo:**

```bash
GET /adt/etl/process-events?from=2025-01-15&to=2025-01-15
```

**Respuesta:**

```json
{
  "message": "Events processed successfully",
  "count": 1500
}
```

---

### 8. Procesar Eventos (FORCE)

Ejecuta ETL con `DELETE + INSERT` sobre `contractor_activity_15s` para el rango indicado (backfill duro).

**Endpoint:** `GET /adt/etl/process-events-force`

**Parámetros:**

- `from` (query, opcional) - Fecha de inicio (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)
- `to` (query, opcional) - Fecha de fin (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)

---

### 9. Procesar Métricas Diarias

Ejecuta ETL para generar métricas diarias desde `contractor_activity_15s`.

**Endpoint:** `GET /adt/etl/process-daily-metrics`

**Parámetros:**

- `workday` (query, opcional) - Día único a procesar (`YYYY-MM-DD`)
- `from` (query, opcional) - Día inicio del rango (`YYYY-MM-DD`)
- `to` (query, opcional) - Día fin del rango (`YYYY-MM-DD`)

Si no se especifican parámetros, procesa el día actual por defecto.

**Ejemplo:**

```bash
GET /adt/etl/process-daily-metrics?workday=2025-01-15
```

**Respuesta:**

```json
{
  "message": "Daily metrics processed successfully",
  "count": 50,
  "metrics": [...]
}
```

---

### 10. Procesar Resúmenes de Sesión

Ejecuta ETL para generar resúmenes de sesión desde `contractor_activity_15s`.

**Endpoint:** `GET /adt/etl/process-session-summaries`

**Parámetros:**

- `sessionId` (query, opcional) - ID de sesión específica. Si no se especifica, procesa todas las sesiones

**Ejemplo:**

```bash
GET /adt/etl/process-session-summaries?sessionId=session-456
```

**Respuesta:**

```json
{
  "message": "Session summaries processed successfully",
  "count": 10,
  "summaries": [...]
}
```

---

### 11. Procesar Uso de Aplicaciones

Ejecuta ETL para convertir eventos RAW en uso de aplicaciones (`app_usage_summary`).

**Endpoint:** `GET /adt/etl/process-app-usage`

**Parámetros:**

- `from` (query, opcional) - Fecha de inicio (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)
- `to` (query, opcional) - Fecha de fin (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)

**Ejemplo:**

```bash
GET /adt/etl/process-app-usage?from=2025-01-15&to=2025-01-15
```

**Respuesta:**

```json
{
  "message": "App usage processed successfully",
  "count": 150
}
```

**Nota:** Este ETL puede ejecutarse en paralelo con `process-events` porque ambos leen desde `events_raw` pero generan tablas diferentes.

---

### 12. Procesar Uso de Aplicaciones (FORCE)

Ejecuta ETL con `DELETE + INSERT` sobre `app_usage_summary` para el rango indicado.

**Endpoint:** `GET /adt/etl/process-app-usage-force`

**Parámetros:**

- `from` (query, opcional) - Fecha de inicio (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)
- `to` (query, opcional) - Fecha de fin (formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`)

---

## 📝 Notas Importantes

1. **Autenticación:** Todos los endpoints requieren un token de autenticación válido en el header `Authorization: Bearer {token}`

2. **Roles:**
   - Consultas: `Superadmin`, `TeamAdmin`, `Visualizer`
   - ETL: Solo `Superadmin`

3. **Formato de Fechas:**
   - `YYYY-MM-DD` - Para días completos
   - `YYYY-MM-DDTHH:mm:ss` - Para timestamps específicos
   - `YYYY-MM-DDTHH:mm:ssZ` - Con timezone UTC

4. **Caché:**
   - El endpoint `/realtime-metrics` usa caché de 30 segundos
   - Para forzar recálculo, usar `useCache=false`

5. **Límites:**
   - El endpoint `/activity` tiene un límite por defecto de 1000 resultados
   - Ajustar con el parámetro `limit` según necesidad

6. **Performance:**
   - `/realtime-metrics` está optimizado para dashboards (caché + cálculo on-demand)
   - `/daily-metrics` es más rápido para consultas históricas (datos pre-calculados)

---

## 🔄 Flujo Recomendado

### Para Dashboards en Tiempo Real:

```bash
# Consultar cada 30 segundos
GET /adt/realtime-metrics/{contractorId}
```

### Para Reportes Históricos:

```bash
# Consultar métricas diarias
GET /adt/daily-metrics/{contractorId}?days=30

# Consultar sesiones
GET /adt/sessions/{contractorId}?days=30

# Consultar uso de apps
GET /adt/app-usage/{contractorId}?days=30
```

### Para Análisis Detallado:

```bash
# Actividad granular (beats de 15s)
GET /adt/activity/{contractorId}?from=2025-01-15&to=2025-01-15&limit=500
```

### Para Procesar Datos:

```bash
# Procesar eventos RAW → beats de 15s
GET /adt/etl/process-events?from=2025-01-15&to=2025-01-15

# Reprocesar (FORCE) actividad
GET /adt/etl/process-events-force?from=2025-01-15&to=2025-01-15

# Procesar eventos RAW → uso de aplicaciones (puede ejecutarse en paralelo)
GET /adt/etl/process-app-usage?from=2025-01-15&to=2025-01-15

# Reprocesar (FORCE) uso de apps
GET /adt/etl/process-app-usage-force?from=2025-01-15&to=2025-01-15

# Procesar beats → métricas diarias
GET /adt/etl/process-daily-metrics            # día actual por defecto
# o un día específico
GET /adt/etl/process-daily-metrics?workday=2025-01-15
# o rango de días
GET /adt/etl/process-daily-metrics?from=2025-01-01&to=2025-01-31

# Procesar beats → resúmenes de sesión
GET /adt/etl/process-session-summaries
```
