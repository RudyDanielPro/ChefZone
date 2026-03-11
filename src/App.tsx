// ============================================================
// ChefZone — App Routes (CORREGIDO)
// ============================================================
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { Toaster } from "sonner"; // ✅ AÑADIDO: Para poder ver los errores y alertas

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Profile from "@/pages/Profile";
import RecipeDetail from "@/pages/RecipeDetail";
import RecipeForm from "@/pages/RecipeForm"; // Asegúrate de que este archivo exporta RecipeFormPage
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/NotFound";
import RegistrarUsuarioAdmin from "./pages/RegistrarUsuario";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* ✅ AÑADIDO: Renderizamos el Toaster globalmente */}
        <Toaster position="top-right" richColors />
        
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recetas/:id" element={<RecipeDetail />} />
          
          {/* Protected routes */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recetas/crear"
            element={
              <ProtectedRoute>
                {/* ✅ CORREGIDO: Cambiado de 'mode' a 'modo' para coincidir con el componente */}
                <RecipeForm modo="crear" />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recetas/:id/editar"
            element={
              <ProtectedRoute>
                {/* ✅ CORREGIDO: Cambiado de 'mode' a 'modo' */}
                <RecipeForm modo="editar" />
              </ProtectedRoute>
            }
          />
          
          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route path="/registro" element={<RegistrarUsuarioAdmin />} />
          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;