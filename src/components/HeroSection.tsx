import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart } from "lucide-react";
import heroImage from "@/assets/hero-panettone.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-stretch overflow-hidden">
      {/* Left: Content on solid navy */}
      <div className="relative z-10 w-full lg:w-1/2 bg-navy-dark flex items-center lg:justify-end">
        <div className="relative w-full lg:max-w-[620px] px-6 sm:px-8 md:px-12 lg:px-14 xl:px-16 pt-10 pb-16 lg:py-20">
          <div className="max-w-[480px] mx-auto lg:mx-0 space-y-7">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/10 border border-gold/20">
              <Sparkles className="h-4 w-4 text-gold flex-shrink-0" />
              <span className="text-sm font-semibold text-gold tracking-wide">
                Campanha Solidária 2026
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-display font-bold leading-[0.95]">
                <span className="text-white block">Panetone</span>
                <span className="text-gold block mt-2">Solidário</span>
              </h1>
              <div className="w-20 h-1 bg-gold rounded-full" />
            </div>

            <p className="text-base sm:text-lg text-white/60 max-w-md leading-relaxed font-light">
              Ao comprar um Panetone Solidário, você se torna parceiro do Rotary
              em diversos projetos humanitários na sua comunidade.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link to="/app/produtos">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gold hover:bg-gold-dark text-navy-dark font-bold text-base px-8 rounded-2xl h-12 sm:h-14 transition-colors duration-200"
                >
                  Ver Produtos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button
                size="lg"
                onClick={() => document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" })}
                className="w-full sm:w-auto border-2 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:border-white/25 text-base px-8 rounded-2xl h-12 sm:h-14 font-semibold transition-colors duration-200"
              >
                Saiba Mais
              </Button>
            </div>

            <div className="flex items-center gap-5 pt-2">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-gold/60 flex-shrink-0" />
                <span className="text-xs text-white/35 font-medium">5.000+ famílias ajudadas</span>
              </div>
              <div className="w-px h-4 bg-white/15 flex-shrink-0" />
              <span className="text-xs text-white/35 font-medium">100% do lucro revertido</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Clean image, no gradients */}
      <div className="hidden lg:block w-1/2 relative">
        <img
          src={heroImage}
          alt="Panetone Solidário"
          loading="eager"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Mobile: show image at bottom with better visibility */}
      <div
        className="lg:hidden absolute bottom-0 left-0 right-0 h-56 bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/50 to-transparent" />
      </div>
    </section>
  );
};

export default HeroSection;
