import ProductCard from "./ProductCard";
import { useProducts } from "@/contexts/ProductContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertCircle, RefreshCw } from "lucide-react";

const ProductsSection = () => {
  const { products, loading, error, refetch } = useProducts();

  return (
    <section id="produtos" className="py-12 bg-cream">
      <div className="container mx-auto px-4 relative">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <h2 className="text-2xl font-display font-bold text-foreground">Nossos Produtos</h2>
          <p className="text-sm text-muted-foreground mt-2">Escolha seu panetone com tranquilidade — sem distrações.</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
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

        <div className="text-center mt-8">
          <Link to="/produtos">
            <Button variant="outline" className="border px-6 h-10 rounded-md">
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
