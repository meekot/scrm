'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface EntityContextValue {
  entityId: string | null;
  setEntityId: (id: string) => void;
}

const EntityContext = createContext<EntityContextValue | undefined>(undefined);

export function EntityProvider({
  children,
  initialEntityId,
}: {
  children: React.ReactNode;
  initialEntityId?: string;
}) {
  // Initialize from localStorage or initialEntityId
  const [entityId, setEntityId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('selectedEntityId');
      return stored || initialEntityId || null;
    }
    return initialEntityId ?? null;
  });

  // Persist entity selection to localStorage
  useEffect(() => {
    if (entityId) {
      localStorage.setItem('selectedEntityId', entityId);
    }
  }, [entityId]);

  return (
    <EntityContext.Provider value={{ entityId, setEntityId }}>
      {children}
    </EntityContext.Provider>
  );
}

export function useEntity() {
  const context = useContext(EntityContext);
  if (context === undefined) {
    throw new Error('useEntity must be used within EntityProvider');
  }
  return context;
}

export function useRequiredEntity() {
  const { entityId } = useEntity();
  if (!entityId) {
    throw new Error('Entity ID is required but not set');
  }
  return entityId;
}
