import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Mail, Phone, MapPin } from "lucide-react";
import iomobLogo from "@/assets/logo-iomob.png";
import rotaryLogo from "@/assets/logo-rotary.svg";

const Footer = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleHashLink = (hash: string) => {
    if (location.pathname === "/") {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/" + hash);
    }
  };

  return (
    <footer id="contato" className="bg-navy-dark text-white relative overflow-hidden">
      {/* Top border line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gold/20" />

      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <img src={rotaryLogo} alt="Rotary" className="h-10 brightness-0 invert opacity-80" />
              <div className="flex flex-col leading-tight">
                <span className="font-display text-lg font-bold text-white">Panetone</span>
                <span className="font-display text-sm font-semibold text-gold -mt-0.5">Solidário</span>
              </div>
            </div>
            <p className="text-white/40 text-sm leading-relaxed">
              Uma iniciativa do Rotary Club Connect para transformar vidas
              através da solidariedade.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/40">
              <Heart className="h-4 w-4 text-gold/60" />
              <span>Feito com amor para a comunidade</span>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-[0.2em] mb-6 text-gold/80">
              Links Rápidos
            </h4>
            <div className="flex flex-col gap-3">
              <Link to="/" className="text-sm text-white/40 hover:text-gold transition-colors duration-200">
                Início
              </Link>
              <Link to="/produtos" className="text-sm text-white/40 hover:text-gold transition-colors duration-200">
                Produtos
              </Link>
              <button onClick={() => handleHashLink("#sobre")} className="text-sm text-white/40 hover:text-gold transition-colors duration-200 text-left">
                Sobre
              </button>
              <button onClick={() => handleHashLink("#faq")} className="text-sm text-white/40 hover:text-gold transition-colors duration-200 text-left">
                FAQ
              </button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-xs uppercase tracking-[0.2em] mb-6 text-gold/80">
              Contato
            </h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 text-sm text-white/40">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Mail className="h-4 w-4 text-gold/60" />
                </div>
                <span>iomob@iomob.com</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Phone className="h-4 w-4 text-gold/60" />
                </div>
                <a href="https://api.whatsapp.com/send?phone=5541987903434&text=Ol%C3%A1,%20preciso%20de%20ajuda%20com%20o%20RotaryConnect" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">(41) 98790-3434</a>
              </div>
              <div className="flex items-center gap-3 text-sm text-white/40">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4 w-4 text-gold/60" />
                </div>
                <span>Rotary Club Connect</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/5 mt-14 pt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/20">Desenvolvido por</span>
            <img src={iomobLogo} alt="ioMob Tecnologia" className="h-5 brightness-0 invert opacity-30" />
          </div>
          <p className="text-xs text-white/20">
            Copyright © 2026 ioMob Todos os Direitos Reservados
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
