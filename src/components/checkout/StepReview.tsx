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
  <div className="space-y-4">
    {cartWarnings.length > 0 && (
      <div className="bg-red-50 border border-red-100 rounded-xl p-3 space-y-1">
        {cartWarnings.map((w, i) => (
          <p key={i} className="text-[10px] text-red-600 font-bold uppercase tracking-tight">{w}</p>
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
            className={`flex items-center gap-4 bg-white rounded-2xl p-4 border transition-all ${
              overStock ? "border-red-200 bg-red-50/30" : "border-stone-100 shadow-sm"
            }`}
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-stone-900 truncate">{item.name}</p>
              <p className="text-xs text-stone-400">{fmt(item.price)}</p>
              {overStock && <p className="text-[10px] text-red-500 font-bold uppercase mt-1">Disponível: {stock}</p>}
            </div>
            <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-100">
              <button
                onClick={() => {
                  if (item.quantity === 1) onRemoveConfirm(item.productId);
                  else updateQuantity(item.productId, item.quantity - 1);
                }}
                className="h-7 w-7 rounded-sm flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white transition-all"
              >
                {item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
              </button>
              <span className="w-6 text-center text-sm font-bold text-stone-900">{item.quantity}</span>
              <button
                onClick={() => updateQuantity(item.productId, Math.min(item.quantity + 1, stock))}
                disabled={item.quantity >= stock}
                className="h-7 w-7 rounded-sm flex items-center justify-center text-stone-400 hover:text-stone-900 hover:bg-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>

    <div className="bg-stone-900 rounded-2xl p-5 flex justify-between items-center shadow-lg shadow-stone-900/10">
      <span className="text-stone-400 text-sm font-medium uppercase tracking-widest">Total</span>
      <span className="text-xl font-bold text-white">{fmt(totalPrice)}</span>
    </div>
  </div>
);

export default StepReview;
