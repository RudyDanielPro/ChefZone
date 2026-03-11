// ============================================================
// ChefZone — Panel de Administración
// Gestiona usuarios, recetas y categorías
// ============================================================
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Users,
  Utensils,
  FolderTree,
  Trash2,
  Edit,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
  Heart
} from "lucide-react";
import { cn } from "@/lib/utils";

// Servicios admin (en español)
import { obtenerTodosUsuarios, eliminarUsuario, actualizarRol } from "@/services/admin/users";
import { obtenerTodasRecetas, eliminarReceta } from "@/services/admin/recipes";
import { obtenerTodasCategorias, crearCategoria, actualizarCategoria, eliminarCategoria } from "@/services/admin/categories";

type Pestaña = "usuarios" | "recetas" | "categorias";

// Interfaces basadas EXACTAMENTE en lo que devuelve el backend
interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  usuario: string;
  rol: string | null;
  fotoPerfil: string | null;
  recetasCount?: number;
}

interface RecetaAdmin {
  id: number;
  titulo: string;
  categoriaNombre: string;
  autorNombre: string;
  cantidadLikes: number; // 🟢 ¡Cambiado de likesCount a cantidadLikes!
}

interface CategoriaAdmin {
  id: number;
  nombre: string;
  descripcion?: string;
  recetasCount?: number;
}

