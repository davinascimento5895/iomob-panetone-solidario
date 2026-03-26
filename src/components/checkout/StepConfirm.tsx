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
  <div className="space-y-3">
    <p className="text-xs font-bold text-foreground uppercase tracking-wide">Confirme seu pedido</p>

    <div className="bg-card rounded-md border border-border divide-y divide-border">
      <div className="p-3 space-y-1.5">
        {items.map((item) => (
          <div key={item.productId} className="flex justify-between text-sm">
            <span className="text-foreground">{item.quantity}x {item.name}</span>
            <span className="font-bold text-foreground">{fmt(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="p-3 space-y-1 text-sm">
        <Row label="Cliente" value={customerName} />
        {customerPhone && <Row label="Telefone" value={customerPhone} />}
        <Row label="Pagamento" value="Na retirada" />
        {selectedCharity && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Instituição</span>
            <span className="text-foreground flex items-center gap-1">
              <Heart className="h-3 w-3 text-gold" />
              {charities.find((c) => c.id === selectedCharity)?.name}
            </span>
          </div>
        )}
        {appliedCoupon && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cupom</span>
            <span className="text-green-600 font-medium">{appliedCoupon.code} (-{fmt(appliedCoupon.discount)})</span>
          </div>
        )}
        {notes && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Obs</span>
            <span className="text-foreground text-right max-w-[60%]">{notes}</span>
          </div>
        )}
      </div>

      <div className="p-3 flex justify-between items-center">
        <span className="font-display font-bold text-foreground">Total</span>
        <span className="text-lg font-bold text-gold">{fmt(finalTotal)}</span>
      </div>
    </div>
  </div>
);

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground">{value}</span>
  </div>
);

export default StepConfirm;
