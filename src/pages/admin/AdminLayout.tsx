import { ReactNode } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

const ADMIN_KEY = "neova_admin_ok";

export const isAdminAuthed = () => sessionStorage.getItem(ADMIN_KEY) === "1";
export const setAdminAuthed = (v: boolean) => {
  if (v) sessionStorage.setItem(ADMIN_KEY, "1");
  else sessionStorage.removeItem(ADMIN_KEY);
};

export const AdminGate = ({ children }: { children: ReactNode }) => {
  const loc = useLocation();
  if (!isAdminAuthed()) {
    return <Navigate to="/admin/login" state={{ from: loc.pathname }} replace />;
  }
  return <>{children}</>;
};

export const AdminLayout = ({ children }: { children: ReactNode }) => {
  const logout = () => {
    setAdminAuthed(false);
    window.location.href = "/admin/login";
  };

  const tabs = [
    { to: "/admin/demandes", label: "Demandes reçues" },
    { to: "/admin/reseau", label: "Réseau" },
    { to: "/admin/envois", label: "Envois" },
  ];

  return (
    <div className="min-h-screen bg-bone">
      <header className="border-b border-hairline bg-background">
        <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 flex items-center justify-between">
          <Link to="/admin/demandes" className="font-display text-lg tracking-tight">
            Neova <span className="text-muted-foreground text-sm tracking-[0.2em] uppercase ml-2">Admin</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm rounded-sm transition-colors ${
                    isActive
                      ? "bg-foreground text-background"
                      : "text-slate-soft hover:text-foreground"
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </nav>
          <button
            onClick={logout}
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground inline-flex items-center gap-2"
          >
            <LogOut size={14} /> Quitter
          </button>
        </div>
        <div className="md:hidden border-t border-hairline">
          <div className="max-w-7xl mx-auto px-6 flex overflow-x-auto">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                className={({ isActive }) =>
                  `whitespace-nowrap px-4 py-3 text-sm border-b-2 ${
                    isActive ? "border-foreground" : "border-transparent text-slate-soft"
                  }`
                }
              >
                {t.label}
              </NavLink>
            ))}
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-6 md:px-10 py-10">{children}</main>
    </div>
  );
};