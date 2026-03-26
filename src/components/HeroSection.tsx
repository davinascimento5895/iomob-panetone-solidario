import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart } from "lucide-react";
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
    <section className="py-12 bg-navy-dark text-cream">
      <div className="container mx-auto px-4 flex flex-col lg:flex-row items-center gap-6">
        <div className="w-full lg:w-1/2">
          <h1 className="text-3xl font-display font-bold">Panetone Solidário</h1>
          <p className="mt-3 text-sm text-cream/90 max-w-lg">Ao comprar um panetone, você ajuda projetos locais do Rotary. Escolha com calma e finalize seu pedido com segurança.</p>

          <div className="mt-4 flex gap-3">
            <Link to="/app/produtos">
              <Button className="px-6 h-10 font-semibold">Ver Produtos</Button>
            </Link>
            <button
              onClick={() => document.getElementById("sobre")?.scrollIntoView({ behavior: "smooth" })}
              className="px-4 h-10 rounded-md bg-navy text-cream/90 border border-navy/80"
            >
              Saiba Mais
            </button>
          </div>
        </div>

        <div className="w-full lg:w-1/2">
          <picture>
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
              className="w-full h-44 object-cover rounded-md"
            />
          </picture>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
