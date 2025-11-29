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
  const [entityId, setEntityId] = useState<string | null>(initialEntityId ?? null);

  // Persist entity selection to localStorage
  useEffect(() => {
    if (entityId) {
      localStorage.setItem('selectedEntityId', entityId);
    }
  }, [entityId]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedEntityId');
    if (stored && !entityId) {
      setEntityId(stored);
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
