import ProductCard from "./ProductCard";
import { useProducts } from "@/contexts/ProductContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

const ProductsSection = () => {
  const { products, loading, error, refetch } = useProducts();

  return (
    <section id="produtos" className="py-24 md:py-32 bg-muted/40 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold/3 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
          <span className="text-xs font-bold tracking-[0.25em] uppercase text-gold-dark">
            Nossos Produtos
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
            Escolha o seu <span className="text-gradient-gold">Panetone</span>
          </h2>
          <div className="w-16 h-1 bg-gold rounded-full mx-auto" />
          <p className="text-muted-foreground text-lg max-w-lg mx-auto">
            Todos os panetones são feitos com ingredientes selecionados e muito carinho.
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
            ))}
          </div>
        )}

        {error && !loading && (
          <div className="max-w-sm mx-auto text-center py-10 space-y-4">
            <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </Button>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            {products.map((product) => (
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

        <div className="text-center mt-14">
          <Link to="/produtos">
            <Button
              variant="outline"
              className="border-2 border-navy/20 text-navy hover:bg-navy hover:text-white font-semibold rounded-2xl px-10 h-12 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
            >
              Ver todos os produtos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductsSection;
