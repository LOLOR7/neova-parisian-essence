import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { setAdminAuthed } from "./AdminLayout";

const PIN = "1234";

const AdminLogin = () => {
  const nav = useNavigate();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === PIN) {
      setAdminAuthed(true);
      nav("/admin/demandes", { replace: true });
    } else {
      setErr("Code incorrect.");
      setCode("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bone px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-background border border-hairline p-10 rounded-sm"
        style={{ boxShadow: "var(--shadow-soft, 0 10px 40px -20px rgba(0,0,0,.15))" }}
      >
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-foreground text-background mx-auto">
          <Lock size={18} />
        </div>
        <h1 className="font-display text-2xl text-center mt-6">Espace Super Admin</h1>
        <p className="text-center text-sm text-slate-soft mt-2">Saisissez votre code d'accès</p>

        <input
          autoFocus
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => { setCode(e.target.value); setErr(""); }}
          placeholder="••••"
          className="mt-8 w-full text-center tracking-[0.5em] text-2xl bg-transparent border-b border-hairline focus:border-foreground py-3 focus:outline-none"
        />
        {err && <p className="text-sm text-destructive mt-3 text-center">{err}</p>}

        <button type="submit" className="mt-8 w-full bg-foreground text-background py-3 text-sm uppercase tracking-[0.2em]">
          Entrer
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;