import 'dotenv/config';

import * as Joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_HOST: string;
  NATS_PORT: number;
  NATS_USERNAME: string;
  NATS_PASSWORD: string;
  DEV_LOGS: boolean;
  ENVIRONMENT: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  THROTTLE_AUTH_LOGIN_TTL: number;
  THROTTLE_AUTH_LOGIN_LIMIT: number;
  THROTTLE_AUTH_REGISTER_TTL: number;
  THROTTLE_AUTH_REGISTER_LIMIT: number;
  THROTTLE_AUTH_REFRESH_TTL: number;
  THROTTLE_AUTH_REFRESH_LIMIT: number;
  THROTTLE_AGENT_HEARTBEAT_TTL: number;
  THROTTLE_AGENT_HEARTBEAT_LIMIT: number;
  THROTTLE_AGENT_REGISTER_TTL: number;
  THROTTLE_AGENT_REGISTER_LIMIT: number;
}

export const envSchema = Joi.object({
  PORT: Joi.number().required(),
  NATS_HOST: Joi.string().required(),
  NATS_PORT: Joi.number().required(),
  NATS_USERNAME: Joi.string().required(),
  NATS_PASSWORD: Joi.string().required(),
  DEV_LOGS: Joi.boolean()
    .truthy('true')
    .truthy('1')
    .truthy('yes')
    .falsy('false')
    .falsy('0')
    .falsy('no')
    .default(false),
  ENVIRONMENT: Joi.string()
    .valid('development', 'production', 'staging')
    .default('development'),
  THROTTLE_TTL: Joi.number().default(60_000),
  THROTTLE_LIMIT: Joi.number().default(100),
  THROTTLE_AUTH_LOGIN_TTL: Joi.number().default(60_000),
  THROTTLE_AUTH_LOGIN_LIMIT: Joi.number().default(5),
  THROTTLE_AUTH_REGISTER_TTL: Joi.number().default(300_000),
  THROTTLE_AUTH_REGISTER_LIMIT: Joi.number().default(3),
  THROTTLE_AUTH_REFRESH_TTL: Joi.number().default(60_000),
  THROTTLE_AUTH_REFRESH_LIMIT: Joi.number().default(10),
  THROTTLE_AGENT_HEARTBEAT_TTL: Joi.number().default(60_000),
  THROTTLE_AGENT_HEARTBEAT_LIMIT: Joi.number().default(30),
  THROTTLE_AGENT_REGISTER_TTL: Joi.number().default(60_000),
  THROTTLE_AGENT_REGISTER_LIMIT: Joi.number().default(5),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Invalid environment variables: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  natsHost: envVars.NATS_HOST,
  natsPort: envVars.NATS_PORT,
  natsUsername: envVars.NATS_USERNAME,
  natsPassword: envVars.NATS_PASSWORD,
  devLogsEnabled: envVars.DEV_LOGS,
  environment: envVars.ENVIRONMENT,
  throttle: {
    ttl: envVars.THROTTLE_TTL,
    limit: envVars.THROTTLE_LIMIT,
    auth: {
      login: {
        ttl: envVars.THROTTLE_AUTH_LOGIN_TTL,
        limit: envVars.THROTTLE_AUTH_LOGIN_LIMIT,
      },
      register: {
        ttl: envVars.THROTTLE_AUTH_REGISTER_TTL,
        limit: envVars.THROTTLE_AUTH_REGISTER_LIMIT,
      },
      refresh: {
        ttl: envVars.THROTTLE_AUTH_REFRESH_TTL,
        limit: envVars.THROTTLE_AUTH_REFRESH_LIMIT,
      },
    },
    agent: {
      heartbeat: {
        ttl: envVars.THROTTLE_AGENT_HEARTBEAT_TTL,
        limit: envVars.THROTTLE_AGENT_HEARTBEAT_LIMIT,
      },
      register: {
        ttl: envVars.THROTTLE_AGENT_REGISTER_TTL,
        limit: envVars.THROTTLE_AGENT_REGISTER_LIMIT,
      },
    },
  },
};

/**
 * Genera un MessagePattern con prefijo según el entorno
 * @param pattern - El nombre del pattern sin prefijo
 * @returns El pattern con el prefijo del entorno (dev, prod, staging)
 *
 * @example
 * getMessagePattern('findUser') // 'dev.findUser' en desarrollo
 * getMessagePattern('findUser') // 'prod.findUser' en producción
 */
export function getMessagePattern(pattern: string): string {
  const prefix =
    envs.environment === 'production'
      ? 'prod'
      : envs.environment === 'staging'
        ? 'staging'
        : 'dev';
  return `${prefix}.${pattern}`;
}
