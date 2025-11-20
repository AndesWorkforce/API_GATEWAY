# Flujos de Postman por Rol - API Gateway

## 📋 Descripción

Se implementan flujos de trabajo completos en Postman organizados por rol de usuario, facilitando el testing y validación de la API Gateway. Se centraliza toda la configuración de Postman en una carpeta dedicada.

## 🎯 Objetivos

- Crear flujos de prueba específicos para cada rol (Superadmin, TeamAdmin, Visualizer, Client, Público)
- Automatizar la captura de IDs entre requests para flujos dependientes
- Centralizar toda la configuración de Postman en una carpeta dedicada
- Proporcionar scripts de setup automatizado para facilitar la configuración

## 🔄 Cambios Realizados

### Archivos Agregados

- **`postman/collection.json`**: Colección completa con 5 flujos por rol
- **`postman/environment.andes.json`**: Variables de entorno con credenciales y placeholders de IDs
- **`postman/setup-postman.ps1`**: Script PowerShell para configuración automatizada
- **`postman/README.md`**: Documentación de uso y ejecución

### Archivos Eliminados

- **`postman-collection.json`**: Movido a `postman/collection.json`

## 🚀 Flujos Implementados

### 1. Flujo Superadmin

**Funcionalidad**: Configuración completa del sistema y gestión total

- ✅ Login con credenciales de superadmin
- ✅ Obtener clientes (captura `clientId`)
- ✅ Crear equipo (captura `teamId`)
- ✅ Crear contratista (captura `contractorId` y `activationKey`)
- ✅ Crear aplicación (captura `appId`)
- ✅ Asignar aplicación a contratista
- ✅ Crear sesión (captura `sessionId`)
- ✅ Crear agent session (captura `agentSessionId`)
- ✅ Consultar eventos por contratista y sesión

### 2. Flujo TeamAdmin

**Funcionalidad**: Gestión de equipos, contratistas y calendarios

- ✅ Login con credenciales de team admin
- ✅ Listar equipos
- ✅ Crear contratista (captura `contractorId`)
- ✅ Listar días libres
- ✅ Crear día libre (captura `dayOffId`)
- ✅ Consultar sesiones por contratista
- ✅ Consultar agentes por contratista

### 3. Flujo Visualizer

**Funcionalidad**: Dashboard de solo lectura para métricas y reportes

- ✅ Login con credenciales de visualizer
- ✅ Consultar todos los eventos
- ✅ Consultar sesiones activas
- ✅ Listar clientes, equipos, contratistas, usuarios y aplicaciones

### 4. Flujo Client

**Funcionalidad**: Vista filtrada de contratistas propios y métricas

- ✅ Login con credenciales de cliente
- ✅ Listar contratistas por cliente
- ✅ Consultar sesiones por contratista
- ✅ Consultar agent sessions por contratista
- ✅ Consultar agentes por contratista
- ✅ Consultar aplicaciones por contratista
- ✅ Consultar eventos por contratista
- ✅ Consultar métricas por contratista

### 5. Flujo Público

**Funcionalidad**: Activación de agentes sin autenticación

- ✅ Buscar contratista por activation key
- ✅ Registrar agente (captura `agentId`)
- ✅ Enviar heartbeat
- ✅ Consultar eventos por contratista

## 🔧 Características Técnicas

### Variables de Colección

- **Autenticación**: `accessToken` (auto-capturado en login)
- **Credenciales por Rol**:
  - `superadmin_email` / `superadmin_password`
  - `teamadmin_email` / `teamadmin_password`
  - `visualizer_email` / `visualizer_password`
  - `client_email` / `client_password`
- **IDs Capturados Automáticamente**:
  - `clientId`, `teamId`, `contractorId`, `activationKey`
  - `appId`, `sessionId`, `agentSessionId`, `agentId`, `dayOffId`

### Automatización

- **Pre-request Script**: Maneja autenticación Bearer, permite requests públicos con header `X-No-Auth`
- **Test Scripts**: Captura automática de IDs de respuestas JSON usando `pm.collectionVariables.set()`
- **Setup Script**: PowerShell para registrar cliente y generar archivo de entorno

## 📦 Estructura de Archivos

```
API_GATEWAY/
└── postman/
    ├── collection.json          # Colección completa con todos los flujos
    ├── environment.andes.json   # Variables de entorno
    ├── setup-postman.ps1        # Script de configuración
    └── README.md                # Documentación de uso
```

## 🧪 Uso

### Configuración Inicial

```powershell
cd API_GATEWAY/postman
.\setup-postman.ps1 -BaseUrl "http://localhost:3001" -ClientEmail "client@test.com" -ClientPassword "pass123"
```

### Ejecución de Flujos

1. Importar `postman/collection.json` y `postman/environment.andes.json` en Postman
2. Ejecutar flujos en orden recomendado:
   - Flujo Superadmin (configuración inicial)
   - Flujo Público (activación de agentes)
   - Flujo TeamAdmin (gestión operativa)
   - Flujo Visualizer (monitoreo)
   - Flujo Client (vista cliente)

## ✅ Validación

- ✅ Flujos alineados con user story map del proyecto
- ✅ Todos los endpoints verificados contra controllers existentes
- ✅ Eliminados endpoints no soportados (POST /events, POST /clients)
- ✅ Test scripts validados para captura correcta de IDs
- ✅ Runner ejecuta sin errores 404

## 🔗 Referencias

- Issue: SDT-128 - Flujo en la colección de postman
- Base: `development`
