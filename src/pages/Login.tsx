// ============================================================
// ChefZone — Login Page
// Email + password authentication form
// ============================================================
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";
import logo from "@/assets/logo.png";

const Login: React.FC = () => {
  // ❌ CAMBIAR: login debe ser iniciarSesion
  const { iniciarSesion, autenticado } = useAuth(); // ✅ Cambiar
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string })?.from || "/";

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ❌ CAMBIAR: isAuthenticated debe ser autenticado
  React.useEffect(() => {
    if (autenticado) navigate(from, { replace: true });
  }, [autenticado, from, navigate]);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.email.trim()) errs.email = "El email es obligatorio";
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = "Email inválido";
    if (!form.password) errs.password = "La contraseña es obligatoria";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // ❌ CAMBIAR: login debe ser iniciarSesion
      await iniciarSesion({ email: form.email, password: form.password });
      toast.success("¡Bienvenido de nuevo!");
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Credenciales incorrectas";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm(f => ({ ...f, [key]: e.target.value }));
      if (errors[key]) setErrors(er => ({ ...er, [key]: "" }));
    },
  });

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 gradient-hero flex-col items-center justify-center p-12 text-primary-foreground">
        <img src={logo} alt="ChefZone" className="w-24 h-24 mb-6" />
        <h1 className="font-display text-4xl font-bold mb-4 text-center">
          Tu cocina, tu comunidad
        </h1>
        <p className="text-primary-foreground/85 text-center text-lg max-w-sm">
          Comparte recetas increíbles, descubre sabores del mundo y conecta con otros amantes de la cocina.
        </p>
        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {["🍕 Pizzas", "🥗 Ensaladas", "🍰 Postres", "🥩 Carnes", "🍝 Pastas", "🍲 Sopas"].map(t => (
            <span key={t} className="bg-primary-foreground/15 rounded-full px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <img src={logo} alt="ChefZone" className="w-16 h-16 mb-2" />
            <span className="font-display text-2xl font-bold text-gradient-primary">ChefZone</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-foreground mb-2">Iniciar sesión</h2>
          <p className="text-muted-foreground mb-8">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline">
              Regístrate gratis
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                {...field("email")}
                placeholder="tu@email.com"
                className={`w-full rounded-xl border px-4 py-3 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all ${errors.email ? "border-destructive" : "border-input"}`}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  {...field("password")}
                  placeholder="••••••••"
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-sm bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-all ${errors.password ? "border-destructive" : "border-input"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 shadow-md"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? "Iniciando sesión..." : "Iniciar sesión"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;