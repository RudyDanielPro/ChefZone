// ============================================================
// ChefZone — Navbar Component
// Responsive navigation with auth state and mobile hamburger
// ============================================================
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, ChefHat, Plus, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import UserAvatar from "./UserAvatar";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled
          ? "bg-card/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-card border-b border-border"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="ChefZone" className="w-9 h-9" />
            <span className="font-display font-bold text-xl text-gradient-primary">
              ChefZone
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === "/" ? "text-primary" : "text-muted-foreground"
              )}
            >
              Inicio
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/profile"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-primary",
                    location.pathname === "/profile" ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  Mi Perfil
                </Link>
                <button
                  onClick={() => navigate("/recipes/create")}
                  className={cn(
                    "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold",
                    "gradient-primary text-primary-foreground",
                    "hover:opacity-90 transition-opacity shadow-sm"
                  )}
                >
                  <Plus className="w-4 h-4" />
                  Nueva Receta
                </button>
              </>
            )}
          </nav>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <UserAvatar
                    src={user?.profilePicture}
                    name={`${user?.firstName} ${user?.lastName}`}
                    size="sm"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {user?.firstName}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden lg:inline">Salir</span>
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-3 py-2"
                >
                  Iniciar sesión
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-full text-sm font-semibold gradient-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden p-2 rounded-lg text-foreground hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-fade-in">
          <div className="container px-4 py-4 space-y-1">
            <MobileNavLink to="/" label="🏠 Inicio" />

            {isAuthenticated ? (
              <>
                <MobileNavLink to="/profile" label="👤 Mi Perfil" />
                <MobileNavLink to="/recipes/create" label="➕ Nueva Receta" highlight />
                <hr className="border-border my-2" />
                <div className="flex items-center gap-3 px-3 py-2">
                  <UserAvatar
                    src={user?.profilePicture}
                    name={`${user?.firstName} ${user?.lastName}`}
                    size="sm"
                  />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">@{user?.username}</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
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

const MobileNavLink: React.FC<{ to: string; label: string; highlight?: boolean }> = ({
  to,
  label,
  highlight,
}) => (
  <Link
    to={to}
    className={cn(
      "block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
      highlight
        ? "gradient-primary text-primary-foreground text-center"
        : "text-foreground hover:bg-muted"
    )}
  >
    {label}
  </Link>
);

export default Navbar;
