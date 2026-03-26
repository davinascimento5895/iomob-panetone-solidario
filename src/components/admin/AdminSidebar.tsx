import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Home,
  ArrowLeftRight,
  Ticket,
  Gift,
  Heart,
  Menu,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";

export type Tab = "dashboard" | "products" | "orders" | "stock" | "coupons" | "combos" | "charities" | "settings";

interface AdminSidebarProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

const tabs = [
  { id: "dashboard" as Tab, label: "Dashboard", icon: BarChart3 },
  { id: "products" as Tab, label: "Produtos", icon: Package },
  { id: "orders" as Tab, label: "Pedidos", icon: ShoppingBag },
  { id: "stock" as Tab, label: "Estoque", icon: ArrowLeftRight },
  { id: "coupons" as Tab, label: "Cupons", icon: Ticket },
  { id: "combos" as Tab, label: "Combos", icon: Gift },
  { id: "charities" as Tab, label: "Instituições", icon: Heart },
  { id: "settings" as Tab, label: "Configurações", icon: Settings },
];

export const AdminSidebar = ({ activeTab, setActiveTab }: AdminSidebarProps) => (
  <aside className="hidden md:flex flex-col w-64 gradient-navy fixed left-0 top-0 bottom-0 z-30">
    <div className="p-5 border-b border-primary-foreground/10">
      <h2 className="text-primary-foreground font-display font-bold text-lg">Painel Admin</h2>
      <p className="text-primary-foreground/50 text-xs mt-1">Gerencie sua campanha</p>
    </div>
    <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
            onClick={() => setActiveTab(tab.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
            activeTab === tab.id
              ? "bg-gold/20 text-gold"
              : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
          }`}
        >
          <tab.icon className="h-5 w-5" />
          {tab.label}
        </button>
      ))}
    </nav>
    <div className="p-3 space-y-1 border-t border-primary-foreground/10">
      <Link to="/">
        <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5">
          <Home className="h-4 w-4 mr-2" />
          Voltar ao Site
        </Button>
      </Link>
      <Link to="/login">
        <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5">
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </Link>
    </div>
  </aside>
);

export const AdminMobileHeader = ({ activeTab, setActiveTab }: AdminSidebarProps) => {
  const [open, setOpen] = useState(false);
  const currentTab = tabs.find((t) => t.id === activeTab);

  const handleSelect = (tab: Tab) => {
    setActiveTab(tab);
    setOpen(false);
  };

  return (
    <>
      {/* Top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 gradient-navy border-b border-primary-foreground/10 flex items-center justify-between px-4 h-14">
        <button onClick={() => setOpen(true)} className="text-primary-foreground p-1">
          <Menu className="h-6 w-6" />
        </button>
        <span className="text-primary-foreground font-display font-bold text-sm flex items-center gap-2">
          {currentTab && <currentTab.icon className="h-4 w-4 text-gold" />}
          {currentTab?.label || "Admin"}
        </span>
        <Link to="/" className="text-primary-foreground/60 text-xs hover:text-primary-foreground">
          <Home className="h-5 w-5" />
        </Link>
      </header>

      {/* Overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="relative w-64 gradient-navy flex flex-col animate-slide-in-left z-10 h-full">
            <div className="p-4 border-b border-primary-foreground/10 flex items-center justify-between">
              <h2 className="text-primary-foreground font-display font-bold text-base">Menu</h2>
              <button onClick={() => setOpen(false)} className="text-primary-foreground/60 hover:text-primary-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleSelect(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? "bg-gold/20 text-gold"
                      : "text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5"
                  }`}
                >
                  <tab.icon className="h-5 w-5 flex-shrink-0" />
                  {tab.label}
                </button>
              ))}
            </nav>
            <div className="p-3 space-y-1 border-t border-primary-foreground/10">
              <Link to="/" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5">
                  <Home className="h-4 w-4 mr-2" />
                  Voltar ao Site
                </Button>
              </Link>
              <Link to="/login" onClick={() => setOpen(false)}>
                <Button variant="ghost" size="sm" className="w-full justify-start text-primary-foreground/60 hover:text-primary-foreground hover:bg-primary-foreground/5">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </Link>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
