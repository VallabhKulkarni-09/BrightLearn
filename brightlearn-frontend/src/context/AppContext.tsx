import { createContext, useContext, type ReactNode } from 'react'

interface AppContextValue {
  apiUrl: string
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

  return <AppContext.Provider value={{ apiUrl }}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider')
  }
  return context
}
