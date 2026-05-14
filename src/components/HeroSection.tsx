import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroJpg from "@/assets/hero-panettone.jpg";
import heroAvif480 from "@/assets/hero-panettone-480.avif";
import heroAvif768 from "@/assets/hero-panettone-768.avif";
import heroAvif1024 from "@/assets/hero-panettone-1024.avif";
import heroAvif1600 from "@/assets/hero-panettone-1600.avif";
import heroWebp480 from "@/assets/hero-panettone-480.webp";
import heroWebp768 from "@/assets/hero-panettone-768.webp";
import heroWebp1024 from "@/assets/hero-panettone-1024.webp";
import heroWebp1600 from "@/assets/hero-panettone-1600.webp";

const HeroSection = () => {
  return (
    <section className="relative py-16 lg:py-24 bg-navy-dark text-cream overflow-hidden">
      {/* Efeito sutil de iluminação no fundo */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(148,124,78,0.05),transparent)] pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 xl:gap-20">
          <div className="w-full lg:w-1/2 space-y-6">
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-bold tracking-tight leading-[1.1] text-cream">
              Panetone Solidário
            </h1>
            <p className="text-lg text-cream/90 max-w-lg leading-relaxed antialiased">
              Ao comprar um panetone, você ajuda projetos locais do Rotary. 
              Escolha com calma e finalize seu pedido com segurança.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/app/produtos">
                <Button 
                  size="lg" 
                  className="bg-gold hover:bg-gold-dark text-navy-dark px-8 h-12 text-base font-semibold transition-all active:scale-95 shadow-lg shadow-gold/10"
                >
                  Ver Produtos
                </Button>
              </Link>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-navy/40 border-cream/30 text-cream hover:bg-navy/60 px-8 h-12 text-base font-medium backdrop-blur-sm transition-all"
              >
                Saiba Mais
              </Button>
            </div>
          </div>

          <div className="w-full lg:w-1/2">
            <div className="relative group">
              <picture className="relative block">
                <source
                  type="image/avif"
                  srcSet={`${heroAvif480} 480w, ${heroAvif768} 768w, ${heroAvif1024} 1024w, ${heroAvif1600} 1600w`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <source
                  type="image/webp"
                  srcSet={`${heroWebp480} 480w, ${heroWebp768} 768w, ${heroWebp1024} 1024w, ${heroWebp1600} 1600w`}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <img
                  src={heroJpg}
                  alt="Panetone"
                  decoding="async"
                  fetchpriority="high"
                  className="w-full h-[300px] lg:h-[420px] object-cover rounded-2xl shadow-2xl shadow-black/40 border border-cream/10"
                />
              </picture>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

