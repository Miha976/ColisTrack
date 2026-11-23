import { createContext, useContext, type ReactNode } from 'react';
import type { Container } from './container';

const ServicesContext = createContext<Container | null>(null);

export function ServicesProvider({ value, children }: { value: Container; children: ReactNode }) {
  return <ServicesContext.Provider value={value}>{children}</ServicesContext.Provider>;
}

export function useServices(): Container {
  const ctx = useContext(ServicesContext);
  if (!ctx) throw new Error('useServices doit être utilisé dans <ServicesProvider>');
  return ctx;
}
