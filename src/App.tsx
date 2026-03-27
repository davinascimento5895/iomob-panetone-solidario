import { lazy, Suspense, useEffect, useState } from "react";
import { runWhenIdle } from "@/lib/deferThirdParty";
// UI providers/components are lazy-loaded so they don't bloat the initial bundle
const Toaster = lazy(() => import("@/components/ui/toaster").then((m) => ({ default: m.Toaster })));
const SonnerToaster = lazy(() => import("@/components/ui/sonner").then((m) => ({ default: m.Toaster })));
const TooltipProviderLazy = lazy(() => import("@/components/ui/tooltip").then((m) => ({ default: m.TooltipProvider })));
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { ProductProvider } from "./contexts/ProductContext";
import { CartProvider } from "./contexts/CartContext";
const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
import AdminRoute from "./components/AdminRoute";
import ModeratorRoute from "./components/ModeratorRoute";
// Authenticated layout and app pages are lazy-loaded to avoid
// bundling the entire authenticated area into the initial chunk.
const AuthenticatedLayout = lazy(() => import("./components/AuthenticatedLayout"));
// Supabase client is imported dynamically inside auth checks to avoid
// adding it to the initial client bundle.

// Protege qualquer rota — redireciona para /login se não autenticado
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const [status, setStatus] = useState<"loading" | "ok" | "redirect">("loading");
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    // dynamic import to avoid loading supabase in the initial bundle
    import("./integrations/supabase/client").then(({ supabase }) => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        setStatus(session ? "ok" : "redirect");
      }).catch(() => {
        // If there's an error, redirect to login
        if (mounted) setStatus("redirect");
      });
    }).catch(() => {
      // If there's an error importing, redirect to login
      if (mounted) setStatus("redirect");
    });

    return () => {
      mounted = false;
    };
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
const Moderator = lazy(() => import("./pages/Moderator"));
const Checkout = lazy(() => import("./pages/Checkout"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Produtos = lazy(() => import("./pages/Produtos"));

// App (authenticated) pages - lazy-loaded to keep initial bundle small
const AppProdutos = lazy(() => import("./pages/AppProdutos"));
const AppCarrinho = lazy(() => import("./pages/AppCarrinho"));
const AppPedidos = lazy(() => import("./pages/AppPedidos"));
const AppConfig = lazy(() => import("./pages/AppConfig"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
  </div>
);

const AppLayout = () => {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const isModerator = location.pathname.startsWith("/moderator");
  const isApp = location.pathname.startsWith("/app");
  const hideChrome = isAdmin || isApp || isModerator || location.pathname === "/checkout";

  return (
    <>
      {!hideChrome && (
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      )}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<>
            <Index />
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </>} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/checkout"
            element={
              <QueryClientProvider client={queryClient}>
                <ProductProvider>
                  <RequireAuth>
                    <Checkout />
                  </RequireAuth>
                </ProductProvider>
              </QueryClientProvider>
            }
          />
          <Route
            path="/admin"
            element={
              <QueryClientProvider client={queryClient}>
                <ProductProvider>
                  <AdminRoute>
                    <Admin />
                  </AdminRoute>
                </ProductProvider>
              </QueryClientProvider>
            }
          />

          <Route
            path="/moderator"
            element={
              <QueryClientProvider client={queryClient}>
                <ModeratorRoute>
                  <Moderator />
                </ModeratorRoute>
              </QueryClientProvider>
            }
          />

          {/* Authenticated area - providers mounted only when /app is accessed */}
          <Route
            path="/app"
            element={
              <QueryClientProvider client={queryClient}>
                <ProductProvider>
                  <AuthenticatedLayout />
                </ProductProvider>
              </QueryClientProvider>
            }
          >
            <Route index element={<Navigate to="/app/produtos" replace />} />
            <Route path="produtos" element={<AppProdutos />} />
            <Route path="carrinho" element={<AppCarrinho />} />
            <Route path="pedidos" element={<AppPedidos />} />
            <Route path="config" element={<AppConfig />} />
          </Route>

          {/* Legacy redirects */}
          <Route path="/produtos" element={<ProductProvider>
            <Produtos />
            <Suspense fallback={null}>
              <Footer />
            </Suspense>
          </ProductProvider>} />
          <Route path="/carrinho" element={<Navigate to="/app/carrinho" replace />} />
          <Route path="/meus-pedidos" element={<Navigate to="/app/pedidos" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
};

const App = () => (
  <Suspense fallback={null}>
    <TooltipProviderLazy>
      <Suspense fallback={null}>
        <Toaster />
      </Suspense>
      <Suspense fallback={null}>
        <SonnerToaster />
      </Suspense>
      <CartProvider>
        <BrowserRouter future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}>
          <AppLayout />
        </BrowserRouter>
      </CartProvider>
    </TooltipProviderLazy>
  </Suspense>
);

// Schedule non-critical prefetches during idle to improve later navigations
try {
  if (typeof window !== "undefined") {
    runWhenIdle(() => {
      // warm up some UI and icon libraries in idle time
      import("sonner");
      import("lucide-react");
    });
  }
} catch (e) {
  // ignore
}

export default App;
