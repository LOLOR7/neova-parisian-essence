import { AdminLayout, Card, SecondaryButton } from "./AdminLayout";
import { setAdminAuthed } from "./AdminLayout";
import { Lock, Mail, ShieldCheck, LogOut } from "lucide-react";

const AdminParametres = () => {
  const logout = () => { setAdminAuthed(false); window.location.href = "/admin/login"; };

  return (
    <AdminLayout title="Paramètres" subtitle="Configuration de votre espace Super Admin.">
      <div className="grid lg:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Compte Super Admin</h3>
              <p className="text-xs text-slate-500">Accès protégé par code PIN</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            L'accès à l'espace administrateur est protégé par un code à 4 chiffres.
            Pour changer le code, contactez votre développeur.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Emails de routage</h3>
              <p className="text-xs text-slate-500">Envoi vers les contacts du réseau</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            L'envoi d'emails est prêt. Il sera activé une fois le domaine d'envoi configuré.
            En attendant, chaque envoi est enregistré dans l'historique.
          </p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-900">Sécurité</h3>
              <p className="text-xs text-slate-500">Session locale</p>
            </div>
          </div>
          <p className="text-sm text-slate-600">
            Votre session reste ouverte tant que cet onglet est actif. Quittez l'espace pour la fermer.
          </p>
          <SecondaryButton onClick={logout} className="mt-4">
            <LogOut size={14} /> Quitter l'espace admin
          </SecondaryButton>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminParametres;
