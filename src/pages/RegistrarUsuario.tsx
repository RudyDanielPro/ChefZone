import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  UserPlus, 
  ArrowLeft, 
  User, 
  Mail, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  AtSign 
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { registrarUsuarioPorAdmin } from "@/services/admin/users"; 

const RegistrarUsuarioAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [cargando, setCargando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    usuario: "",
    email: "",
    password: "",
    rol: "USER"
  });

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    try {
      // Aquí llamamos a tu API de backend
      await registrarUsuarioPorAdmin(formData);
      toast.success("Usuario creado exitosamente");
      navigate("/admin"); // Regresar al panel tras crear
    } catch (error: any) {
      toast.error(error.response?.data?.mensaje || "Error al registrar usuario");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container max-w-2xl py-12">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al Panel
        </button>

        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="gradient-primary p-6 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Registrar Nuevo Usuario</h1>
                <p className="text-white/80 text-sm">Crea una cuenta para un nuevo miembro del sistema</p>
              </div>
            </div>
          </div>

          <form onSubmit={manejarEnvio} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    name="nombre"
                    type="text"
                    required
                    onChange={manejarCambio}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                    placeholder="Ej: Juan"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Apellido</label>
                <input
                  name="apellido"
                  type="text"
                  required
                  onChange={manejarCambio}
                  className="w-full px-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="Ej: Pérez"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre de Usuario</label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="usuario"
                  type="text"
                  required
                  onChange={manejarCambio}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="juanperez123"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="email"
                  type="email"
                  required
                  onChange={manejarCambio}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="correo@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Contraseña Inicial</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  name="password"
                  type="password"
                  required
                  onChange={manejarCambio}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Asignar Rol</label>
              <div className="relative">
                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <select
                  name="rol"
                  onChange={manejarCambio}
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary/40 outline-none transition-all appearance-none"
                >
                  <option value="USER">Usuario (USER)</option>
                  <option value="ADMIN">Administrador (ADMIN)</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full py-3 rounded-lg gradient-primary text-white font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {cargando ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              Crear Usuario
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrarUsuarioAdmin;