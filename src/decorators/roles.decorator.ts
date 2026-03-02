import { SetMetadata } from '@nestjs/common';

import { Role } from '../common/enums/role.enum';

export const ROLES_KEY = 'roles';
export const ALLOW_CLIENT_KEY = 'allowClient';
export const AGENT_ONLY_KEY = 'agentOnly';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
export const AllowClient = () => SetMetadata(ALLOW_CLIENT_KEY, true);
export const AgentOnly = () => SetMetadata(AGENT_ONLY_KEY, true);
