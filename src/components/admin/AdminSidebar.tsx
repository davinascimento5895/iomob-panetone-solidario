
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Package, 
  ClipboardList, 
  Boxes, 
  Tag, 
  Heart, 
  History, 
  Settings,
  LogOut,
  Menu
} from "lucide-react";

type Tab = "dashboard" | "products" | "orders" | "stock" | "coupons" | "combos" | "charities" | "clubs" | "settings" | "logs";

interface AdminSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  role?: "admin" | "staff";
}

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "orders", label: "Pedidos", icon: ShoppingBag },
  { id: "clubs", label: "Clubes", icon: Users },
  { id: "products", label: "Produtos", icon: Package },
  { id: "stock", label: "Estoque", icon: ClipboardList },
  { id: "combos", label: "Combos", icon: Boxes },
  { id: "coupons", label: "Cupons", icon: Tag },
  { id: "charities", label: "Instituições", icon: Heart },
  { id: "logs", label: "Logs", icon: History },
  { id: "settings", label: "Configurações", icon: Settings },
];

export const AdminSidebar = ({ activeTab, setActiveTab, role = "admin" }: AdminSidebarProps) => {
  const navigate = useNavigate();

  const filteredTabs = tabs.filter(tab => {
    if (role === "staff") {
      return ["dashboard", "orders", "products", "stock", "coupons", "charities", "logs"].includes(tab.id);
    }
    return true;
  });

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
        <h2 className="text-white font-display font-bold text-xl tracking-tight">
          {role === "admin" ? "Painel Admin" : "Painel Equipe"}
        </h2>
        <p className="text-white/60 text-xs font-medium mt-1">
          {role === "admin" ? "Gestão Centralizada" : "Logística e Retirada"}
        </p>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {filteredTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-navy-dark shadow-lg translate-x-1"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-navy" : "text-white/40"}`} />
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
        >
          <LogOut className="h-4 w-4 opacity-50" />
          Sair do Painel
        </button>
      </div>
    </aside>
  );
};

export const AdminMobileHeader = ({ activeTab, setActiveTab, role = "admin" }: AdminSidebarProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const currentTab = tabs.find((t) => t.id === activeTab);

  const filteredTabs = tabs.filter(tab => {
    if (role === "staff") {
      return ["dashboard", "orders", "products", "stock", "coupons", "charities", "logs"].includes(tab.id);
    }
    return true;
  });

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
        <button onClick={() => setOpen(true)} className="text-white p-2 hover:bg-white/5 rounded-lg transition-colors flex items-center gap-2">
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Menu</span>
        </button>
        <span className="text-white font-display font-bold text-base tracking-tight flex items-center gap-2">
          {currentTab?.label || (role === "admin" ? "Admin" : "Equipe")}
        </span>
        <button onClick={handleLogout} className="text-white/40 p-2 hover:text-white transition-colors">
          Sair
        </button>
      </header>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-navy-dark border-none">
          <div className="flex flex-col h-full gradient-navy">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-white font-display font-bold text-xl tracking-tight">
                {role === "admin" ? "Painel Admin" : "Painel Equipe"}
              </h2>
            </div>
            <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
              {filteredTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSelect(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-white text-navy-dark shadow-lg"
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  }`}
                >
                  <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-navy" : "text-white/40"}`} />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="p-4 border-t border-white/10">
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all"
              >
                <LogOut className="h-4 w-4 opacity-50" />
                Sair da Conta
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};
