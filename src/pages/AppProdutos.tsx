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
    <div className="p-3 md:p-5 pb-24 md:pb-5 min-h-screen bg-gray-50/50">
      {/* Barra de Progresso de Frete Grátis - Versão Compacta */}
      {!loading && !error && (
        <div className="mb-6 max-w-7xl mx-auto">
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm transition-all">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${totalItems >= 10 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                  <ShoppingCart className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy-dark">
                    {totalItems >= 10 
                      ? "Frete grátis liberado" 
                      : `${10 - totalItems === 1 ? "Falta" : "Faltam"} ${10 - totalItems} ${10 - totalItems === 1 ? "unidade" : "unidades"} para o frete grátis!`}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {totalItems >= 10 
                      ? "O benefício será aplicado no checkout." 
                      : "Pedidos a partir de 10 unidades não possuem custo de entrega."}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 flex-1 max-w-md">
                <div className="flex-1 space-y-1.5">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-700 ease-out ${totalItems >= 10 ? 'bg-green-500' : 'bg-gold'}`}
                      style={{ width: `${Math.min(100, (totalItems / 10) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase">
                    <span>{totalItems} de 10 unidades</span>
                  </div>
                </div>

                {totalItems > 0 && (
                  <Button asChild size="sm" className="bg-navy hover:bg-navy-dark text-white rounded-lg px-4 h-9 font-semibold shrink-0">
                    <Link to="/checkout">
                      Checkout • R$ {totalPrice.toFixed(2).replace(".", ",")}
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5 max-w-7xl mx-auto">
          {products.map((product) => (
            <div key={product.id}>
              <ProductCard
                id={product.id}
                name={product.name}
                description={product.description}
                price={product.price}
                priceUnit={product.priceUnit}
                image={product.image}
                weight={product.weight}
                available={product.available}
              />
            </div>
          ))}
        </div>
      )}


    </div>
  );
};

export default AppProdutos;
