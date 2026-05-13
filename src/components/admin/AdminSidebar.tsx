
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  RotateCcw, 
  Tag, 
  Gift, 
  Heart, 
  Settings, 
  Menu, 
  Home,
  LogOut
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Tab = "dashboard" | "products" | "orders" | "stock" | "coupons" | "combos" | "charities" | "clubs" | "settings";

interface AdminSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "clubs", label: "Clubes", icon: Users },
  { id: "products", label: "Produtos", icon: Package },
  { id: "stock", label: "Estoque", icon: RotateCcw },
  { id: "combos", label: "Combos", icon: Gift },
  { id: "coupons", label: "Cupons", icon: Tag },
  { id: "charities", label: "Instituições", icon: Heart },
  { id: "settings", label: "Configurações", icon: Settings },
];

export const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair.");
    } else {
      navigate("/");
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 gradient-navy fixed left-0 top-0 bottom-0 z-30 shadow-2xl">
      <div className="p-6 border-b border-white/10">
        <h2 className="text-white font-display font-bold text-xl tracking-tight">Painel Admin</h2>
        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mt-1">Gestão Centralizada</p>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-navy-dark shadow-lg translate-x-1"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon className={`h-4 w-4 transition-colors ${activeTab === tab.id ? "text-gray-400" : "text-white/40"}`} />
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="h-4 w-4 text-white/40" />
          Sair do Painel
        </button>
      </div>
    </aside>
  );
};

export const AdminMobileHeader = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const currentTab = tabs.find((t) => t.id === activeTab);

  const handleSelect = (tab: Tab) => {
    setActiveTab(tab);
    setOpen(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <>
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 gradient-navy border-b border-white/10 flex items-center justify-between px-4 h-16 shadow-lg">
        <button onClick={() => setOpen(true)} className="text-white p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Menu className="h-6 w-6 text-gray-400" />
        </button>
        <span className="text-white font-display font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          {currentTab && <currentTab.icon className="h-4 w-4 text-gray-400" />}
          {currentTab?.label || "Admin"}
        </span>
        <button onClick={handleLogout} className="text-white/40 p-2 hover:text-white transition-colors">
          <LogOut className="h-5 w-5 text-gray-400" />
        </button>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-navy-dark border-none">
          <div className="flex flex-col h-full gradient-navy">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-white font-display font-bold text-xl tracking-tight">Painel Admin</h2>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSelect(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-navy-dark shadow-lg"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className={`h-4 w-4 flex-shrink-0 ${activeTab === tab.id ? "text-gray-400" : "text-white/40"}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/40 hover:text-white hover:bg-white/5 transition-all"
              >
                <LogOut className="h-4 w-4 text-white/40" />
                Sair da Conta
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
