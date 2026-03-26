import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ProductProvider } from "./contexts/ProductContext";
import { CartProvider } from "./contexts/CartContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import AdminRoute from "./components/AdminRoute";
import AuthenticatedLayout from "./components/AuthenticatedLayout";
import { supabase } from "./integrations/supabase/client";

// Protege qualquer rota — redireciona para /login se não autenticado
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "ok" | "redirect">("loading");
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setStatus(session ? "ok" : "redirect");
    });
  }, []);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  if (status === "redirect") {
    return <Navigate to="/login" state={{ redirect: location.pathname }} replace />;
  }
  return <>{children}</>;
};

const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Produtos = lazy(() => import("./pages/Produtos"));

// App (authenticated) pages - eagerly loaded for instant navigation
import AppProdutos from "./pages/AppProdutos";
import AppCarrinho from "./pages/AppCarrinho";
import AppPedidos from "./pages/AppPedidos";
import AppConfig from "./pages/AppConfig";

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isApp = location.pathname.startsWith("/app");
  const hideChrome = isAdmin || isApp || location.pathname === "/checkout";

  return (
    <>
      {!hideChrome && <Navbar />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<><Index /><Footer /></>} />
          <Route path="/login" element={<Login />} />
          <Route path="/checkout" element={<RequireAuth><Checkout /></RequireAuth>} />
          <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />

          {/* Authenticated area */}
          <Route path="/app" element={<AuthenticatedLayout />}>
            <Route index element={<Navigate to="/app/produtos" replace />} />
            <Route path="produtos" element={<AppProdutos />} />
            <Route path="carrinho" element={<AppCarrinho />} />
            <Route path="pedidos" element={<AppPedidos />} />
            <Route path="config" element={<AppConfig />} />
          </Route>

          {/* Legacy redirects */}
          <Route path="/produtos" element={<><Produtos /><Footer /></>} />
          <Route path="/carrinho" element={<Navigate to="/app/carrinho" replace />} />
          <Route path="/meus-pedidos" element={<Navigate to="/app/pedidos" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProductProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppLayout />
          </BrowserRouter>
        </CartProvider>
      </ProductProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
