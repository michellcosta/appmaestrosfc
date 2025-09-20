import React from 'react';
import MobileHeader from './MobileHeader';

type PageLayoutProps = {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
};

export default function PageLayout({ 
  children, 
  title = "App Maestros FC", 
  subtitle = "Sistema de Gestão" 
}: PageLayoutProps) {
  return (
    <div className="p-4 space-y-4">
      <MobileHeader title={title} subtitle={subtitle} />
      {children}
    </div>
  );
}