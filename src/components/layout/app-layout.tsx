import React from 'react';
import { BottomTabs } from './bottom-tabs';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-tabbar">
        {children}
      </main>
      <BottomTabs />
    </div>
  );
};