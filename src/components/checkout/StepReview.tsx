import { Plus, Minus, Trash2 } from "lucide-react";
import type { CartItem } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";

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
      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
        {cartWarnings.map((w, i) => (
          <p key={i} className="text-[10px] text-red-600 font-bold uppercase tracking-widest">{w}</p>
        ))}
      </div>
    )}

    <div className="space-y-2">
      {items.map((item) => {
        const stock = getStock(item.productId);
        const overStock = item.quantity > stock;
        return (
          <Card key={item.productId} className={`border-gray-100 shadow-sm rounded-xl overflow-hidden ${overStock ? "bg-red-50/30 border-red-100" : ""}`}>
            <CardContent className="p-3 flex items-center gap-3">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-contain bg-gray-50/50 p-1 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-navy-dark text-xs truncate uppercase tracking-tight">{item.name}</h3>
                <p className="text-[11px] text-gray-500">{fmt(item.price)}</p>
                {overStock && <p className="text-[9px] text-red-500 font-bold uppercase mt-1">Apenas {stock} un. disponível</p>}
              </div>
              <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden h-8">
                <button
                  onClick={() => {
                    if (item.quantity === 1) onRemoveConfirm(item.productId);
                    else updateQuantity(item.productId, item.quantity - 1);
                  }}
                  className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-navy-dark hover:bg-gray-100 transition-colors"
                >
                  {item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                </button>
                <span className="w-8 text-center font-bold text-navy-dark text-xs">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, Math.min(item.quantity + 1, stock))}
                  disabled={item.quantity >= stock}
                  className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-navy-dark hover:bg-gray-100 transition-colors disabled:opacity-20"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>

    <div className="bg-white border border-gray-100 rounded-xl p-4 flex justify-between items-center shadow-sm">
      <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Subtotal</span>
      <span className="text-lg font-bold text-navy-dark">{fmt(totalPrice)}</span>
    </div>
  </div>
);

export default StepReview;
