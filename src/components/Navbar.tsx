// ============================================================
// ChefZone — Navbar Component (OPTIMIZADO PARA ROLES)
// ============================================================
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Plus, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const Navbar: React.FC = () => {
  const { autenticado, usuario, cerrarSesion } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Helper para validar si es admin (Soporta: ADMIN, ROLE_ADMIN, admin, etc.)
  const esAdmin = usuario?.rol && String(usuario.rol).toUpperCase().includes("ADMIN");

  // Debug en consola
  useEffect(() => {
    console.log("Navbar Status - Autenticado:", autenticado);
    console.log("Navbar Status - Rol Detectado:", usuario?.rol);
    console.log("Navbar Status - ¿Es Admin?:", esAdmin);
  }, [usuario, autenticado, esAdmin]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <header className={cn("sticky top-0 z-50 w-full transition-all duration-300", scrolled ? "bg-card/95 backdrop-blur-md border-b border-border shadow-sm" : "bg-card border-b border-border")}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="ChefZone" className="w-9 h-9" />
            <span className="font-display font-bold text-xl text-gradient-primary">ChefZone</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <Link to="/" className={cn("text-sm font-medium transition-colors hover:text-primary", location.pathname === "/" ? "text-primary" : "text-muted-foreground")}>Inicio</Link>

            {autenticado && (
              <>
                {/* BOTÓN ADMIN ESCRITORIO */}
                {esAdmin && (
                  <Link to="/admin" className={cn("flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary", location.pathname.startsWith("/admin") ? "text-primary" : "text-muted-foreground")}>
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Panel Admin</span>
                  </Link>
                )}
                
                <Link to="/profile" className={cn("text-sm font-medium transition-colors hover:text-primary", location.pathname === "/profile" ? "text-primary" : "text-muted-foreground")}>Mi Perfil</Link>
                
                <button onClick={() => navigate("/recetas/crear")} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm">
                  <Plus className="w-4 h-4" />
                  Nueva Receta
                </button>
              </>
            )}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center gap-3">
            {autenticado ? (
              <div className="flex items-center gap-3">
                <button onClick={() => navigate("/profile")} className="flex flex-col items-end gap-0 hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <UserAvatar 
                      src={usuario?.profilePicture || usuario?.foto?.ruta} 
                      name={`${usuario?.nombre} ${usuario?.apellido}`} 
                      size="sm" 
                    />
                    <span className="text-sm font-medium text-foreground">{usuario?.nombre}</span>
                  </div>
                  {/* Debug Visual Temporal */}
                  <span className="text-[9px] text-red-500 font-mono">Rol: {JSON.stringify(usuario?.rol)}</span>
                </button>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Salir</span>
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2">Iniciar sesión</Link>
                <Link to="/register" className="px-4 py-2 rounded-full text-sm font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm">Registrarse</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="container px-4 py-4 space-y-1">
            <MobileNavLink to="/" label="🏠 Inicio" />
            {autenticado ? (
              <>
                {/* BOTÓN ADMIN MÓVIL */}
                {esAdmin && <MobileNavLink to="/admin" label="🛡️ Panel Admin" />}
                
                <MobileNavLink to="/profile" label="👤 Mi Perfil" />
                <MobileNavLink to="/recetas/crear" label="➕ Nueva Receta" highlight />
                <hr className="border-border my-2" />
                <div className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar 
                    src={usuario?.profilePicture || usuario?.foto?.ruta} 
                    name={`${usuario?.nombre} ${usuario?.apellido}`} 
                    size="sm" 
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">{usuario?.nombre} {usuario?.apellido}</p>
                    <p className="text-[10px] text-red-500 font-mono">Rol: {String(usuario?.rol)}</p>
                  </div>
                </div>
                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Cerrar sesión
                </button>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" label="🔑 Iniciar sesión" />
                <MobileNavLink to="/register" label="✨ Registrarse" highlight />
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const MobileNavLink: React.FC<{ to: string; label: string; highlight?: boolean }> = ({ to, label, highlight }) => (
  <Link to={to} className={cn("block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors", highlight ? "gradient-primary text-primary-foreground text-center" : "text-foreground hover:bg-muted")}>
    {label}
  </Link>
);

export default Navbar;