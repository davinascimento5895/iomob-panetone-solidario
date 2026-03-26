import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Heart } from "lucide-react";
import heroImage from "@/assets/hero-panettone.jpg";

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
          <img src={heroImage} alt="Panetone" loading="lazy" className="w-full h-44 object-cover rounded-md" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
