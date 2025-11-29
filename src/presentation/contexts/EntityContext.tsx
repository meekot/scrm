'use client'

import { createContext, useContext } from 'react'

export interface ActiveEntityContextValue {
  id: string
  name?: string | null
  displayNumber?: number | null
}

const EntityContext = createContext<ActiveEntityContextValue | null>(null)

export function EntityProvider({
  value,
  children,
}: {
  value: ActiveEntityContextValue | null
  children: React.ReactNode
}) {
  return <EntityContext.Provider value={value}>{children}</EntityContext.Provider>
}

export function useActiveEntity(options?: { required?: boolean }) {
  const context = useContext(EntityContext)

  if (options?.required && !context) {
    throw new Error('Active entity is not available in the current context')
  }

  return context
}
