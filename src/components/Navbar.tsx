import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingCart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import rotaryLogo from "@/assets/logo-rotary.svg";

const navLinks = [
  { label: "Início", href: "/", isHash: false },
  { label: "Produtos", href: "/produtos", isHash: false },
  { label: "Sobre", href: "/#sobre", isHash: true },
  { label: "FAQ", href: "/#faq", isHash: true },
  { label: "Contato", href: "/#contato", isHash: true },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems } = useCart();

  const handleNavClick = (link: typeof navLinks[0]) => {
    setMobileOpen(false);
    if (link.isHash) {
      const hash = link.href.replace("/", "");
      if (location.pathname === "/") {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
        setActiveHash(hash);
        window.history.replaceState(null, "", link.href);
      } else {
        navigate(link.href);
      }
    } else {
      setActiveHash("");
      navigate(link.href);
    }
  };

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveHash("");
    } else if (location.hash) {
      setActiveHash(location.hash);
    }
  }, [location.pathname, location.hash]);

  // Fecha o menu ao redimensionar para desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const isLinkActive = (link: typeof navLinks[0]) => {
    if (link.isHash) {
      return location.pathname === "/" && activeHash === link.href.replace("/", "");
    }
    return location.pathname === link.href && !activeHash;
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200">
        {/* Desktop layout */}
        <div className="hidden md:flex items-center h-16 container mx-auto px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center flex-shrink-0 mr-8">
            <img src={rotaryLogo} alt="Rotary Club Connect" className="h-9" />
          </Link>

          {/* Nav links — centro */}
          <nav className="flex items-center gap-1 flex-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link)}
                className={`text-sm px-3 py-1.5 rounded-lg transition-colors duration-150 font-medium ${
                  isLinkActive(link)
                    ? "text-gold-dark bg-gold/10"
                    : "text-navy-dark/55 hover:text-navy-dark hover:bg-gray-100"
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Ações — direita */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/app/carrinho"
              className="relative p-2 rounded-lg text-navy-dark/55 hover:text-navy-dark hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-gold text-navy-dark text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              )}
            </Link>

            <Link
              to="/login"
              className="text-sm font-medium text-navy-dark/55 hover:text-navy-dark px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Entrar
            </Link>

            <Link
              to="/app/produtos"
              className="inline-flex"
            >
              <Button className="px-4 py-2 h-10 font-semibold">Comprar Agora <ArrowRight className="ml-2 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>

        {/* Mobile layout — 3 colunas: toggle | logo | carrinho */}
        <div className="md:hidden grid grid-cols-3 items-center h-14 px-4">
          <div className="flex justify-start">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="p-2 rounded-lg text-navy-dark hover:bg-gray-100 transition-colors"
              aria-label="Abrir menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          <div className="flex justify-center">
            <Link to="/" onClick={() => setMobileOpen(false)}>
              <img src={rotaryLogo} alt="Rotary Club Connect" className="h-8" />
            </Link>
          </div>

          <div className="flex justify-end">
            <Link
              to="/app/carrinho"
              className="relative p-2 rounded-lg text-navy-dark hover:bg-gray-100 transition-colors"
            >
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-gold text-navy-dark text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center leading-none">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white" style={{ animation: "none" }}>
            <nav className="px-4 py-3 flex flex-col">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link)}
                  className={`text-left text-sm font-medium px-3 py-3 rounded-xl transition-colors ${
                    isLinkActive(link)
                      ? "text-gold-dark bg-gold/8"
                      : "text-navy-dark/70 hover:text-navy-dark hover:bg-gray-50"
                  }`}
                >
                  {link.label}
                </button>
              ))}

              <div className="h-px bg-gray-100 my-3" />

              <div className="flex gap-2 pb-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center text-sm font-semibold text-navy-dark border border-gray-200 hover:bg-gray-50 py-2.5 rounded-xl transition-colors"
                >
                  Entrar
                </Link>
                <Link to="/app/produtos" onClick={() => setMobileOpen(false)} className="flex-1">
                  <Button className="w-full py-2.5">Comprar Agora</Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Spacer para compensar a navbar fixa */}
      <div className="h-16 md:h-16" />
    </>
  );
};

export default Navbar;
