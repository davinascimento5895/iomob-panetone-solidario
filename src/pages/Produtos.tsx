import { useState } from "react";
import { Search, AlertCircle, RefreshCw } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";

const Produtos = () => {
  const { products, loading, error, refetch } = useProducts();
  const [search, setSearch] = useState("");

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="pt-6 pb-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-10 pt-8">
          <span className="text-sm font-semibold tracking-widest uppercase text-gold-dark">
            Campanha 2025
          </span>
          <h1 className="text-3xl md:text-5xl font-display font-bold text-foreground mt-3 mb-4">
            Nossos <span className="text-gradient-gold">Panetones</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Escolha o seu panetone e contribua para projetos sociais do Rotary Club Connect.
          </p>
        </div>

        {/* Busca */}
        <div className="max-w-sm mx-auto mb-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar panetone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-all"
          />
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[4/3]" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-12 space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm">
              {search ? `Nenhum produto encontrado para "${search}"` : "Nenhum produto disponível."}
            </p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-2 text-xs text-gold-dark hover:underline">
                Limpar busca
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {filtered.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                priceUnit={product.priceUnit}
                image={product.image}
                weight={product.weight}
                available={product.available}
              />
            ))}
          </div>
        )}

        <div className="mt-12 md:mt-16 max-w-2xl mx-auto text-center p-5 md:p-8 bg-card rounded-2xl shadow-elegant">
          <h3 className="font-display text-xl font-bold text-foreground mb-3">
            Compra no Cartão de Crédito
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Para compras no cartão de crédito, entre em contato com nosso atendimento pelo WhatsApp.
          </p>
          <a
            href="https://wa.me/5541987903434"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gold hover:bg-gold-dark text-primary font-semibold transition-colors"
          >
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </main>
  );
};

export default Produtos;
