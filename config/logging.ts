import { LogLevel } from '@nestjs/common';

import { envs } from './envs';

const DEV_LOG_LEVELS: LogLevel[] = ['error', 'warn', 'log', 'debug', 'verbose'];
const PROD_LOG_LEVELS: LogLevel[] = ['error', 'warn'];

export const resolveLogLevels = (): LogLevel[] =>
  envs.devLogsEnabled ? DEV_LOG_LEVELS : PROD_LOG_LEVELS;

export const getLogModeMessage = (): string =>
  envs.devLogsEnabled
    ? 'DEV_LOGS → Dev Logs Enabled.'
    : 'DEV_LOGS → Dev Logs Disabled.';

