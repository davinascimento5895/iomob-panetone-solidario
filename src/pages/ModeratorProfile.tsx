import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Phone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LogoutConfirm from "@/components/LogoutConfirm";
import { markManualSignOut } from "@/lib/authHelpers";

const ModeratorProfile = () => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setName(session.user.user_metadata?.full_name || "");
        setPhone(session.user.user_metadata?.phone || "");
      }
    });
  }, []);

  const handleSave = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: name, phone },
    });
    if (error) {
      toast.error("Erro ao salvar.");
      return;
    }
    if (user) {
      await supabase.from("profiles").upsert({ id: user.id, full_name: name, phone, updated_at: new Date().toISOString() });
    }
    toast.success("Dados atualizados!");
  };

  const handleLogout = async () => {
    try { markManualSignOut(); } catch (e) {}
    try { await supabase.auth.signOut(); } catch (e) {}
    navigate("/");
  };

  return (
    <div className="p-4 md:p-6 max-w-lg mx-auto">
      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center gap-3 pb-4 border-b border-border">
            <div className="h-12 w-12 rounded-full bg-gold/10 flex items-center justify-center">
              <User className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="font-display font-bold text-foreground">{name || "Moderador"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Completo</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefone / WhatsApp</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input id="phone" type="tel" placeholder="(11) 99999-9999" value={phone} onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                const formatted = v.length > 6
                  ? `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`
                  : v.length > 2
                  ? `(${v.slice(0,2)}) ${v.slice(2)}`
                  : v;
                setPhone(formatted);
              }} className="pl-9" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={user?.email || ""} disabled className="opacity-60" />
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold rounded-xl">Salvar Alterações</Button>
            <LogoutConfirm onConfirm={handleLogout}>
              <Button variant="outline" className="w-32">Sair</Button>
            </LogoutConfirm>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ModeratorProfile;
