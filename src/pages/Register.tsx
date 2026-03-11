// ============================================================
// ChefZone — Register Page (CORREGIDO - SIN EDAD)
// ============================================================
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";

interface FormState {
  nombre: string;
  apellido: string;
  usuario: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { registrarse, autenticado } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    nombre: "",
    apellido: "",
    usuario: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<FormState>>({});

  React.useEffect(() => {
    if (autenticado) navigate("/", { replace: true });
  }, [autenticado, navigate]);

  const setField = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors(er => ({ ...er, [key]: "" }));
  };

  const validate = (): boolean => {
    const errs: Partial<FormState> = {};
    if (!form.nombre.trim()) errs.nombre = "Obligatorio";
    if (!form.apellido.trim()) errs.apellido = "Obligatorio";
    if (!form.usuario.trim()) errs.usuario = "Obligatorio";
    else if (form.usuario.length < 3) errs.usuario = "Mínimo 3 caracteres";
    if (!form.email.trim()) errs.email = "Obligatorio";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email inválido";
    if (!form.password) errs.password = "Obligatorio";
    else if (form.password.length < 6) errs.password = "Mínimo 6 caracteres";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Las contraseñas no coinciden";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await registrarse({
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        usuario: form.usuario.trim(),
        email: form.email.trim(),
        password: form.password,
      });
      toast.success("¡Cuenta creada! Bienvenido a ChefZone 🎉");
      navigate("/", { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error al registrar usuario";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: keyof FormState) =>
    `w-full rounded-xl border px-4 py-3 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all ${errors[field] ? "border-destructive" : "border-input"}`;

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-2/5 gradient-hero flex-col items-center justify-center p-12 text-primary-foreground">
        <img src={logo} alt="ChefZone" className="w-20 h-20 mb-6" />
        <h1 className="font-display text-3xl font-bold mb-4 text-center">
          Únete a la comunidad
        </h1>
        <p className="text-primary-foreground/85 text-center max-w-xs">
          Más de 10,000 recetas esperan por ti. Registra tu cuenta y empieza a compartir tus creaciones.
        </p>
        <div className="mt-8 space-y-3 text-sm">
          {["✅ Publica tus recetas", "❤️ Guarda favoritas", "👤 Perfil personalizado", "🔍 Descubre nuevos sabores"].map(t => (
            <div key={t} className="bg-primary-foreground/15 rounded-lg px-4 py-2 backdrop-blur-sm">
              {t}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-3/5 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-lg">
          <div className="lg:hidden flex flex-col items-center mb-6">
            <img src={logo} alt="ChefZone" className="w-14 h-14 mb-2" />
            <span className="font-display text-2xl font-bold text-gradient-primary">ChefZone</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-foreground mb-1">Crear cuenta</h2>
          <p className="text-muted-foreground mb-6">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Inicia sesión
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Nombre *</label>
                <input type="text" value={form.nombre} onChange={setField("nombre")} placeholder="María" className={inputCls("nombre")} />
                {errors.nombre && <p className="text-destructive text-xs mt-1">{errors.nombre}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Apellidos *</label>
                <input type="text" value={form.apellido} onChange={setField("apellido")} placeholder="García" className={inputCls("apellido")} />
                {errors.apellido && <p className="text-destructive text-xs mt-1">{errors.apellido}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Usuario *</label>
              <input type="text" value={form.usuario} onChange={setField("usuario")} placeholder="chef_maria" className={inputCls("usuario")} />
              {errors.usuario && <p className="text-destructive text-xs mt-1">{errors.usuario}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={setField("email")} placeholder="maria@email.com" className={inputCls("email")} />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contraseña *</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={form.password} onChange={setField("password")} placeholder="Mínimo 6 caracteres" className={`${inputCls("password")} pr-11`} />
                <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Confirmar contraseña *</label>
              <input type={showPass ? "text" : "password"} value={form.confirmPassword} onChange={setField("confirmPassword")} placeholder="Repite tu contraseña" className={inputCls("confirmPassword")} />
              {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-md mt-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Creando cuenta..." : "Crear mi cuenta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;