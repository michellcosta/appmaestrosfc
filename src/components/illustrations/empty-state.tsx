import React from 'react';

interface EmptyStateProps {
  type: 'matches' | 'messages' | 'payments' | 'ranking' | 'notices';
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, className = '' }) => {
  const illustrations = {
    matches: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" opacity="0.3"/>
        <path d="M100 70C85.64 70 74 81.64 74 96C74 110.36 85.64 122 100 122C114.36 122 126 110.36 126 96C126 81.64 114.36 70 100 70Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M100 70V122" stroke="currentColor" strokeWidth="2"/>
        <path d="M74 96H126" stroke="currentColor" strokeWidth="2"/>
        <path d="M82.68 78.68L117.32 113.32" stroke="currentColor" strokeWidth="2"/>
        <path d="M117.32 78.68L82.68 113.32" stroke="currentColor" strokeWidth="2"/>
        <circle cx="100" cy="96" r="8" stroke="currentColor" strokeWidth="2"/>
      </svg>
    ),
    messages: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="50" y="60" width="100" height="70" rx="8" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
        <path d="M70 85H130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M70 100H110" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M70 115H120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M80 130L65 150L80 140H120C126.627 140 132 134.627 132 128V130" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    payments: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="60" y="70" width="80" height="60" rx="8" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
        <circle cx="100" cy="100" r="15" stroke="currentColor" strokeWidth="2"/>
        <path d="M100 90V110" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M90 100H110" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        <path d="M75 80H85" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
        <path d="M115 120H125" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
    ranking: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <rect x="85" y="90" width="30" height="50" stroke="currentColor" strokeWidth="2" opacity="0.5"/>
        <rect x="55" y="110" width="30" height="30" stroke="currentColor" strokeWidth="2" opacity="0.3"/>
        <rect x="115" y="100" width="30" height="40" stroke="currentColor" strokeWidth="2" opacity="0.4"/>
        <path d="M100 70L105 80L116 82L108 90L110 101L100 96L90 101L92 90L84 82L95 80L100 70Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    notices: (
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
        <path d="M100 60C86.745 60 76 70.745 76 84V110L70 120H130L124 110V84C124 70.745 113.255 60 100 60Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.3"/>
        <path d="M90 120V125C90 130.523 94.477 135 100 135C105.523 135 110 130.523 110 125V120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="100" cy="50" r="3" fill="currentColor" opacity="0.5"/>
      </svg>
    ),
  };

  return illustrations[type] || null;
};