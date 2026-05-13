
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Search, Check, ChevronsUpDown } from "lucide-react";
import logoRotary from "@/assets/logo-rotary.svg";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { setClubSession } from "@/lib/clubAuth";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface Club {
  id: string;
  name: string;
}

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = (location.state as any)?.redirect || "/app/produtos";

  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgot, setIsForgot] = useState(false);

  useEffect(() => {
    const fetchClubs = async () => {
      const { data, error } = await supabase
        .from("clubs")
        .select("id, name")
        .order("name");
      if (error) {
        console.error("Error fetching clubs:", error);
      } else {
        setClubs(data || []);
      }
    };
    fetchClubs();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClub) {
      toast.error("Por favor, selecione seu clube.");
      return;
    }
    setLoading(true);

    try {
      // Call the Edge Function for login
      const { data, error } = await supabase.functions.invoke("club-auth", {
        body: {
          action: "login",
          club_id: selectedClub.id,
          password: password.trim(),
        },
      });

      if (error) {
        console.error("Full Edge Function Error Object:", JSON.stringify(error, null, 2));
        
        let errorMessage = "Erro na autenticação";
        
        // Try multiple ways to get the error body from Supabase error object
        const resp = (error as any).context || (error as any).response;
        
        if (resp && typeof resp.json === 'function') {
          try {
            const errorData = await resp.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            console.error("Failed to parse error JSON from response", e);
          }
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        throw new Error(errorMessage);
      }

      if (data?.error) throw new Error(data.error);

      // Store the custom session
      setClubSession({
        token: data.token,
        club: data.club,
      });

      // Set the session in Supabase client for RLS
      await supabase.auth.setSession({
        access_token: data.token,
        refresh_token: "",
      });

      toast.success(`Bem-vindo, ${data.club.name}!`);

      if (data.requiresPasswordChange) {
        navigate("/change-password", { state: { club_id: data.club.id, current_password: password } });
      } else {
        navigate(redirect);
      }
    } catch (err: any) {
      console.error("Login Error Details:", err);
      
      let message = "Não foi possível autenticar.";
      
      if (err.message?.includes("Senha incorreta")) {
        message = err.message;
      } else if (err.message?.includes("401") || err.message === "Senha inválida") {
        message = "Senha incorreta";
      } else if (err.message?.includes("JWT_SECRET")) {
        message = "Erro de configuração: JWT_SECRET ausente.";
      } else if (err.message) {
        message = err.message;
      }
      
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (isForgot) {
    return (
      <main className="min-h-screen bg-gray-50/50 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
            <div className="text-center mb-8">
              <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
                <img src={logoRotary} alt="Rotary" className="h-10 mx-auto" />
              </Link>
              <h1 className="text-xl font-bold text-navy-dark uppercase tracking-widest leading-tight">Esqueci minha senha</h1>
              <p className="text-gray-400 mt-4 text-xs font-medium uppercase tracking-widest leading-relaxed">Instruções para redefinição</p>
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-lg p-5 mb-8">
              <p className="text-[11px] text-navy-dark leading-relaxed font-medium">
                Para redefinir a senha do seu clube, envie um e-mail para <span className="font-bold text-navy">suporte@solidario.com.br</span> com o assunto <span className="italic">"Reset de senha — {selectedClub?.name || '[Nome do Clube]'}"</span>. Nossa equipe entrará em contato.
              </p>
            </div>

            <Button onClick={() => setIsForgot(false)} className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-11 transition-all active:scale-[0.98]">
              VOLTAR AO LOGIN
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50/50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm">
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6 hover:opacity-80 transition-opacity">
              <img src={logoRotary} alt="Rotary" className="h-10 mx-auto" />
            </Link>
            <h1 className="text-xl font-bold text-navy-dark tracking-tight uppercase tracking-widest">Acesso por Clube</h1>
            <p className="text-gray-400 mt-2 text-xs font-medium uppercase tracking-widest leading-relaxed">Selecione seu clube e digite a senha</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Seu Clube</Label>
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-11 bg-gray-50 border-gray-100 rounded-lg text-sm font-medium text-navy-dark hover:bg-gray-100/80 transition-colors"
                  >
                    {selectedClub
                      ? selectedClub.name
                      : "Pesquisar clube..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                  <Command className="rounded-lg shadow-xl border-gray-100">
                    <CommandInput placeholder="Digite o nome do clube..." className="h-11" />
                    <CommandList className="max-h-[300px]">
                      <CommandEmpty>Nenhum clube encontrado.</CommandEmpty>
                      <CommandGroup>
                        {clubs.map((club) => (
                          <CommandItem
                            key={club.id}
                            value={club.name}
                            onSelect={() => {
                              setSelectedClub(club);
                              setOpen(false);
                            }}
                            className="py-3 px-4 text-sm font-medium text-navy-dark cursor-pointer hover:bg-navy/5 transition-colors"
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 text-navy transition-all",
                                selectedClub?.id === club.id ? "opacity-100 scale-100" : "opacity-0 scale-50"
                              )}
                            />
                            {club.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {selectedClub && (
              <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <Label htmlFor="password" className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-11 bg-gray-50 border-gray-100 rounded-lg text-sm focus-visible:ring-navy/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-navy transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <div className="text-right mt-2">
                  <button type="button" onClick={() => setIsForgot(true)} className="text-[10px] font-bold text-gray-400 hover:text-navy uppercase tracking-widest transition-colors">
                    Esqueci minha senha
                  </button>
                </div>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading || !selectedClub || !password} 
              className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-12 transition-all active:scale-[0.98] shadow-md shadow-navy/10 disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ENTRANDO...
                </div>
              ) : "ENTRAR"}
            </Button>
          </form>

          <div className="mt-10 pt-6 border-t border-gray-50 text-center">
             <Link to="/" className="text-[10px] font-bold text-gray-300 hover:text-navy uppercase tracking-widest transition-colors">
              Voltar para o site
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
