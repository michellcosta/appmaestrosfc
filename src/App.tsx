﻿import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Match from "./pages/Match";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/partida" replace />} />
      <Route path="/partida" element={<Match />} />
      <Route path="*" element={<Navigate to="/partida" replace />} />
    </Routes>
  );
}
