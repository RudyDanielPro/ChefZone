// ============================================================
// ChefZone — 404 Not Found Page
// ============================================================
import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <img src={logo} alt="ChefZone" className="w-20 h-20 mb-4 opacity-60" />
      <div className="text-8xl mb-4">🍽️</div>
      <h1 className="font-display text-4xl font-bold text-foreground mb-2">
        ¡Página no encontrada!
      </h1>
      <p className="text-muted-foreground mb-8 max-w-sm">
        Parece que esta receta se perdió en la cocina. Vuelve al inicio para explorar más.
      </p>
      <button
        onClick={() => navigate("/")}
        className="px-8 py-3 rounded-full gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
      >
        Volver al inicio
      </button>
    </div>
  );
};

export default NotFound;
