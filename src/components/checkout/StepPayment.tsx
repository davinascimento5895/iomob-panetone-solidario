import { Wallet, CreditCard, Smartphone, Tag, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface AppliedCoupon {
  code: string;
  discount: number;
}

interface StepPaymentProps {
  paymentMethod: string;
  setPaymentMethod: (v: string) => void;
  couponCode: string;
  setCouponCode: (v: string) => void;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (v: AppliedCoupon | null) => void;
  onApplyCoupon: () => void;
  validatingCoupon: boolean;
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  fmt: (v: number) => string;
}

const paymentOptions = [
  { id: "retirada", label: "Pagamento na retirada", desc: "Pague em dinheiro ou cartão ao retirar", icon: Wallet, disabled: false },
  { id: "cartao", label: "Cartão crédito/débito", desc: "Em breve", icon: CreditCard, disabled: true },
  { id: "pix", label: "PIX", desc: "Em breve", icon: Smartphone, disabled: true },
];

const StepPayment = ({
  paymentMethod,
  setPaymentMethod,
  couponCode,
  setCouponCode,
  appliedCoupon,
  setAppliedCoupon,
  onApplyCoupon,
  validatingCoupon,
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  notes,
  setNotes,
  fmt,
}: StepPaymentProps) => (
  <div className="space-y-4 animate-fade-in">
    {/* Payment method */}
    <div className="space-y-2">
      <p className="text-xs font-bold text-foreground uppercase tracking-wide">Forma de pagamento</p>
      {paymentOptions.map((opt) => (
        <button
          key={opt.id}
          onClick={() => !opt.disabled && setPaymentMethod(opt.id)}
          disabled={opt.disabled}
          className={`w-full text-left p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
            opt.disabled
              ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
              : paymentMethod === opt.id
                ? "border-gold bg-gold/10"
                : "border-border hover:border-gold/30"
          }`}
        >
          <div
            className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
              opt.disabled
                ? "bg-muted text-muted-foreground"
                : paymentMethod === opt.id
                  ? "bg-gold text-primary"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            <opt.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-bold ${opt.disabled ? "text-muted-foreground" : "text-foreground"}`}>
              {opt.label}
            </p>
            <p className="text-xs text-muted-foreground">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>

    {/* Coupon */}
    <div className="bg-card rounded-xl p-3 border border-border space-y-2">
      <p className="text-xs font-bold text-foreground uppercase tracking-wide flex items-center gap-1.5">
        <Tag className="h-3.5 w-3.5" /> Cupom de desconto
      </p>
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg p-2.5 border border-green-200 dark:border-green-800">
          <div>
            <p className="text-sm font-bold text-green-700 dark:text-green-400">{appliedCoupon.code}</p>
            <p className="text-xs text-green-600 dark:text-green-500">-{fmt(appliedCoupon.discount)}</p>
          </div>
          <button onClick={() => setAppliedCoupon(null)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            id="couponCode"
            name="couponCode"
            placeholder="Código do cupom"
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            className="uppercase tracking-wider"
          />
          <Button
            onClick={onApplyCoupon}
            disabled={validatingCoupon || !couponCode.trim()}
            variant="outline"
            className="flex-shrink-0"
          >
            {validatingCoupon ? "..." : "Aplicar"}
          </Button>
        </div>
      )}
    </div>

    {/* Customer data */}
    <div className="space-y-2.5 bg-card rounded-xl p-3 border border-border">
      <p className="text-xs font-bold text-foreground uppercase tracking-wide">Seus dados</p>
      <div className="space-y-1">
        <Label htmlFor="customerName" className="text-xs">Nome *</Label>
        <Input id="customerName" name="customerName" value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="Seu nome completo" />
      </div>
      <div className="space-y-1">
        <Label htmlFor="customerPhone" className="text-xs">Telefone (opcional)</Label>
        <Input id="customerPhone" name="customerPhone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} placeholder="(41) 99999-9999" />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Observações (opcional)</Label>
        <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Alguma observação?" rows={2} />
      </div>
    </div>
  </div>
);

export default StepPayment;
