import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SimpleTest from '@/pages/SimpleTest';

export default function SimpleAppRouter() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f0f0' }}>
      <Routes>
        <Route path="/" element={<SimpleTest />} />
        <Route path="/simple-test" element={<SimpleTest />} />
        <Route path="*" element={<SimpleTest />} />
      </Routes>
    </div>
  );
}
