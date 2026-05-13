import { useState } from "react";
import { Plus, Minus, ImageOff } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";

interface ProductCardProps {
  id: string;
  name: string;
  description: string;
  price: string;
  priceUnit: string;
  image: string;
  weight: string;
  available: boolean;
}

const ProductCard = ({ id, name, description, price, priceUnit, image, weight, available }: ProductCardProps) => {
  const { items, addItem, updateQuantity } = useCart();
  const { products } = useProducts();
  const [imgError, setImgError] = useState(false);
  const inCart = items.find((i) => i.productId === id);
  const product = products.find((p) => p.id === id);
  const stock = product?.stock ?? 0;
  const atMax = inCart ? inCart.quantity >= stock : stock <= 0;
  const numericPrice = parseFloat(price.replace("R$", "").replace(",", ".").trim());



  return (
    <div className="bg-white rounded-xl overflow-hidden border border-gray-100 flex flex-col h-full transition-shadow duration-300 hover:shadow-md shadow-sm">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-50/25">
        {imgError || !image || image === "/placeholder.svg" ? (
          <div className="w-full h-full flex items-center justify-center">
            <ImageOff className="h-6 w-6 text-gray-200" />
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-contain p-4"
            onError={() => setImgError(true)}
          />
        )}
        {!available && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
            <span className="text-white font-bold text-[9px] uppercase bg-gray-800 px-1.5 py-0.5 rounded shadow-sm">Esgotado</span>
          </div>
        )}
        {weight && (
          <span className="absolute top-2 right-2 text-[9px] font-medium bg-white/80 text-gray-400 px-1.5 py-0.5 rounded-full border border-gray-50">
            {weight}
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1 items-center text-center">
        <h3 className="text-xs font-semibold text-navy-dark leading-snug line-clamp-2 min-h-[2rem] mb-1 tracking-tight">
          {name}
        </h3>
        
        <div className="mt-auto space-y-2 w-full">
          <div className="flex flex-col items-center">
            <p className="text-base font-bold text-navy-dark flex items-baseline gap-0.5">
              {price.split(",")[0]}
              <span className="text-[10px]">,{price.split(",")[1]}</span>
              <span className="text-[9px] text-gray-400 font-medium ml-1">/{priceUnit}</span>
            </p>
            {available && stock > 0 && stock <= 5 && (
              <span className="text-[9px] text-destructive font-semibold">
                Últimas {stock} un.
              </span>
            )}
          </div>

          {available && (
            <div className="w-full">
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden h-8">
                <button
                  onClick={() => {
                    const newQty = Math.max(0, (inCart?.quantity || 0) - 1);
                    updateQuantity(id, newQty);
                  }}
                  className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-navy-dark hover:bg-gray-100 transition-colors"
                  aria-label="Diminuir"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                
                <input
                  type="number"
                  min="0"
                  max={stock}
                  value={inCart?.quantity || 0}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const qty = !isNaN(val) ? Math.min(stock, Math.max(0, val)) : 0;
                    updateQuantity(id, qty, { name, price: numericPrice, image });
                  }}
                  className="flex-1 w-full bg-transparent text-center text-xs font-bold text-navy-dark focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="0"
                />

                <button
                  onClick={() => {
                    const currentQty = inCart?.quantity || 0;
                    if (currentQty < stock) {
                      updateQuantity(id, currentQty + 1, { name, price: numericPrice, image });
                    }
                  }}
                  disabled={atMax}
                  className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-navy-dark hover:bg-gray-100 transition-colors disabled:opacity-20"
                  aria-label="Aumentar"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
