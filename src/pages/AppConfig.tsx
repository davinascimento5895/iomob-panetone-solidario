import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User, Phone } from "lucide-react";

const AppConfig = () => {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

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

    // Sync with profiles table
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        full_name: name,
        phone,
        updated_at: new Date().toISOString(),
      });
    }

    toast.success("Dados atualizados!");
  };

  return (
    <div className="p-3 md:p-5 pb-24 md:pb-5 min-h-screen bg-gray-50/50">
      <Card className="max-w-md mx-auto border-gray-100 shadow-sm rounded-xl overflow-hidden">
        <CardContent className="p-5 space-y-5 bg-white">
          <div className="flex items-center gap-3 pb-5 border-b border-gray-50">
            <div className="h-10 w-10 rounded-lg bg-gray-50 flex items-center justify-center">
              <User className="h-5 w-5 text-navy-dark" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-navy-dark truncate leading-tight uppercase tracking-tight">{name || "Usuário"}</p>
              <p className="text-[10px] text-gray-400 font-medium truncate uppercase tracking-widest">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="h-10 bg-white border-gray-100 rounded-lg text-sm focus:ring-navy/5"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Telefone / WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phone}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 11);
                    const formatted = v.length > 6
                      ? `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`
                      : v.length > 2
                      ? `(${v.slice(0,2)}) ${v.slice(2)}`
                      : v;
                    setPhone(formatted);
                  }}
                  className="pl-9 h-10 bg-white border-gray-100 rounded-lg text-sm focus:ring-navy/5"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">E-mail</Label>
              <Input id="email" name="email" value={user?.email || ""} disabled className="h-10 bg-gray-50/50 border-gray-100 rounded-lg text-sm opacity-50 cursor-not-allowed" />
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-10 shadow-sm transition-all active:scale-[0.98]"
          >
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AppConfig;
