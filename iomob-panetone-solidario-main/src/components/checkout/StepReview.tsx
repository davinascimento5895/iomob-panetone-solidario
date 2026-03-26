import { Plus, Minus, Trash2 } from "lucide-react";
import type { CartItem } from "@/contexts/CartContext";

interface StepReviewProps {
  items: CartItem[];
  cartWarnings: string[];
  getStock: (id: string) => number;
  updateQuantity: (id: string, qty: number) => void;
  onRemoveConfirm: (id: string) => void;
  fmt: (v: number) => string;
  totalPrice: number;
}

const StepReview = ({
  items,
  cartWarnings,
  getStock,
  updateQuantity,
  onRemoveConfirm,
  fmt,
  totalPrice,
}: StepReviewProps) => (
  <div className="space-y-3 animate-fade-in">
    {cartWarnings.length > 0 && (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-3 space-y-1">
        {cartWarnings.map((w, i) => (
          <p key={i} className="text-xs text-destructive font-medium">⚠️ {w}</p>
        ))}
      </div>
    )}

    <div className="space-y-2">
      {items.map((item) => {
        const stock = getStock(item.productId);
        const overStock = item.quantity > stock;
        return (
          <div
            key={item.productId}
            className={`flex items-center gap-3 bg-card rounded-xl p-3 border ${
              overStock ? "border-destructive/50" : "border-border"
            }`}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{item.name}</p>
              <p className="text-xs text-muted-foreground">{fmt(item.price)} / un</p>
              {overStock && <p className="text-[10px] text-destructive">Máx: {stock}</p>}
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => {
                  if (item.quantity === 1) onRemoveConfirm(item.productId);
                  else updateQuantity(item.productId, item.quantity - 1);
                }}
                className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              </button>
              <span className="w-6 text-center text-sm font-bold text-foreground">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, Math.min(item.quantity + 1, stock))}
                disabled={item.quantity >= stock}
                className="h-7 w-7 rounded-lg bg-gold/10 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <p className="text-sm font-bold text-foreground flex-shrink-0 min-w-[4.5rem] text-right">
              {fmt(item.price * item.quantity)}
            </p>
          </div>
        );
      })}
    </div>

    <div className="bg-card rounded-xl p-3 border border-border flex justify-between items-center">
      <span className="font-display font-bold text-foreground">Total</span>
      <span className="text-lg font-bold text-gold">{fmt(totalPrice)}</span>
    </div>
  </div>
);

export default StepReview;
