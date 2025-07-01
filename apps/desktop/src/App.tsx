import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Welcome from "./pages/Welcome";
import Repo from "./pages/Repo";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/repo" element={<Repo />} />
        {/* Add more routes here as you add more pages */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;