import 'dotenv/config';

import Joi from 'joi';

interface EnvVars {
  PORT: number;
  EVENTS_MS_PORT: number;
  AUTH_MS_PORT: number;
  USER_MS_PORT: number;
  NATS_HOST: string;
  NATS_PORT: number;
  NATS_USERNAME: string;
  NATS_PASSWORD: string;
}

export const envSchema = Joi.object({
  PORT: Joi.number().required(),
  EVENTS_MS_PORT: Joi.number().required(),
  AUTH_MS_PORT: Joi.number().required(),
  USER_MS_PORT: Joi.number().required(),
  NATS_HOST: Joi.string().required(),
  NATS_PORT: Joi.number().required(),
  NATS_USERNAME: Joi.string().required(),
  NATS_PASSWORD: Joi.string().required(),
}).unknown(true);

const { error, value } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Invalid environment variables: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  agentMsPort: envVars.EVENTS_MS_PORT,
  authMsPort: envVars.AUTH_MS_PORT,
  userMsPort: envVars.USER_MS_PORT,
  natsHost: envVars.NATS_HOST,
  natsPort: envVars.NATS_PORT,
  natsUsername: envVars.NATS_USERNAME,
  natsPassword: envVars.NATS_PASSWORD,
};
