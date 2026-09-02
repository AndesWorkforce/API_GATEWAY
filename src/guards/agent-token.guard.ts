import * as crypto from 'crypto';

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { envs } from 'config';

/**
 * Valida el JWT que firma el agente para operaciones con efecto lateral sobre
 * SU PROPIO registro (`decommission`, `report-hostname`).
 *
 * ## Por que existe
 *
 * Estos endpoints estaban marcados `@Public()` y aceptaban solo `{ agentId }`.
 * Como el agentId no es un secreto —esta en texto plano en el agent_data.json de
 * cada maquina y aparece en los logs—, cualquiera podia deshabilitar el agente
 * de otra persona con un POST sin credenciales, o re-vincularlo a otro
 * contratista via report-hostname.
 *
 * Lo llamativo es que el mecanismo YA existia del lado del cliente: tanto
 * Unregister-Agent.ps1 como el agente Python firman un JWT HS256 con
 * `JWT_SECRET_PASSWORD` y lo mandan en `Authorization: Bearer`. El servidor
 * simplemente no lo miraba.
 *
 * ## Que garantiza y que no
 *
 * El secreto es COMPARTIDO: vive en el .env de cada maquina con agente. Alguien
 * con acceso a una maquina puede firmar un token valido. Lo que este guard SI
 * impide es que ese token sirva para operar sobre OTRO agente: se exige que el
 * `sub` del token coincida con el `agentId` del body. O sea que corta el ataque
 * cruzado, que es el que importa en una flota.
 *
 * Para cerrar el caso del insider haria falta un secreto por agente (la columna
 * `activation_key` ya existe y podria cumplir ese rol) o firma asimetrica. Queda
 * anotado; esto es la mejora inmediata sin romper a los agentes desplegados,
 * que ya mandan este token.
 *
 * Se verifica HS256 a mano con `crypto` en vez de sumar una dependencia de JWT:
 * son unas pocas lineas y evita tocar el lockfile.
 */
@Injectable()
export class AgentTokenGuard implements CanActivate {
  private readonly logger = new Logger(AgentTokenGuard.name);

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractBearer(request);

    if (!token) {
      throw new UnauthorizedException('Agent token not provided');
    }

    const payload = this.verify(token);

    const bodyAgentId = (request.body as { agentId?: string })?.agentId;
    if (!bodyAgentId) {
      throw new UnauthorizedException('agentId is required');
    }

    // El corazon del guard: el token solo habilita a operar sobre si mismo.
    if (payload.sub !== bodyAgentId) {
      this.logger.warn(
        `Agent token mismatch: sub=${payload.sub} intento operar sobre agentId=${bodyAgentId}`,
      );
      throw new UnauthorizedException('Agent token does not match agentId');
    }

    return true;
  }

  private extractBearer(request: Request): string | null {
    const header = request.headers.authorization;
    if (!header) return null;
    const [type, value] = header.split(' ');
    return type === 'Bearer' && value ? value : null;
  }

  private verify(token: string): { sub: string; exp?: number } {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Malformed agent token');
    }
    const [headerB64, payloadB64, signatureB64] = parts;

    // Rechazar explicitamente cualquier alg que no sea HS256. Sin esto un token
    // con alg "none" —o con un algoritmo asimetrico— podria colarse.
    const header = this.decodeSegment(headerB64);
    if (header.alg !== 'HS256' || header.typ !== 'JWT') {
      throw new UnauthorizedException('Unsupported agent token algorithm');
    }

    const expected = crypto
      .createHmac('sha256', envs.jwtSecretPassword)
      .update(`${headerB64}.${payloadB64}`)
      .digest();
    const provided = Buffer.from(signatureB64, 'base64url');

    // Comparacion en tiempo constante: un `===` filtra informacion por timing.
    if (
      expected.length !== provided.length ||
      !crypto.timingSafeEqual(expected, provided)
    ) {
      throw new UnauthorizedException('Invalid agent token signature');
    }

    const payload = this.decodeSegment(payloadB64);
    if (typeof payload.sub !== 'string' || !payload.sub) {
      throw new UnauthorizedException('Agent token without subject');
    }
    if (typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
      throw new UnauthorizedException('Agent token expired');
    }

    return payload as { sub: string; exp?: number };
  }

  private decodeSegment(segment: string): Record<string, unknown> {
    try {
      return JSON.parse(
        Buffer.from(segment, 'base64url').toString('utf8'),
      ) as Record<string, unknown>;
    } catch {
      throw new UnauthorizedException('Malformed agent token');
    }
  }
}