const AdminDashboard: React.FC = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pestaña, setPestaña] = useState<Pestaña>("usuarios");
  const [cargando, setCargando] = useState(true);

  // Estados para cada tabla
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [recetas, setRecetas] = useState<RecetaAdmin[]>([]);
  const [categorias, setCategorias] = useState<CategoriaAdmin[]>([]);

  // Paginación
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Búsqueda
  const [busqueda, setBusqueda] = useState("");
  const [busquedaInput, setBusquedaInput] = useState("");

  // Modal para categorías
  const [modalCategoriaAbierto, setModalCategoriaAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<CategoriaAdmin | null>(null);
  const [formCategoria, setFormCategoria] = useState({ nombre: "", descripcion: "" });
  const [guardandoCategoria, setGuardandoCategoria] = useState(false);

  // Debounce para búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setBusqueda(busquedaInput);
      setPagina(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [busquedaInput]);

  // Cargar datos según pestaña
  useEffect(() => {
    if (usuario?.rol !== "ADMIN") {
      navigate("/");
      return;
    }
    cargarDatos();
  }, [pestaña, pagina, busqueda]);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      if (pestaña === "usuarios") {
        const data = await obtenerTodosUsuarios({ pagina, busqueda }) as any;

        console.log("👥 DATA BRUTA DE USUARIOS:", data); // 👈 ESTO ES CLAVE PARA DEBUGEAR

        // Extraemos la lista buscando en todas las posibles ubicaciones de Spring Boot
        const lista = data?.content || data?.usuarios || (Array.isArray(data) ? data : []);

        setUsuarios(lista);

        // Actualizamos metadatos de paginación
        setTotalPaginas(data?.totalPages || data?.totalPaginas || 1);
        setTotalItems(data?.totalElements || data?.total || lista.length);
      } else if (pestaña === "recetas") {
        // 🟢 AQUÍ ESTABA EL FALLO: El bloque estaba vacío. Ahora pedimos las recetas.
        try {
          // Asumiendo que obtenerTodasRecetas acepta paginación/búsqueda
          const data = await obtenerTodasRecetas({ pagina, busqueda }) as any;
          const lista = data?.content || data?.recetas || (Array.isArray(data) ? data : []);
          setRecetas(lista);
          setTotalPaginas(data?.totalPages || data?.totalPaginas || 1);
          setTotalItems(data?.totalElements || data?.total || lista.length);
        } catch (err) {
          console.error("Error en recetas:", err);
          setRecetas([]);
        }

      } else if (pestaña === "categorias") {
        try {
          const data = await obtenerTodasCategorias() as any;

          console.log("🔎 DATA BRUTA DE CATEGORÍAS:", data);

          let lista = [];
          if (Array.isArray(data)) {
            lista = data;
          } else if (data && Array.isArray(data.content)) {
            lista = data.content;
          } else if (data && Array.isArray(data.categorias)) {
            lista = data.categorias;
          } else if (data && typeof data === 'object' && data.id) {
            console.warn("⚠️ El backend devolvió un solo objeto, no un arreglo.");
            lista = [data];
          }

          console.log("✅ LISTA PROCESADA PARA LA TABLA:", lista);
          setCategorias(lista);

        } catch (err) {
          console.error("Error en categorías:", err);
          setCategorias([]);
        }
      }
    } catch (error) {
      toast.error("Error al cargar datos");
      console.error("Error detallado:", error);
    } finally {
      setCargando(false);
    }
  };

  const manejarEliminarUsuario = async (usuarioId: number, nombreCompleto: string) => {
    if (!confirm(`¿Eliminar al usuario "${nombreCompleto}"?\nEsta acción no se puede deshacer.`)) return;

    try {
      await eliminarUsuario(usuarioId);
      toast.success("Usuario eliminado");
      cargarDatos();
    } catch (error) {
      toast.error("Error al eliminar usuario");
    }
  };

  const manejarCambiarRol = async (usuarioId: number, rolActual: string) => {
    // Determinamos el nuevo rol manteniendo el formato que ya tiene
    const tienePrefijo = rolActual.startsWith("ROLE_");
    const baseRol = rolActual.replace("ROLE_", "");

    const nuevoRolBase = baseRol === "ADMIN" ? "USER" : "ADMIN";
    const nuevoRolFinal = tienePrefijo ? `ROLE_${nuevoRolBase}` : nuevoRolBase;

    try {
      await actualizarRol(usuarioId, nuevoRolFinal);
      toast.success(`Rol actualizado a ${nuevoRolBase}`);
      cargarDatos();
    } catch (error) {
      toast.error("Error al actualizar rol. Revisa los permisos del backend.");
    }
  };

  const manejarEliminarReceta = async (recetaId: number, titulo: string) => {
    if (!confirm(`¿Eliminar la receta "${titulo}"?`)) return;

    try {
      await eliminarReceta(recetaId);
      toast.success("Receta eliminada");
      cargarDatos();
    } catch (error) {
      toast.error("Error al eliminar receta");
    }
  };

  const manejarEnviarCategoria = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCategoria.nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setGuardandoCategoria(true);
    try {
      if (categoriaEditando) {
        await actualizarCategoria(categoriaEditando.id, formCategoria);
        toast.success("Categoría actualizada");
      } else {
        await crearCategoria(formCategoria);
        toast.success("Categoría creada");
      }
      setModalCategoriaAbierto(false);
      setCategoriaEditando(null);
      setFormCategoria({ nombre: "", descripcion: "" });
      cargarDatos();
    } catch (error) {
      toast.error("Error al guardar categoría");
    } finally {
      setGuardandoCategoria(false);
    }
  };

  const manejarEliminarCategoria = async (categoriaId: number, nombre: string) => {
    if (!confirm(`¿Eliminar la categoría "${nombre}"?`)) return;

    try {
      await eliminarCategoria(categoriaId);
      toast.success("Categoría eliminada");
      cargarDatos();
    } catch (error) {
      toast.error("Error al eliminar categoría");
    }
  };

  const usuariosFiltrados = usuarios.filter(u =>
    (u.nombre?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
    (u.email?.toLowerCase() || "").includes(busqueda.toLowerCase()) ||
    (u.usuario?.toLowerCase() || "").includes(busqueda.toLowerCase())
  );


  if (usuario?.rol !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container py-12 text-center">
          <Shield className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Acceso denegado</h1>
          <p className="text-muted-foreground">No tienes permisos de administrador</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container py-8">
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground mb-2">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground">
              Gestiona usuarios, recetas y categorías del sistema
            </p>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg border border-border self-start">
            <Shield className="w-5 h-5 text-primary" />
            <span className="font-medium">Admin: {usuario?.nombre} {usuario?.apellido}</span>
          </div>
        </div>

        {/* Pestañas */}
        <div className="flex gap-1 border-b border-border mb-6 overflow-x-auto pb-1">
          {[
            { id: "usuarios" as Pestaña, label: "Usuarios", icon: Users, count: totalItems },
            { id: "recetas" as Pestaña, label: "Recetas", icon: Utensils, count: totalItems },
            { id: "categorias" as Pestaña, label: "Categorías", icon: FolderTree, count: categorias.length },
          ].map(({ id, label, icon: Icon, count }) => (
            <button
              key={id}
              onClick={() => { setPestaña(id); setPagina(1); setBusqueda(""); setBusquedaInput(""); }}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                pestaña === id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
              {count > 0 && (
                <span className={cn(
                  "ml-1 px-1.5 py-0.5 rounded-full text-xs",
                  pestaña === id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                )}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Barra de búsqueda (excepto categorías) */}
        {pestaña !== "categorias" && (
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={busquedaInput}
                onChange={(e) => setBusquedaInput(e.target.value)}
                placeholder={`Buscar ${pestaña === "usuarios" ? "usuarios por nombre o email" : "recetas por título"}`}
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              {busquedaInput && (
                <button
                  onClick={() => setBusquedaInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Contenido */}
        {cargando ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Tabla de Usuarios */}
            {pestaña === "usuarios" && (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => navigate("/registro")}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Users className="w-4 h-4" />
                    Nuevo Usuario
                  </button>
                </div>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Usuario</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Rol</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Recetas</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {usuariosFiltrados.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                              No se encontraron usuarios
                            </td>
                          </tr>
                        ) : (
                          usuariosFiltrados.map(user => (
                            <tr key={user.id} className="hover:bg-muted/50 transition-colors">
                              {/* Columna 1: Usuario y Foto */}
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                                    {user.fotoPerfil ? (
                                      <img src={user.fotoPerfil} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <span className="text-xs font-bold text-primary">
                                        {user.nombre?.charAt(0)}{user.apellido?.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  <div>
                                    <p className="font-medium text-foreground">{user.nombre} {user.apellido}</p>
                                    <p className="text-xs text-muted-foreground">@{user.usuario}</p>
                                    <span className={cn(
                                      "inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                                      // Verificamos si contiene ADMIN (sea ROLE_ADMIN o ADMIN)
                                      user.rol?.toUpperCase().includes("ADMIN")
                                        ? "bg-red-500/20 text-red-600"
                                        : "bg-emerald-500/20 text-emerald-600"
                                    )}>
                                      {user.rol?.replace("ROLE_", "") || "USER"}
                                    </span>
                                  </div>
                                </div>
                              </td>

                              {/* Columna 2: Email */}
                              <td className="px-4 py-3 text-sm">{user.email}</td>

                              {/* Columna 3: Rol */}
                              <td className="px-4 py-3">
                                <span className={cn(
                                  "inline-flex px-2 py-1 rounded-full text-xs font-medium",
                                  (user.rol || "USER").includes("ADMIN") ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                )}>
                                  {user.rol?.replace("ROLE_", "") || "USER"}
                                </span>
                              </td>

                              {/* Columna 4: Recetas */}
                              <td className="px-4 py-3 text-sm">{user.recetasCount || 0}</td>

                              {/* Columna 5: Acciones */}
                              <td className="px-4 py-3 text-right space-x-2">
                                <button
                                  onClick={() => manejarCambiarRol(user.id, user.rol || "USER")}
                                  className="p-1.5 rounded-lg text-xs bg-muted hover:bg-muted/80 transition-colors"
                                  title="Cambiar rol"
                                >
                                  <Shield className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => manejarEliminarUsuario(user.id, `${user.nombre} ${user.apellido}`)}
                                  className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Eliminar usuario"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}


            {/* Tabla de Recetas */}
            {pestaña === "recetas" && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Título</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Categoría</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Autor</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground uppercase">Likes</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {recetas.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                            No se encontraron recetas
                          </td>
                        </tr>
                      ) : (
                        recetas.map(receta => (
                          <tr key={receta.id} className="hover:bg-muted/50 transition-colors">
                            {/* 1. TÍTULO */}
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">{receta.titulo}</p>
                            </td>

                            {/* 2. CATEGORÍA */}
                            <td className="px-4 py-3 text-sm">
                              <span className="px-2 py-1 rounded-full bg-secondary text-[10px] font-medium uppercase">
                                {receta.categoriaNombre || "Sin categoría"}
                              </span>
                            </td>

                            {/* 3. AUTOR */}
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {receta.autorNombre}
                            </td>

                            {/* 4. LIKES (Centrado y funcional) */}
                            {/* Ejemplo en tu tabla de Admin */}
                            <td className="px-4 py-2 text-center font-medium">
                              <div className="flex items-center justify-center gap-1 text-red-500">
                                <Heart size={14} fill="currentColor" />
                                {/* 🟢 Usamos cantidadLikes para que coincida con el backend */}
                                {Number(receta.cantidadLikes) || 0}
                              </div>
                            </td>

                            {/* 5. ACCIONES (Alineadas a la derecha) */}
                            <td className="px-4 py-3 text-right space-x-2">
                              <button
                                onClick={() => navigate(`/recetas/${receta.id}`)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                                title="Ver receta"
                              >
                                <Search className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => manejarEliminarReceta(receta.id, receta.titulo)}
                                className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                title="Eliminar receta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}


            {/* Tabla de Categorías */}
            {pestaña === "categorias" && (
              <>
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => {
                      setCategoriaEditando(null);
                      setFormCategoria({ nombre: "", descripcion: "" });
                      setModalCategoriaAbierto(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <span>+</span>
                    Nueva Categoría
                  </button>
                </div>

                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead className="bg-muted">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nombre</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Descripción</th>
                          {/* 🗑️ La columna de Recetas ya no está aquí */}
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {categorias.length === 0 ? (
                          <tr>
                            <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                              No hay categorías creadas
                            </td>
                          </tr>
                        ) : (
                          categorias.map(cat => (
                            <tr key={cat.id} className="hover:bg-muted/50 transition-colors">
                              <td className="px-4 py-3 font-medium">{cat.nombre}</td>
                              <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                                {cat.descripcion || "-"}
                              </td>
                              {/* 🗑️ La celda de count ya no está aquí */}
                              <td className="px-4 py-3 text-right space-x-2">
                                <button
                                  onClick={() => {
                                    setCategoriaEditando(cat);
                                    setFormCategoria({
                                      nombre: cat.nombre,
                                      descripcion: cat.descripcion || ""
                                    });
                                    setModalCategoriaAbierto(true);
                                  }}
                                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => manejarEliminarCategoria(cat.id, cat.nombre)}
                                  className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* Paginación */}
            {pestaña !== "categorias" && totalPaginas > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPagina(p => Math.max(1, p - 1))}
                  disabled={pagina === 1}
                  className="p-2 rounded-lg border border-border disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm px-4">
                  Página {pagina} de {totalPaginas}
                </span>
                <button
                  onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                  disabled={pagina === totalPaginas}
                  className="p-2 rounded-lg border border-border disabled:opacity-50 hover:bg-muted transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal para categorías */}
      {modalCategoriaAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl shadow-lg max-w-md w-full">
            <form onSubmit={manejarEnviarCategoria} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold">
                  {categoriaEditando ? "Editar Categoría" : "Nueva Categoría"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalCategoriaAbierto(false)}
                  className="p-1 rounded-lg hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Nombre <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formCategoria.nombre}
                    onChange={(e) => setFormCategoria(f => ({ ...f, nombre: e.target.value }))}
                    placeholder="Ej: Postres, Carnes, Pastas..."
                    required
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <textarea
                    value={formCategoria.descripcion}
                    onChange={(e) => setFormCategoria(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Descripción opcional de la categoría..."
                    rows={3}
                    className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setModalCategoriaAbierto(false)}
                  className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-muted transition-colors"
                  disabled={guardandoCategoria}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardandoCategoria || !formCategoria.nombre.trim()}
                  className="px-4 py-2 rounded-lg gradient-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {guardandoCategoria && <Loader2 className="w-4 h-4 animate-spin" />}
                  {categoriaEditando ? "Actualizar" : "Crear"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;