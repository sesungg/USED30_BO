import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar />
      <Header />
      <main
        style={{ marginLeft: 220, marginTop: 56, minHeight: 'calc(100vh - 56px)', background: '#f8f9fa' }}
        className="p-4"
      >
        {children}
      </main>
    </>
  );
}
