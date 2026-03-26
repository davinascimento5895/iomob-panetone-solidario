import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ShoppingBag, ShoppingCart, ClipboardList, Settings, LogOut } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import rotaryLogo from "@/assets/logo-rotary.svg";

const navItems = [
  { label: "Produtos", href: "/app/produtos", icon: ShoppingBag },
  { label: "Carrinho", href: "/app/carrinho", icon: ShoppingCart },
  { label: "Pedidos", href: "/app/pedidos", icon: ClipboardList },
  { label: "Configurações", href: "/app/config", icon: Settings },
];

const pageTitles: Record<string, string> = {
  "/app/produtos": "Catálogo",
  "/app/carrinho": "Carrinho",
  "/app/pedidos": "Meus Pedidos",
  "/app/config": "Configurações",
};

const AuthenticatedLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();
  const { totalItems } = useCart();
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login", { state: { redirect: location.pathname } });
        return;
      }
      setUserName(session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "");
      setLoading(false);
    };
    check();

    // Redireciona imediatamente se sessão expirar ou usuário fizer logout em outra aba
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login", { replace: true });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const isActive = (href: string) => location.pathname === href;
  const currentTitle = pageTitles[location.pathname] || "Panetone Solidário";

  // Mobile
  if (isMobile) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Mobile header — mesmo padrão da landing: logo centralizada */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="grid grid-cols-3 items-center h-14 px-4">
            <div className="flex justify-start">
              <span className="text-xs text-navy-dark/50 font-medium truncate">
                Olá, {userName.split(" ")[0]}
              </span>
            </div>
            <div className="flex justify-center">
              <Link to="/app/produtos">
                <img src={rotaryLogo} alt="Rotary" className="h-8" />
              </Link>
            </div>
            <div className="flex justify-end">
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-navy-dark/50 hover:text-navy-dark hover:bg-gray-100 transition-colors"
                aria-label="Sair"
              >
                <LogOut className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 pb-16 overflow-y-auto">
          <Outlet />
        </main>

        {/* Bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
          <div className="flex items-center justify-around h-14">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors relative ${
                    active ? "text-gold-dark" : "text-navy-dark/40"
                  }`}
                >
                  {active && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gold rounded-full" />
                  )}
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.href === "/app/carrinho" && totalItems > 0 && (
                      <span className="absolute -top-1.5 -right-2.5 bg-gold text-navy-dark text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] font-medium ${active ? "text-gold-dark" : ""}`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    );
  }

  // Desktop: sidebar branca + header
  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Sidebar branca */}
      <aside className="sticky top-0 h-screen flex flex-col bg-white border-r border-gray-200 w-56">
        {/* Logo — visível sobre fundo branco */}
        <div className="flex items-center h-16 border-b border-gray-200 px-4">
          <Link to="/app/produtos" className="flex items-center gap-2.5">
            <img src={rotaryLogo} alt="Rotary" className="h-9" />
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-3 px-2 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  active
                    ? "bg-gold/10 text-gold-dark"
                    : "text-navy-dark/55 hover:text-navy-dark hover:bg-gray-100"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <Icon className="h-4.5 w-4.5" />
                  {item.href === "/app/carrinho" && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 bg-gold text-navy-dark text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-2 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-navy-dark/40 hover:text-navy-dark hover:bg-gray-100 transition-colors w-full"
          >
            <LogOut className="h-4.5 w-4.5 flex-shrink-0" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header desktop — consistente com sidebar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between px-6 h-16">
            <h1 className="text-base font-semibold text-navy-dark">{currentTitle}</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-navy-dark/50">
                Olá, <span className="font-semibold text-navy-dark">{userName.split(" ")[0]}</span>
              </span>
              <button
                onClick={handleLogout}
                className="text-sm flex items-center gap-1.5 text-navy-dark/40 hover:text-navy-dark transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;
