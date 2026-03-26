import { Link } from "react-router-dom";
import { ShoppingCart, ArrowRight, AlertCircle, RefreshCw } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/contexts/ProductContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";

const AppProdutos = () => {
  const { products, loading, error, refetch } = useProducts();
  const { totalItems, totalPrice } = useCart();

  return (
    <div className="p-3 md:p-6 pb-28 md:pb-6">
      {loading && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 max-w-6xl mx-auto px-2 sm:px-0">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl bg-muted animate-pulse aspect-[3/4]" />
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="text-center py-16 space-y-4">
          <AlertCircle className="h-10 w-10 text-destructive mx-auto" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        </div>
      )}

      {/* Quick cart mini-banner to reduce friction */}
      {totalItems > 0 && (
        <div className="mb-4 max-w-6xl mx-auto px-2 sm:px-0">
          <div className="bg-gold/15 border border-gold/50 text-gold-dark rounded-xl px-4 py-2 text-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span>Já temos {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho.</span>
            </div>
            <Button asChild size="sm" variant="default">
              <Link to="/checkout" aria-label="Ir para checkout" className="px-3">
                Ir para checkout
              </Link>
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4 max-w-6xl mx-auto px-2 sm:px-0">
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

      {/* Floating checkout CTA - mobile */}
      {totalItems > 0 && (
        <div className="fixed bottom-14 left-0 right-0 z-40 px-3 pb-2 md:hidden safe-area-bottom">
          <Link
            to="/checkout"
            className="flex items-center justify-between w-full bg-gold hover:bg-gold-dark text-primary rounded-xl px-4 py-3 shadow-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1.5 -right-2 bg-primary text-primary-foreground text-[9px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <span className="text-sm font-bold">Finalizar Pedido</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold">
                R$ {totalPrice.toFixed(2).replace(".", ",")}
              </span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}

      {/* Desktop checkout CTA */}
      {totalItems > 0 && (
        <div className="hidden md:block mt-6 max-w-6xl mx-auto px-2 sm:px-0">
          <Link
            to="/checkout"
            className="flex items-center justify-between bg-gold hover:bg-gold-dark text-primary rounded-xl px-5 py-3.5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-sm font-bold">
                {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
              <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
};

export default AppProdutos;
