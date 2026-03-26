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

  const handleAdd = () => {
    if (stock <= 0) return;
    addItem({ productId: id, name, price: numericPrice, image });
  };

  return (
    <div className="bg-card rounded-md overflow-hidden border border-border/50 flex flex-col h-full">
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {imgError || !image || image === "/placeholder.svg" ? (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <ImageOff className="h-8 w-8 text-muted-foreground/30" />
          </div>
        ) : (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        )}
        {!available && (
          <div className="absolute inset-0 bg-foreground/60 flex items-center justify-center">
            <span className="text-card font-bold text-[10px] uppercase bg-destructive px-2 py-0.5 rounded">Esgotado</span>
          </div>
        )}
        {weight && (
          <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold bg-card/90 text-muted-foreground px-1.5 py-0.5 rounded">
            {weight}
          </span>
        )}
      </div>

      <div className="p-2.5 flex flex-col flex-1">
        <p className="text-xs font-bold text-card-foreground leading-tight line-clamp-2 min-h-[2lh]">{name}</p>
        <div className="mt-auto pt-1.5 flex items-center justify-between gap-1">
          <p className="text-sm font-bold text-gold">
            {price}
            <span className="text-[9px] text-muted-foreground font-medium ml-0.5">/{priceUnit}</span>
          </p>
          {available && stock > 0 && stock <= 5 && (
            <span className="text-[9px] text-destructive font-medium whitespace-nowrap">Últimas {stock}!</span>
          )}
        </div>
      </div>

      {available && (
        <div className="border-t border-border mt-auto">
          {inCart ? (
            <div className="flex items-center h-9">
              <button
                onClick={() => updateQuantity(id, inCart.quantity - 1)}
                className="h-full flex-1 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors border-r border-border"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="flex-1 text-center text-xs font-bold text-foreground">{inCart.quantity}</span>
              <button
                onClick={() => !atMax && updateQuantity(id, inCart.quantity + 1)}
                disabled={atMax}
                className="h-full flex-1 flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors border-l border-border disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAdd}
              disabled={stock <= 0}
              className="w-full h-10 flex items-center justify-center gap-2 text-sm font-semibold bg-gold text-cream hover:bg-gold-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Adicionar
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductCard;
