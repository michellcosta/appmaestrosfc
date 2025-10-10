import React from 'react';
import { Navigate } from 'react-router-dom';

// Página de votação redirecionada para ranking
export default function Vote() {
  return <Navigate to="/ranking" replace />;
}