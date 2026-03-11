import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const { usuario, autenticado, cargando } = useAuth();

  if (cargando) return null; // O un spinner

  // IMPORTANTE: Verifica que el rol sea exactamente "ADMIN"
  if (!autenticado || usuario?.rol !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;