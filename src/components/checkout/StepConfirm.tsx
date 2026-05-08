import { Heart } from "lucide-react";
import type { CartItem } from "@/contexts/CartContext";

interface AppliedCoupon {
  code: string;
  discount: number;
}

interface Charity {
  id: string;
  name: string;
}

interface StepConfirmProps {
  items: CartItem[];
  customerName: string;
  customerPhone: string;
  selectedCharity: string | null;
  charities: Charity[];
  appliedCoupon: AppliedCoupon | null;
  notes: string;
  finalTotal: number;
  fmt: (v: number) => string;
}

const StepConfirm = ({
  items,
  customerName,
  customerPhone,
  selectedCharity,
  charities,
  appliedCoupon,
  notes,
  finalTotal,
  fmt,
}: StepConfirmProps) => (
  <div className="space-y-4">
    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Resumo da reserva</p>

    <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
      <div className="p-5 space-y-3 bg-stone-50/50">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between items-center text-sm">
            <span className="text-stone-600"><span className="font-bold text-stone-900">{item.quantity}x</span> {item.name}</span>
            <span className="font-semibold text-stone-900">{fmt(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="p-5 space-y-3 text-sm border-t border-stone-50">
        <Row label="Nome" value={customerName} />
        {customerPhone && <Row label="WhatsApp" value={customerPhone} />}
        <Row label="Pagamento" value="Na retirada" />
        
        {selectedCharity && (
          <div className="flex justify-between">
            <span className="text-stone-400">Instituição</span>
            <span className="text-stone-900 font-medium flex items-center gap-1.5">
              <Heart className="h-3 w-3 text-gold fill-gold" />
              {charities.find((c) => c.id === selectedCharity)?.name}
            </span>
          </div>
        )}
        
        {appliedCoupon && (
          <div className="flex justify-between">
            <span className="text-stone-400">Cupom</span>
            <span className="text-gold font-bold uppercase tracking-tight">{appliedCoupon.code}</span>
          </div>
        )}
        
        {notes && (
          <div className="pt-2">
            <p className="text-[10px] text-stone-400 uppercase font-bold tracking-widest mb-1">Notas</p>
            <p className="text-stone-600 italic">"{notes}"</p>
          </div>
        )}
      </div>

      <div className="p-6 flex justify-between items-center bg-stone-900 shadow-inner">
        <span className="text-stone-400 text-[10px] uppercase font-bold tracking-widest">Total final</span>
        <span className="text-2xl font-bold text-white tracking-tight">{fmt(finalTotal)}</span>
      </div>
    </div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-stone-400">{label}</span>
    <span className="text-stone-900 font-medium">{value}</span>
  </div>
);

export default StepConfirm;
