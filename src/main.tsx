import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Match from "./pages/Match";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Navigate to="/partida" replace />} />
      <Route path="/partida" element={<Match />} />
    </Routes>
  </BrowserRouter>
);
