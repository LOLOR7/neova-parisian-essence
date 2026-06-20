import { ReactNode, useEffect, useState } from "react";
import { Link, NavLink, Navigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Inbox, Users, Send, Settings, LogOut, ShieldCheck, FileSignature, FileText, ChevronsLeft, ChevronsRight } from "lucide-react";

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

const navItems = [
  { to: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/admin/demandes", label: "Demandes", icon: Inbox },
  { to: "/admin/workflow", label: "Workflow", icon: FileSignature },
  { to: "/admin/accords", label: "Templates accords", icon: FileText },
  { to: "/admin/reseau", label: "Réseau", icon: Users },
  { to: "/admin/envois", label: "Envois", icon: Send },
  { to: "/admin/parametres", label: "Paramètres", icon: Settings },
];

export const AdminLayout = ({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) => {
  const logout = () => {
    setAdminAuthed(false);
    window.location.href = "/admin/login";
  };

  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("neova_admin_sidebar_collapsed") === "1";
  });
  useEffect(() => {
    localStorage.setItem("neova_admin_sidebar_collapsed", collapsed ? "1" : "0");
  }, [collapsed]);

  return (
    <div className="min-h-screen flex" style={{ background: "hsl(34 22% 95%)" }}>
      {/* Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white border-r transition-[width] duration-200 ${collapsed ? "md:w-[72px]" : "md:w-[260px]"}`}
        style={{ borderColor: "hsl(30 12% 88%)" }}
      >
        <Link to="/admin" className={`flex items-center gap-3 border-b ${collapsed ? "px-3 py-5 justify-center" : "px-6 py-6"}`} style={{ borderColor: "hsl(30 12% 90%)" }}>
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white"
            style={{ background: "hsl(213 28% 22%)" }}
          >
            <ShieldCheck size={18} />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <p className="font-display text-lg" style={{ color: "hsl(213 28% 18%)" }}>NEOVA</p>
              <p className="text-[10px] tracking-[0.25em] uppercase text-slate-500">Admin</p>
            </div>
          )}
        </Link>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              title={it.label}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${collapsed ? "justify-center" : ""} ${
                  isActive
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <it.icon size={17} strokeWidth={1.8} />
              {!collapsed && <span>{it.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-2">
          <button
            onClick={() => setCollapsed((v) => !v)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-800 ${collapsed ? "justify-center" : ""}`}
            title={collapsed ? "Déplier" : "Replier"}
          >
            {collapsed ? <ChevronsRight size={15} /> : <><ChevronsLeft size={15} /><span>Replier</span></>}
          </button>
        </div>

        <div className="p-3 border-t" style={{ borderColor: "hsl(30 12% 90%)" }}>
          <div className={`flex items-center gap-3 rounded-xl bg-slate-50 ${collapsed ? "p-2 justify-center" : "px-3 py-2.5"}`}>
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-medium"
              style={{ background: "hsl(213 28% 30%)" }}
            >
              SA
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 leading-tight">
                  <p className="text-sm font-medium text-slate-800">Super Admin</p>
                  <p className="text-[11px] text-slate-500">Neova</p>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-white"
                  title="Quitter"
                >
                  <LogOut size={15} />
                </button>
              </>
            )}
          </div>
          {collapsed && (
            <button
              onClick={logout}
              className="mt-2 w-full flex justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              title="Quitter"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top nav */}
        <div className="md:hidden bg-white border-b px-4 py-3 flex items-center gap-2 overflow-x-auto" style={{ borderColor: "hsl(30 12% 90%)" }}>
          {navItems.map((it) => (
            <NavLink
              key={it.to}
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `whitespace-nowrap px-3 py-1.5 rounded-full text-xs ${
                  isActive ? "bg-slate-900 text-white" : "text-slate-600 bg-slate-100"
                }`
              }
            >
              {it.label}
            </NavLink>
          ))}
        </div>

        {/* Top bar */}
        <header className="bg-white/70 backdrop-blur border-b" style={{ borderColor: "hsl(30 12% 90%)" }}>
          <div className="px-6 md:px-10 py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl" style={{ color: "hsl(213 28% 18%)" }}>{title}</h1>
              {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
            </div>
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main className="flex-1 px-6 md:px-10 py-8">{children}</main>
      </div>
    </div>
  );
};

/* ---------- Shared UI primitives ---------- */

export const Card = ({ className = "", children }: { className?: string; children: ReactNode }) => (
  <div
    className={`bg-white rounded-2xl border ${className}`}
    style={{ borderColor: "hsl(30 12% 90%)", boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 8px 24px -12px rgba(15,23,42,0.06)" }}
  >
    {children}
  </div>
);

export const PrimaryButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 transition-colors ${className}`}
  >
    {children}
  </button>
);

export const SecondaryButton = ({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    {...props}
    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-slate-200 text-slate-700 hover:border-slate-400 hover:text-slate-900 disabled:opacity-50 transition-colors ${className}`}
  >
    {children}
  </button>
);

export const SearchInput = ({
  value,
  onChange,
  placeholder = "Rechercher…",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="relative">
    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl w-64 focus:outline-none focus:border-slate-500 placeholder:text-slate-400"
    />
  </div>
);

export const STATUS_STYLES: Record<string, string> = {
  "Nouvelle": "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  "À qualifier": "bg-amber-50 text-amber-700 ring-1 ring-amber-100",
  "Contacté": "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  "Envoyé au réseau": "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
  "Clôturé": "bg-slate-50 text-slate-500 ring-1 ring-slate-200",
};

export const StatusBadge = ({ s }: { s: string }) => (
  <span className={`inline-flex items-center px-2.5 py-1 text-[11px] font-medium rounded-full ${STATUS_STYLES[s] || "bg-slate-100 text-slate-600"}`}>
    {s}
  </span>
);
