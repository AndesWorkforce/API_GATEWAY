# Guía de Autenticación JWT

## Configuración

El sistema de autenticación JWT está configurado para usar `JWT_SECRET_PASSWORD` del archivo `.env`.

## Endpoints de Autenticación

### auth-ms (Puerto 3001)

- `GET /auth/validate?token=<jwt_token>` - Valida un JWT y devuelve información del usuario
- `POST /auth/register` - Registra un nuevo usuario
- `POST /auth/login` - Inicia sesión
- `POST /auth/refresh-token` - Renueva el token
- `POST /auth/logout` - Cierra sesión

### api-gateway (Puerto 4000)

- `GET /auth/validate?token=<jwt_token>` - Proxy al endpoint de validación
- `POST /auth/register` - Proxy al registro
- `POST /auth/login` - Proxy al login
- `POST /auth/refresh-token` - Proxy al refresh token
- `POST /auth/logout` - Proxy al logout

## Uso del AuthGuard

### Rutas Protegidas

Por defecto, todas las rutas están protegidas por el `AuthGuard`. Para acceder a una ruta protegida, incluye el token JWT en el header:

```bash
Authorization: Bearer <jwt_token>
```

### Rutas Públicas

Para marcar una ruta como pública (sin autenticación), usa el decorador `@Public()`:

```typescript
import { Public } from './auth/public.decorator';

@Controller('example')
export class ExampleController {
  @Public()
  @Get('public')
  publicRoute() {
    return { message: 'Esta ruta es pública' };
  }

  @Get('protected')
  protectedRoute(@CurrentUser() user: any) {
    return { message: 'Esta ruta está protegida', user };
  }
}
```

### Obtener Usuario Actual

Usa el decorador `@CurrentUser()` para obtener la información del usuario autenticado:

```typescript
import { CurrentUser } from './auth/current-user.decorator';

@Get('profile')
getProfile(@CurrentUser() user: any) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    isActive: user.isActive
  };
}
```

## Flujo de Autenticación

1. **Registro/Login**: El usuario se registra o inicia sesión a través de `/auth/register` o `/auth/login`
2. **Token JWT**: Se recibe un token JWT válido
3. **Acceso a Rutas**: Incluir el token en el header `Authorization: Bearer <token>`
4. **Validación**: El `AuthGuard` valida el token llamando a `auth-ms/validate`
5. **Usuario en Request**: La información del usuario se guarda en `request.user`

## Ejemplo de Uso

```bash
# 1. Registrar usuario
curl -X POST http://localhost:4000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@example.com",
    "password": "password123",
    "puesto_trabajo": "Developer"
  }'

# 2. Iniciar sesión
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'

# 3. Usar token para acceder a rutas protegidas
curl -X GET http://localhost:4000/users \
  -H "Authorization: Bearer <jwt_token>"

# 4. Validar token
curl -X GET "http://localhost:4000/auth/validate?token=<jwt_token>"
```

## Respuesta de Validación

```json
{
  "isValid": true,
  "userId": "uuid",
  "email": "juan@example.com",
  "name": "Juan Pérez",
  "isActive": true,
  "createdAt": "2025-01-20T...",
  "updatedAt": "2025-01-20T..."
}
```

## Manejo de Errores

- **401 Unauthorized**: Token no proporcionado, inválido o expirado
- **403 Forbidden**: Usuario inactivo o sin permisos
- **500 Internal Server Error**: Error en la validación del token
