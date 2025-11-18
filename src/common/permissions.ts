import { Role } from './roles.enum';

// Centralized permissions mapping to avoid duplication
export const PERMISSIONS = {
  users: {
    findAll: [Role.Superadmin, Role.Teamadmin],
    findOne: [Role.Superadmin, Role.Teamadmin, Role.Client],
    update: [Role.Superadmin, Role.Teamadmin, Role.Client],
    remove: [Role.Superadmin],
  },
  agents: {
    getContractorAgents: [Role.Superadmin, Role.Teamadmin],
    getAgentHierarchy: [Role.Superadmin, Role.Teamadmin],
    swapAgentTypes: [Role.Superadmin],
    findAll: [Role.Superadmin, Role.Teamadmin],
    findOne: [Role.Superadmin, Role.Teamadmin, Role.Client],
  },
  clients: {
    findAll: [Role.Superadmin, Role.Teamadmin],
    findOne: [Role.Superadmin, Role.Teamadmin, Role.Client],
    update: [Role.Superadmin, Role.Teamadmin],
    remove: [Role.Superadmin],
    assignContractors: [Role.Superadmin, Role.Teamadmin],
  },
  teams: {
    create: [Role.Superadmin, Role.Teamadmin],
    findAll: [Role.Superadmin, Role.Teamadmin],
    findOne: [Role.Superadmin, Role.Teamadmin],
    update: [Role.Superadmin, Role.Teamadmin],
    remove: [Role.Superadmin],
    assignContractors: [Role.Superadmin, Role.Teamadmin],
  },
  sessions: {
    create: [Role.Superadmin, Role.Teamadmin, Role.Client],
    findAll: [Role.Superadmin, Role.Teamadmin],
    findActiveSessions: [Role.Superadmin, Role.Teamadmin],
    findOne: [Role.Superadmin, Role.Teamadmin, Role.Client],
    findByUserId: [Role.Superadmin, Role.Teamadmin, Role.Client],
    findByContractorId: [Role.Superadmin, Role.Teamadmin],
    findActiveSessionByContractorId: [Role.Superadmin, Role.Teamadmin],
    update: [Role.Superadmin, Role.Teamadmin],
    endSession: [Role.Superadmin, Role.Teamadmin],
    remove: [Role.Superadmin, Role.Teamadmin],
  },
  contractors: {
    create: [Role.Superadmin, Role.Teamadmin],
    findAll: [Role.Superadmin, Role.Teamadmin],
    findOne: [Role.Superadmin, Role.Teamadmin, Role.Client],
    update: [Role.Superadmin, Role.Teamadmin],
    remove: [Role.Superadmin],
    dayOffs: [Role.Superadmin, Role.Teamadmin],
    byActivationKey: [], // public
  },
  events: {
    findAll: [Role.Superadmin, Role.Teamadmin, Role.Visualizer],
    findByContractorId: [Role.Superadmin, Role.Teamadmin, Role.Visualizer],
    findBySessionId: [Role.Superadmin, Role.Teamadmin, Role.Visualizer],
    findByAgentId: [Role.Superadmin, Role.Teamadmin, Role.Client],
  },
};
