export const queryKeys = {
  // Entity
  entity: {
    all: ['entities'] as const,
    byId: (id: string) => ['entities', id] as const,
    members: (entityId: string) => ['entities', entityId, 'members'] as const,
  },

  // Clients
  clients: {
    all: (entityId: string) => ['clients', entityId] as const,
    byId: (entityId: string, id: string) => ['clients', entityId, id] as const,
  },

  // Services
  services: {
    all: (entityId: string) => ['services', entityId] as const,
    byId: (entityId: string, id: string) => ['services', entityId, id] as const,
  },

  // Appointments
  appointments: {
    all: (entityId: string) => ['appointments', entityId] as const,
    byId: (entityId: string, id: string) => ['appointments', entityId, id] as const,
    byDate: (entityId: string, date: string) => ['appointments', entityId, 'date', date] as const,
  },

  // Analytics
  analytics: {
    clientsCount: (entityId: string) => ['analytics', entityId, 'clients-count'] as const,
    servicesCount: (entityId: string) => ['analytics', entityId, 'services-count'] as const,
    appointmentsCount: (entityId: string, rangeKey: string) =>
      ['analytics', entityId, 'appointments-count', rangeKey] as const,
    revenueTotal: (entityId: string, rangeKey: string) =>
      ['analytics', entityId, 'revenue-total', rangeKey] as const,
  },

  // Auth
  auth: {
    user: ['auth', 'user'] as const,
    session: ['auth', 'session'] as const,
  },
} as const;
