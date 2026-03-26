import { lazy, Suspense, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import HeroSection from "@/components/HeroSection";

const AboutSection = lazy(() => import("@/components/AboutSection"));
const ProductsSection = lazy(() => import("@/components/ProductsSection"));
const FAQSection = lazy(() => import("@/components/FAQSection"));

const SectionLoader = () => (
  <div className="flex items-center justify-center py-20">
    <div className="animate-spin h-6 w-6 border-3 border-primary border-t-transparent rounded-full" />
  </div>
);

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/app/produtos", { replace: true });
      } else {
        setChecking(false);
      }
    });
  }, [navigate]);

  // Rola para a seção correta quando navega com hash de outra página
  useEffect(() => {
    if (checking) return;
    if (!location.hash) return;
    // Aguarda as seções lazy carregarem antes de rolar
    const timer = setTimeout(() => {
      const el = document.querySelector(location.hash);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }, 150);
    return () => clearTimeout(timer);
  }, [checking, location.hash]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <main>
      <HeroSection />
      <Suspense fallback={<SectionLoader />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <ProductsSection />
      </Suspense>
      <Suspense fallback={<SectionLoader />}>
        <FAQSection />
      </Suspense>
    </main>
  );
};

export default Index;
