import { Heart } from "lucide-react";
import type { CartItem } from "@/contexts/CartContext";
import { Card, CardContent } from "@/components/ui/card";

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
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Resumo do Pedido</p>

    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4 space-y-2 bg-gray-50/30">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between items-baseline text-xs">
            <span className="text-gray-500 font-medium">{item.quantity}x {item.name}</span>
            <span className="font-bold text-navy-dark">{fmt(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="p-4 space-y-3 text-[11px] border-t border-gray-50">
        <Row label="Cliente" value={customerName} />
        {customerPhone && <Row label="WhatsApp" value={customerPhone} />}
        <Row label="Pagamento" value="Na retirada" />
        
        {selectedCharity && (
          <div className="flex justify-between items-baseline">
            <span className="text-gray-400 font-bold uppercase tracking-tighter">Instituição</span>
            <span className="text-navy-dark font-bold uppercase tracking-tight">
              {charities.find((c) => c.id === selectedCharity)?.name}
            </span>
          </div>
        )}
        
        {appliedCoupon && (
          <div className="flex justify-between items-baseline">
            <span className="text-gray-400 font-bold uppercase tracking-tighter">Cupom</span>
            <span className="text-green-600 font-bold uppercase tracking-tight">{appliedCoupon.code}</span>
          </div>
        )}
        
        {notes && (
          <div className="pt-2 border-t border-gray-50 mt-2">
            <p className="text-[9px] text-gray-400 uppercase font-bold tracking-widest mb-1">Observações</p>
            <p className="text-gray-500 italic leading-relaxed text-[10px]">"{notes}"</p>
          </div>
        )}
      </div>

      <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-100">
        <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Total a pagar</span>
        <span className="text-lg font-bold text-navy-dark tracking-tight">{fmt(finalTotal)}</span>
      </div>
    </div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-baseline">
    <span className="text-gray-400 font-bold uppercase tracking-tighter">{label}</span>
    <span className="text-navy-dark font-bold uppercase tracking-tight">{value}</span>
  </div>
);

export default StepConfirm;
