# Guía Detallada de Endpoints ADT

> Actualización (ADTs y ETL):
>
> - Nuevas rutas FORCE para backfill duro:
>   - `GET /adt/etl/process-events-force?from=&to=` (borra e inserta `contractor_activity_15s`)
>   - `GET /adt/etl/process-app-usage-force?from=&to=` (borra e inserta `app_usage_summary`)
> - `GET /adt/etl/process-daily-metrics` procesa el día ACTUAL por defecto si no se envían parámetros y ahora acepta `from` y `to` para rango.
> - `GET /adt/app-usage/:contractorId` admite `from`/`to` (además de `days` por compatibilidad).

Esta guía explica en detalle cómo usar cada endpoint ADT, qué parámetros necesita, qué formato usar, y qué respuesta esperar.

---

## 📋 Tabla de Contenidos

1. [Configuración Inicial](#configuración-inicial)
2. [Endpoints de Consulta](#endpoints-de-consulta)
   - [Métricas Diarias](#1-métricas-diarias)
   - [Métricas en Tiempo Real](#2-métricas-en-tiempo-real)
   - [Resúmenes de Sesión](#3-resúmenes-de-sesión)
   - [Actividad Detallada](#4-actividad-detallada)
   - [Uso de Aplicaciones](#5-uso-de-aplicaciones)
   - [Ranking de Productividad](#6-ranking-de-productividad)
3. [Endpoints de ETL](#endpoints-de-etl)
   - [Procesar Eventos](#7-procesar-eventos)
   - [Procesar Métricas Diarias](#8-procesar-métricas-diarias)
   - [Procesar Resúmenes de Sesión](#9-procesar-resúmenes-de-sesión)
   - [Procesar Uso de Aplicaciones](#10-procesar-uso-de-aplicaciones)
4. [Formatos de Fecha](#formatos-de-fecha)
5. [Ejemplos Prácticos](#ejemplos-prácticos)

---

## Configuración Inicial

### Base URL

```
http://localhost:3001/adt
```

_(Ajusta el puerto según tu configuración)_

### Autenticación

Todos los endpoints requieren un token Bearer en el header:

```
Authorization: Bearer {tu_token_aqui}
```

### Roles Requeridos

- **Consultas**: `Superadmin`, `TeamAdmin`, o `Visualizer`
- **ETL**: Solo `Superadmin`

---

## Endpoints de Consulta

### 1. Métricas Diarias

**Endpoint:** `GET /adt/daily-metrics/:contractorId`

**Descripción:**
Obtiene métricas diarias de productividad de un contractor desde la tabla `contractor_daily_metrics`. Estas métricas están pre-calculadas y son ideales para reportes históricos y análisis de tendencias.

**Parámetros:**

| Parámetro      | Tipo   | Ubicación | Requerido | Descripción                                        | Ejemplo          |
| -------------- | ------ | --------- | --------- | -------------------------------------------------- | ---------------- |
| `contractorId` | String | Path      | ✅ Sí     | ID del contractor                                  | `contractor-123` |
| `days`         | Number | Query     | ❌ No     | Número de días hacia atrás desde hoy (default: 30) | `7`, `30`, `90`  |

**Ejemplos de Uso:**

```bash
# Obtener métricas de los últimos 30 días (default)
GET /adt/daily-metrics/contractor-123

# Obtener métricas de los últimos 7 días
GET /adt/daily-metrics/contractor-123?days=7

# Obtener métricas de los últimos 90 días
GET /adt/daily-metrics/contractor-123?days=90
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
  },
  {
    "contractor_id": "contractor-123",
    "workday": "2025-01-14",
    "total_beats": 1100,
    "active_beats": 850,
    "idle_beats": 250,
    "active_percentage": 77.27,
    "total_keyboard_inputs": 4200,
    "total_mouse_clicks": 1100,
    "avg_keyboard_per_min": 12.7,
    "avg_mouse_per_min": 3.3,
    "total_session_time_seconds": 16500,
    "effective_work_seconds": 12750,
    "productivity_score": 84.2,
    "created_at": "2025-01-14T10:00:00Z"
  }
]
```

**Campos de la Respuesta:**

| Campo                        | Tipo     | Descripción                                                       |
| ---------------------------- | -------- | ----------------------------------------------------------------- |
| `contractor_id`              | String   | ID del contractor                                                 |
| `workday`                    | Date     | Fecha del día (YYYY-MM-DD)                                        |
| `total_beats`                | Number   | Total de beats de 15 segundos registrados                         |
| `active_beats`               | Number   | Beats donde el contractor estuvo activo (no idle)                 |
| `idle_beats`                 | Number   | Beats donde el contractor estuvo idle                             |
| `active_percentage`          | Number   | Porcentaje de tiempo activo (0-100)                               |
| `total_keyboard_inputs`      | Number   | Total de inputs de teclado del día                                |
| `total_mouse_clicks`         | Number   | Total de clicks de mouse del día                                  |
| `avg_keyboard_per_min`       | Number   | Promedio de inputs de teclado por minuto                          |
| `avg_mouse_per_min`          | Number   | Promedio de clicks de mouse por minuto                            |
| `total_session_time_seconds` | Number   | Tiempo total de sesión en segundos                                |
| `effective_work_seconds`     | Number   | Tiempo efectivo de trabajo (activo) en segundos                   |
| `productivity_score`         | Number   | Score de productividad (0-100) calculado con fórmula multi-factor |
| `created_at`                 | DateTime | Fecha y hora de creación del registro                             |

**Notas:**

- Los resultados están ordenados por `workday` descendente (más reciente primero)
- Si no hay datos para el rango especificado, retorna un array vacío `[]`
- El `productivity_score` incluye: tiempo activo (35%), intensidad de inputs (20%), apps productivas (30%), y web productiva (15%)

---

### 2. Métricas en Tiempo Real

**Endpoint:** `GET /adt/realtime-metrics/:contractorId`

**Descripción:**
Calcula métricas de productividad en tiempo real desde `contractor_activity_15s`. Este endpoint es ideal para dashboards que necesitan actualización frecuente (cada 30 segundos). Usa caché de 30 segundos para optimizar performance.

**Parámetros:**

| Parámetro      | Tipo    | Ubicación | Requerido | Descripción                                                        | Ejemplo          |
| -------------- | ------- | --------- | --------- | ------------------------------------------------------------------ | ---------------- |
| `contractorId` | String  | Path      | ✅ Sí     | ID del contractor                                                  | `contractor-123` |
| `workday`      | String  | Query     | ❌ No     | Fecha del día (YYYY-MM-DD). Si no se especifica, usa el día actual | `2025-01-15`     |
| `useCache`     | Boolean | Query     | ❌ No     | Usar caché (default: `true`). Poner `false` para forzar recálculo  | `true`, `false`  |

**Ejemplos de Uso:**

```bash
# Obtener métricas en tiempo real del día actual (con caché)
GET /adt/realtime-metrics/contractor-123

# Obtener métricas en tiempo real del día actual (sin caché, forzar recálculo)
GET /adt/realtime-metrics/contractor-123?useCache=false

# Obtener métricas en tiempo real de un día específico
GET /adt/realtime-metrics/contractor-123?workday=2025-01-15

# Obtener métricas en tiempo real de un día específico sin caché
GET /adt/realtime-metrics/contractor-123?workday=2025-01-15&useCache=false
```

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

**Campos Adicionales vs Métricas Diarias:**

| Campo           | Tipo     | Descripción                                               |
| --------------- | -------- | --------------------------------------------------------- |
| `is_realtime`   | Boolean  | Siempre `true` para indicar que es cálculo en tiempo real |
| `calculated_at` | DateTime | Timestamp exacto de cuándo se calculó la métrica          |

**Notas:**

- ⚡ **Performance**: Usa caché de 30 segundos. Si consultas dentro de 30 segundos, retorna el resultado cacheado
- 📊 **Uso recomendado**: Para dashboards que se actualizan cada 30 segundos
- 🔄 **Diferencia con daily-metrics**: Este endpoint calcula on-demand desde `contractor_activity_15s`, mientras que `daily-metrics` lee desde datos pre-calculados
- ⏱️ **Latencia**: < 1 segundo con caché, 2-5 segundos sin caché

---

### 3. Resúmenes de Sesión

**Endpoint:** `GET /adt/sessions/:contractorId`

**Descripción:**
Obtiene resúmenes de sesiones de trabajo de un contractor. Cada sesión representa un período de trabajo continuo con métricas agregadas.

**Parámetros:**

| Parámetro      | Tipo   | Ubicación | Requerido | Descripción                                        | Ejemplo          |
| -------------- | ------ | --------- | --------- | -------------------------------------------------- | ---------------- |
| `contractorId` | String | Path      | ✅ Sí     | ID del contractor                                  | `contractor-123` |
| `days`         | Number | Query     | ❌ No     | Número de días hacia atrás desde hoy (default: 30) | `7`, `30`, `90`  |

**Ejemplos de Uso:**

```bash
# Obtener resúmenes de sesiones de los últimos 30 días (default)
GET /adt/sessions/contractor-123

# Obtener resúmenes de sesiones de los últimos 7 días
GET /adt/sessions/contractor-123?days=7

# Obtener resúmenes de sesiones de los últimos 90 días
GET /adt/sessions/contractor-123?days=90
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
  },
  {
    "session_id": "session-455",
    "contractor_id": "contractor-123",
    "session_start": "2025-01-14T08:30:00Z",
    "session_end": "2025-01-14T16:45:00Z",
    "total_seconds": 29700,
    "active_seconds": 22500,
    "idle_seconds": 7200,
    "productivity_score": 85.2,
    "created_at": "2025-01-14T16:45:00Z"
  }
]
```

**Campos de la Respuesta:**

| Campo                | Tipo     | Descripción                                 |
| -------------------- | -------- | ------------------------------------------- |
| `session_id`         | String   | ID único de la sesión                       |
| `contractor_id`      | String   | ID del contractor                           |
| `session_start`      | DateTime | Fecha y hora de inicio de la sesión         |
| `session_end`        | DateTime | Fecha y hora de fin de la sesión            |
| `total_seconds`      | Number   | Duración total de la sesión en segundos     |
| `active_seconds`     | Number   | Tiempo activo (no idle) en segundos         |
| `idle_seconds`       | Number   | Tiempo idle en segundos                     |
| `productivity_score` | Number   | Score de productividad de la sesión (0-100) |
| `created_at`         | DateTime | Fecha y hora de creación del resumen        |

**Notas:**

- Los resultados están ordenados por `session_start` descendente (más reciente primero)
- Una sesión puede durar varias horas o todo el día
- El `productivity_score` se calcula usando la misma fórmula multi-factor que las métricas diarias

---

### 4. Actividad Detallada

**Endpoint:** `GET /adt/activity/:contractorId`

**Descripción:**
Obtiene actividad detallada (beats de 15 segundos) de un contractor. Cada beat representa exactamente lo que pasó en un intervalo de 15 segundos. Útil para análisis granular y debugging.

**Parámetros:**

| Parámetro      | Tipo   | Ubicación | Requerido | Descripción                                                         | Ejemplo                              |
| -------------- | ------ | --------- | --------- | ------------------------------------------------------------------- | ------------------------------------ |
| `contractorId` | String | Path      | ✅ Sí     | ID del contractor                                                   | `contractor-123`                     |
| `from`         | String | Query     | ❌ No     | Fecha/hora de inicio. Formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss` | `2025-01-15` o `2025-01-15T09:00:00` |
| `to`           | String | Query     | ❌ No     | Fecha/hora de fin. Formato: `YYYY-MM-DD` o `YYYY-MM-DDTHH:mm:ss`    | `2025-01-15` o `2025-01-15T17:00:00` |
| `limit`        | Number | Query     | ❌ No     | Límite de resultados (default: 1000, máximo recomendado: 10000)     | `100`, `1000`, `5000`                |

**Ejemplos de Uso:**

```bash
# Obtener últimos 1000 beats (default) sin filtro de fecha
GET /adt/activity/contractor-123

# Obtener actividad de un día específico
GET /adt/activity/contractor-123?from=2025-01-15&to=2025-01-15

# Obtener actividad de un rango de fechas
GET /adt/activity/contractor-123?from=2025-01-15&to=2025-01-20

# Obtener actividad de un rango de horas específico
GET /adt/activity/contractor-123?from=2025-01-15T09:00:00&to=2025-01-15T17:00:00

# Obtener solo los últimos 100 beats
GET /adt/activity/contractor-123?limit=100

# Obtener actividad de un día con límite personalizado
GET /adt/activity/contractor-123?from=2025-01-15&to=2025-01-15&limit=500
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
  },
  {
    "contractor_id": "contractor-123",
    "agent_id": "agent-789",
    "session_id": "session-456",
    "agent_session_id": "agent-session-101",
    "beat_timestamp": "2025-01-15T09:00:15Z",
    "is_idle": false,
    "keyboard_count": 38,
    "mouse_clicks": 8,
    "workday": "2025-01-15"
  },
  {
    "contractor_id": "contractor-123",
    "agent_id": "agent-789",
    "session_id": "session-456",
    "agent_session_id": "agent-session-101",
    "beat_timestamp": "2025-01-15T09:00:30Z",
    "is_idle": true,
    "keyboard_count": 0,
    "mouse_clicks": 0,
    "workday": "2025-01-15"
  }
]
```

**Campos de la Respuesta:**

| Campo              | Tipo     | Descripción                                                                     |
| ------------------ | -------- | ------------------------------------------------------------------------------- |
| `contractor_id`    | String   | ID del contractor                                                               |
| `agent_id`         | String   | ID del agente que capturó el beat                                               |
| `session_id`       | String   | ID de la sesión de trabajo                                                      |
| `agent_session_id` | String   | ID de la sesión del agente                                                      |
| `beat_timestamp`   | DateTime | Timestamp exacto del beat (inicio del intervalo de 15s)                         |
| `is_idle`          | Boolean  | `true` si el contractor estuvo idle durante este beat, `false` si estuvo activo |
| `keyboard_count`   | Number   | Cantidad de inputs de teclado en este beat (15 segundos)                        |
| `mouse_clicks`     | Number   | Cantidad de clicks de mouse en este beat (15 segundos)                          |
| `workday`          | Date     | Fecha del día (YYYY-MM-DD)                                                      |

**Notas:**

- ⚠️ **Volumen de datos**: Un día completo puede tener ~5,760 beats (24 horas × 60 minutos × 4 beats/minuto)
- 📊 **Uso recomendado**: Para análisis detallado, debugging, o visualizaciones granulares
- 🔍 **Filtrado**: Siempre usa `from` y `to` para limitar el rango y evitar respuestas muy grandes
- ⏱️ **Performance**: Con `limit=1000` o menos, la respuesta es rápida. Con más de 5000 beats puede tardar varios segundos

---

### 5. Uso de Aplicaciones

**Endpoint:** `GET /adt/app-usage/:contractorId`

**Descripción:**
Obtiene uso de aplicaciones de un contractor. Muestra qué aplicaciones usó y cuántos beats activos tuvo cada una.

**Parámetros:**

| Parámetro      | Tipo   | Ubicación | Requerido | Descripción                                        | Ejemplo          |
| -------------- | ------ | --------- | --------- | -------------------------------------------------- | ---------------- |
| `contractorId` | String | Path      | ✅ Sí     | ID del contractor                                  | `contractor-123` |
| `days`         | Number | Query     | ❌ No     | Número de días hacia atrás desde hoy (default: 30) | `7`, `30`, `90`  |

**Ejemplos de Uso:**

```bash
# Obtener uso de aplicaciones de los últimos 30 días (default)
GET /adt/app-usage/contractor-123

# Obtener uso de aplicaciones de los últimos 7 días
GET /adt/app-usage/contractor-123?days=7

# Obtener uso de aplicaciones de los últimos 90 días
GET /adt/app-usage/contractor-123?days=90
```

**Respuesta:**

La respuesta es un **array plano** donde cada objeto representa **una aplicación en un día específico**. Si consultas un rango de días, tendrás múltiples objetos con el mismo `app_name` pero diferentes `workday`.

**Ejemplo: Consulta de 3 días donde el contractor usó "Code" todos los días, "Chrome" 2 días y "Slack" 1 día:**

```json
[
  // Día 1 (2025-01-15)
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
  },
  {
    "contractor_id": "contractor-123",
    "app_name": "Slack",
    "workday": "2025-01-15",
    "active_beats": 200,
    "created_at": "2025-01-15T10:00:00Z"
  },
  // Día 2 (2025-01-14)
  {
    "contractor_id": "contractor-123",
    "app_name": "Code",
    "workday": "2025-01-14",
    "active_beats": 750,
    "created_at": "2025-01-14T10:00:00Z"
  },
  {
    "contractor_id": "contractor-123",
    "app_name": "Chrome",
    "workday": "2025-01-14",
    "active_beats": 350,
    "created_at": "2025-01-14T10:00:00Z"
  },
  // Día 3 (2025-01-13)
  {
    "contractor_id": "contractor-123",
    "app_name": "Code",
    "workday": "2025-01-13",
    "active_beats": 820,
    "created_at": "2025-01-13T10:00:00Z"
  }
]
```

**Estructura:**

- ✅ **Cada objeto = 1 app en 1 día**
- ✅ **Múltiples objetos con el mismo `app_name`** si la app se usó varios días
- ✅ **`workday` es siempre un string de fecha** (no un array)
- ✅ **Para obtener el total de una app en el rango**, suma los `active_beats` de todos los objetos con el mismo `app_name`

**Campos de la Respuesta:**

| Campo           | Tipo     | Descripción                                                   |
| --------------- | -------- | ------------------------------------------------------------- |
| `contractor_id` | String   | ID del contractor                                             |
| `app_name`      | String   | Nombre de la aplicación (ej: "Code", "Chrome", "Slack")       |
| `workday`       | Date     | Fecha del día (YYYY-MM-DD)                                    |
| `active_beats`  | Number   | Cantidad de beats de 15 segundos donde esta app estuvo activa |
| `created_at`    | DateTime | Fecha y hora de creación del registro                         |

**Notas:**

- Los resultados están ordenados por `workday` descendente (más reciente primero) y luego por `active_beats` descendente
- `active_beats` representa el tiempo de uso: 1 beat = 15 segundos, así que 800 beats = 12,000 segundos = 200 minutos = 3.33 horas
- **Estructura de la respuesta**: Cada objeto en el array representa **una aplicación en un día específico**. Si consultas un rango de días (ej: 7 días) y el contractor usó "Code" todos los días, tendrás **7 objetos diferentes** con el mismo `app_name` pero diferentes `workday`
- **Ejemplo con rango de 7 días**: Si el contractor usó "Code" los 7 días, "Chrome" 5 días y "Slack" 3 días, obtendrás aproximadamente 15 objetos en el array (7 + 5 + 3)
- Para calcular el tiempo total de una app en un día: `active_beats × 15 / 60` = minutos
- Para obtener el tiempo total de una app en todo el rango, necesitas sumar los `active_beats` de todos los objetos con el mismo `app_name`

**Ejemplo de procesamiento en JavaScript:**

```javascript
// Agrupar por app_name y sumar beats
const appUsage = response.data; // Array de objetos
const totalsByApp = {};

appUsage.forEach((item) => {
  if (!totalsByApp[item.app_name]) {
    totalsByApp[item.app_name] = {
      app_name: item.app_name,
      total_beats: 0,
      days_used: 0,
    };
  }
  totalsByApp[item.app_name].total_beats += item.active_beats;
  totalsByApp[item.app_name].days_used += 1;
});

// Convertir a array y calcular tiempo total en horas
const summary = Object.values(totalsByApp).map((app) => ({
  app_name: app.app_name,
  total_beats: app.total_beats,
  total_minutes: (app.total_beats * 15) / 60,
  total_hours: (app.total_beats * 15) / 3600,
  days_used: app.days_used,
}));

// Resultado:
// [
//   { app_name: "Code", total_beats: 2370, total_minutes: 592.5, total_hours: 9.875, days_used: 7 },
//   { app_name: "Chrome", total_beats: 1200, total_minutes: 300, total_hours: 5, days_used: 5 },
//   { app_name: "Slack", total_beats: 600, total_minutes: 150, total_hours: 2.5, days_used: 3 }
// ]
```

---

### 6. Ranking de Productividad

**Endpoint:** `GET /adt/ranking`

**Descripción:**
Obtiene ranking de productividad por día. Muestra los contractors con mayor productividad score ordenados de mayor a menor.

**Parámetros:**

| Parámetro | Tipo   | Ubicación | Requerido | Descripción                                                          | Ejemplo          |
| --------- | ------ | --------- | --------- | -------------------------------------------------------------------- | ---------------- |
| `workday` | String | Query     | ❌ No     | Fecha del día (YYYY-MM-DD). Si no se especifica, usa el día anterior | `2025-01-15`     |
| `limit`   | Number | Query     | ❌ No     | Número de resultados (default: 10)                                   | `10`, `20`, `50` |

**Ejemplos de Uso:**

```bash
# Obtener top 10 del día anterior (default)
GET /adt/ranking

# Obtener top 10 de un día específico
GET /adt/ranking?workday=2025-01-15

# Obtener top 20 de un día específico
GET /adt/ranking?workday=2025-01-15&limit=20

# Obtener top 50 del día anterior
GET /adt/ranking?limit=50
```

**Respuesta:**

```json
[
  {
    "contractor_id": "contractor-456",
    "workday": "2025-01-15",
    "total_beats": 1400,
    "active_beats": 1200,
    "active_percentage": 85.71,
    "productivity_score": 92.5,
    "total_keyboard_inputs": 6000,
    "total_mouse_clicks": 1500,
    "effective_work_seconds": 18000
  },
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
  },
  {
    "contractor_id": "contractor-789",
    "workday": "2025-01-15",
    "total_beats": 1000,
    "active_beats": 700,
    "active_percentage": 70.0,
    "productivity_score": 78.3,
    "total_keyboard_inputs": 3500,
    "total_mouse_clicks": 900,
    "effective_work_seconds": 10500
  }
]
```

**Campos de la Respuesta:**

| Campo                    | Tipo   | Descripción                                         |
| ------------------------ | ------ | --------------------------------------------------- |
| `contractor_id`          | String | ID del contractor                                   |
| `workday`                | Date   | Fecha del día (YYYY-MM-DD)                          |
| `total_beats`            | Number | Total de beats del día                              |
| `active_beats`           | Number | Beats activos del día                               |
| `active_percentage`      | Number | Porcentaje de tiempo activo (0-100)                 |
| `productivity_score`     | Number | Score de productividad (0-100) - usado para ordenar |
| `total_keyboard_inputs`  | Number | Total de inputs de teclado                          |
| `total_mouse_clicks`     | Number | Total de clicks de mouse                            |
| `effective_work_seconds` | Number | Tiempo efectivo de trabajo en segundos              |

**Notas:**

- Los resultados están ordenados por `productivity_score` descendente (mayor score primero)
- Si no se especifica `workday`, usa el día anterior (no el día actual, porque puede estar incompleto)
- Útil para comparar productividad entre contractors
- El `productivity_score` es el mismo cálculo multi-factor usado en otras métricas

---

## Endpoints de ETL

### 7. Procesar Eventos

**Endpoint:** `GET /adt/etl/process-events`

**Descripción:**
Ejecuta el proceso ETL para convertir eventos RAW (desde `events_raw`) en beats de 15 segundos (en `contractor_activity_15s`). Este es el primer paso del pipeline ETL.

**⚠️ Requiere rol: `Superadmin`**

**Parámetros:**

| Parámetro | Tipo   | Ubicación | Requerido | Descripción                                                                     | Ejemplo                              |
| --------- | ------ | --------- | --------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| `from`    | String | Query     | ❌ No     | Fecha/hora de inicio. Si no se especifica, procesa todos los eventos pendientes | `2025-01-15` o `2025-01-15T00:00:00` |
| `to`      | String | Query     | ❌ No     | Fecha/hora de fin. Si no se especifica, procesa todos los eventos pendientes    | `2025-01-15` o `2025-01-15T23:59:59` |

**Ejemplos de Uso:**

```bash
# Procesar todos los eventos pendientes (sin filtro de fecha)
GET /adt/etl/process-events

# Procesar eventos de un día específico
GET /adt/etl/process-events?from=2025-01-15&to=2025-01-15

# Procesar eventos de un rango de fechas
GET /adt/etl/process-events?from=2025-01-15&to=2025-01-20

# Procesar eventos de un rango de horas específico
GET /adt/etl/process-events?from=2025-01-15T09:00:00&to=2025-01-15T17:00:00
```

**Respuesta:**

```json
{
  "message": "Events processed successfully",
  "count": 1500
}
```

**Campos de la Respuesta:**

| Campo     | Tipo   | Descripción                                          |
| --------- | ------ | ---------------------------------------------------- |
| `message` | String | Mensaje de confirmación                              |
| `count`   | Number | Cantidad de eventos procesados y convertidos a beats |

**Notas:**

- ⚠️ **Procesamiento**: Puede tardar varios segundos o minutos dependiendo de la cantidad de eventos
- 🔄 **Idempotencia**: Si procesas el mismo rango dos veces, puede crear duplicados. Usa con cuidado
- 📊 **Uso recomendado**: Ejecutar periódicamente (ej: cada 15 minutos) o después de importar datos masivos
- ⏱️ **Performance**: Procesa ~100-500 eventos por segundo dependiendo del tamaño del payload

---

### 8. Procesar Métricas Diarias

**Endpoint:** `GET /adt/etl/process-daily-metrics`

**Descripción:**
Ejecuta el proceso ETL para generar métricas diarias desde `contractor_activity_15s` y guardarlas en `contractor_daily_metrics`. Este es el segundo paso del pipeline ETL.

**⚠️ Requiere rol: `Superadmin`**

**Parámetros:**

| Parámetro | Tipo   | Ubicación | Requerido | Descripción                                                                         | Ejemplo      |
| --------- | ------ | --------- | --------- | ----------------------------------------------------------------------------------- | ------------ |
| `workday` | String | Query     | ❌ No     | Fecha del día a procesar (YYYY-MM-DD). Si no se especifica, procesa el día anterior | `2025-01-15` |

**Ejemplos de Uso:**

```bash
# Procesar métricas del día anterior (default)
GET /adt/etl/process-daily-metrics

# Procesar métricas de un día específico
GET /adt/etl/process-daily-metrics?workday=2025-01-15

# Procesar métricas de hoy (si ya terminó el día)
GET /adt/etl/process-daily-metrics?workday=2025-01-16
```

**Respuesta:**

```json
{
  "message": "Daily metrics processed successfully",
  "count": 50,
  "metrics": [
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
      "productivity_score": 82.5
    }
    // ... más métricas
  ]
}
```

**Campos de la Respuesta:**

| Campo     | Tipo   | Descripción                                                  |
| --------- | ------ | ------------------------------------------------------------ |
| `message` | String | Mensaje de confirmación                                      |
| `count`   | Number | Cantidad de métricas diarias generadas (una por contractor)  |
| `metrics` | Array  | Array con todas las métricas generadas (útil para verificar) |

**Notas:**

- ⚠️ **Re-procesamiento**: Si procesas el mismo día dos veces, puede crear duplicados o actualizar métricas existentes
- 📊 **Uso recomendado**: Ejecutar una vez al día (ej: a las 2 AM) para procesar el día anterior
- 🔄 **Dependencias**: Requiere que `contractor_activity_15s` tenga datos para el día especificado
- ⏱️ **Performance**: Procesa ~10-50 contractors por segundo

---

### 9. Procesar Resúmenes de Sesión

**Endpoint:** `GET /adt/etl/process-session-summaries`

**Descripción:**
Ejecuta el proceso ETL para generar resúmenes de sesión desde `contractor_activity_15s` y guardarlos en `session_summary`. Agrupa beats por `session_id` y calcula métricas agregadas.

**⚠️ Requiere rol: `Superadmin`**

**Parámetros:**

| Parámetro   | Tipo   | Ubicación | Requerido | Descripción                                                                         | Ejemplo       |
| ----------- | ------ | --------- | --------- | ----------------------------------------------------------------------------------- | ------------- |
| `sessionId` | String | Query     | ❌ No     | ID de sesión específica. Si no se especifica, procesa todas las sesiones pendientes | `session-456` |

**Ejemplos de Uso:**

```bash
# Procesar todas las sesiones pendientes (sin filtro)
GET /adt/etl/process-session-summaries

# Procesar una sesión específica
GET /adt/etl/process-session-summaries?sessionId=session-456
```

**Respuesta:**

```json
{
  "message": "Session summaries processed successfully",
  "count": 10,
  "summaries": [
    {
      "session_id": "session-456",
      "contractor_id": "contractor-123",
      "session_start": "2025-01-15T09:00:00Z",
      "session_end": "2025-01-15T17:00:00Z",
      "total_seconds": 28800,
      "active_seconds": 21600,
      "idle_seconds": 7200,
      "productivity_score": 82.5
    }
    // ... más resúmenes
  ]
}
```

**Campos de la Respuesta:**

| Campo       | Tipo   | Descripción                                                   |
| ----------- | ------ | ------------------------------------------------------------- |
| `message`   | String | Mensaje de confirmación                                       |
| `count`     | Number | Cantidad de resúmenes de sesión generados                     |
| `summaries` | Array  | Array con todos los resúmenes generados (útil para verificar) |

**Notas:**

- ⚠️ **Re-procesamiento**: Si procesas la misma sesión dos veces, puede crear duplicados
- 📊 **Uso recomendado**: Ejecutar cuando se cierra una sesión o periódicamente (ej: cada hora)
- 🔄 **Dependencias**: Requiere que `contractor_activity_15s` tenga beats con `session_id` no nulo
- ⏱️ **Performance**: Procesa ~50-200 sesiones por segundo

---

### 10. Procesar Uso de Aplicaciones

**Endpoint:** `GET /adt/etl/process-app-usage`

**Descripción:**
Ejecuta el proceso ETL para convertir eventos RAW (desde `events_raw`) en uso de aplicaciones (en `app_usage_summary`). Extrae datos del campo `AppUsage` del payload y agrupa por contractor, aplicación y día.

**⚠️ Requiere rol: `Superadmin`**

**Parámetros:**

| Parámetro | Tipo   | Ubicación | Requerido | Descripción                                                                     | Ejemplo                              |
| --------- | ------ | --------- | --------- | ------------------------------------------------------------------------------- | ------------------------------------ |
| `from`    | String | Query     | ❌ No     | Fecha/hora de inicio. Si no se especifica, procesa todos los eventos pendientes | `2025-01-15` o `2025-01-15T00:00:00` |
| `to`      | String | Query     | ❌ No     | Fecha/hora de fin. Si no se especifica, procesa todos los eventos pendientes    | `2025-01-15` o `2025-01-15T23:59:59` |

**Ejemplos de Uso:**

```bash
# Procesar todos los eventos pendientes (sin filtro de fecha)
GET /adt/etl/process-app-usage

# Procesar eventos de un día específico
GET /adt/etl/process-app-usage?from=2025-01-15&to=2025-01-15

# Procesar eventos de un rango de fechas
GET /adt/etl/process-app-usage?from=2025-01-15&to=2025-01-20

# Procesar eventos de un rango de horas específico
GET /adt/etl/process-app-usage?from=2025-01-15T09:00:00&to=2025-01-15T17:00:00
```

**Respuesta:**

```json
{
  "message": "App usage processed successfully",
  "count": 150
}
```

**Campos de la Respuesta:**

| Campo     | Tipo   | Descripción                                                                                  |
| --------- | ------ | -------------------------------------------------------------------------------------------- |
| `message` | String | Mensaje de confirmación                                                                      |
| `count`   | Number | Cantidad de registros de uso de aplicaciones generados (agrupados por contractor, app y día) |

**Notas:**

- ⚡ **Ejecución en paralelo**: Este ETL puede ejecutarse en paralelo con `process-events` porque ambos leen desde `events_raw` pero generan tablas diferentes
- ⚠️ **Procesamiento**: Puede tardar varios segundos o minutos dependiendo de la cantidad de eventos
- 🔄 **Idempotencia**: Si procesas el mismo rango dos veces, puede crear duplicados. Usa con cuidado
- 📊 **Uso recomendado**: Ejecutar periódicamente (ej: cada 15 minutos) o después de importar datos masivos, preferiblemente en paralelo con `process-events`
- ⏱️ **Performance**: Procesa ~100-500 eventos por segundo dependiendo del tamaño del payload
- 🔍 **Datos procesados**: Extrae el campo `AppUsage` del payload de cada evento y calcula beats activos aproximados (duración en segundos / 15)

---

## Formatos de Fecha

### Formatos Aceptados

Los endpoints aceptan diferentes formatos de fecha según el contexto:

#### 1. Solo Fecha (YYYY-MM-DD)

Usado en: `workday`, `from`, `to` (cuando es para un día completo)

**Ejemplos:**

```
2025-01-15
2025-12-31
2025-02-28
```

#### 2. Fecha y Hora (ISO 8601)

Usado en: `from`, `to` (cuando necesitas precisión de hora)

**Formato:** `YYYY-MM-DDTHH:mm:ss` o `YYYY-MM-DDTHH:mm:ssZ`

**Ejemplos:**

```
2025-01-15T09:00:00
2025-01-15T17:30:00
2025-01-15T09:00:00Z
2025-01-15T17:30:00Z
```

#### 3. Timestamps en Respuestas

Las respuestas siempre usan formato ISO 8601 con timezone UTC:

**Formato:** `YYYY-MM-DDTHH:mm:ss.sssZ`

**Ejemplos:**

```
2025-01-15T09:00:00.000Z
2025-01-15T17:30:45.123Z
```

### Conversión de Formatos

**JavaScript:**

```javascript
// Crear fecha desde string
const date = new Date('2025-01-15');
const dateTime = new Date('2025-01-15T09:00:00');

// Formatear a YYYY-MM-DD
const formatted = date.toISOString().split('T')[0]; // "2025-01-15"

// Formatear a ISO 8601
const iso = date.toISOString(); // "2025-01-15T00:00:00.000Z"
```

**Python:**

```python
from datetime import datetime

# Crear fecha desde string
date = datetime.strptime('2025-01-15', '%Y-%m-%d')
date_time = datetime.strptime('2025-01-15T09:00:00', '%Y-%m-%dT%H:%M:%S')

# Formatear a YYYY-MM-DD
formatted = date.strftime('%Y-%m-%d')  # "2025-01-15"

# Formatear a ISO 8601
iso = date.isoformat() + 'Z'  # "2025-01-15T00:00:00Z"
```

---

## Ejemplos Prácticos

### Caso 1: Dashboard en Tiempo Real

**Objetivo:** Mostrar métricas de productividad actualizadas cada 30 segundos

```bash
# Consultar métricas en tiempo real del día actual
GET /adt/realtime-metrics/contractor-123

# En el frontend, hacer polling cada 30 segundos
setInterval(() => {
  fetch('/adt/realtime-metrics/contractor-123')
    .then(res => res.json())
    .then(data => updateDashboard(data));
}, 30000);
```

### Caso 2: Reporte Semanal

**Objetivo:** Generar un reporte de productividad de la última semana

```bash
# Obtener métricas diarias de los últimos 7 días
GET /adt/daily-metrics/contractor-123?days=7

# Obtener resúmenes de sesión de la última semana
GET /adt/sessions/contractor-123?days=7

# Obtener uso de aplicaciones de la última semana
GET /adt/app-usage/contractor-123?days=7
```

### Caso 3: Análisis Detallado de un Día

**Objetivo:** Analizar en detalle qué pasó en un día específico

```bash
# 1. Obtener métricas diarias del día
GET /adt/daily-metrics/contractor-123?days=1

# 2. Obtener actividad detallada (beats de 15s)
GET /adt/activity/contractor-123?from=2025-01-15&to=2025-01-15&limit=1000

# 3. Obtener resúmenes de sesión del día
GET /adt/sessions/contractor-123?days=1

# 4. Obtener uso de aplicaciones del día
GET /adt/app-usage/contractor-123?days=1
```

### Caso 4: Comparar Productividad entre Contractors

**Objetivo:** Ver quién fue más productivo en un día

```bash
# Obtener ranking del día anterior
GET /adt/ranking?workday=2025-01-15&limit=20

# Obtener ranking del día actual (si ya terminó)
GET /adt/ranking?workday=2025-01-16&limit=20
```

### Caso 5: Procesar Datos Históricos

**Objetivo:** Procesar eventos de días anteriores que no se procesaron

```bash
# 1. Procesar eventos RAW → beats de 15s
GET /adt/etl/process-events?from=2025-01-10&to=2025-01-15

# 1b. Procesar eventos RAW → uso de aplicaciones (puede ejecutarse en paralelo con el paso 1)
GET /adt/etl/process-app-usage?from=2025-01-10&to=2025-01-15

# 2. Procesar beats → métricas diarias
GET /adt/etl/process-daily-metrics?workday=2025-01-10
GET /adt/etl/process-daily-metrics?workday=2025-01-11
GET /adt/etl/process-daily-metrics?workday=2025-01-12
GET /adt/etl/process-daily-metrics?workday=2025-01-13
GET /adt/etl/process-daily-metrics?workday=2025-01-14
GET /adt/etl/process-daily-metrics?workday=2025-01-15

# 3. Procesar beats → resúmenes de sesión
GET /adt/etl/process-session-summaries
```

---

## Errores Comunes y Soluciones

### Error 401: Unauthorized

**Causa:** Token de autenticación inválido o expirado
**Solución:** Hacer login nuevamente y actualizar el token

### Error 403: Forbidden

**Causa:** El usuario no tiene el rol requerido
**Solución:** Verificar que el usuario tenga el rol correcto (Superadmin para ETL, Superadmin/TeamAdmin/Visualizer para consultas)

### Error 404: Not Found

**Causa:** El contractorId no existe o la ruta está mal escrita
**Solución:** Verificar que el contractorId sea correcto y que la ruta esté bien formada

### Respuesta Vacía []

**Causa:** No hay datos para el rango especificado
**Solución:**

- Verificar que el contractor tenga actividad en ese rango
- Verificar que los datos hayan sido procesados (ejecutar ETL si es necesario)
- Ampliar el rango de fechas

### Timeout en Consultas Grandes

**Causa:** Consultando demasiados datos (ej: actividad detallada sin límite)
**Solución:**

- Usar parámetros `from` y `to` para limitar el rango
- Reducir el parámetro `limit`
- Usar endpoints agregados (daily-metrics) en lugar de detallados (activity)

---

## Mejores Prácticas

1. **Usar endpoints agregados para reportes**: `daily-metrics` es más rápido que calcular desde `activity`
2. **Usar `realtime-metrics` para dashboards**: Optimizado con caché para actualizaciones frecuentes
3. **Limitar rangos de fechas**: Siempre usar `from` y `to` en `activity` para evitar respuestas muy grandes
4. **Procesar ETL periódicamente**: No esperar a que se acumulen muchos datos
5. **Verificar datos antes de consultar**: Asegurarse de que los datos hayan sido procesados con ETL
6. **Usar límites razonables**: No pedir más de 10,000 beats en una sola consulta

---

## Soporte

Para más información, consulta:

- `ADT_ENDPOINTS.md` - Resumen rápido de endpoints
- `REALTIME_DASHBOARD_GUIDE.md` - Guía específica para dashboards en tiempo real
- `PERFORMANCE_ANALYSIS.md` - Análisis de performance y optimización
