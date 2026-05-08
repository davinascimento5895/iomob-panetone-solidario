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
  <div className="space-y-6 animate-fade-in">
    {/* Form Info */}
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Nome completo</Label>
        <Input 
          value={customerName} 
          onChange={(e) => setCustomerName(e.target.value)} 
          className="rounded-2xl border-stone-100 bg-white h-12 px-5 shadow-sm focus-visible:ring-stone-400"
          placeholder="Como devemos lhe chamar"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">WhatsApp</Label>
        <Input 
          value={customerPhone} 
          onChange={(e) => setCustomerPhone(e.target.value)} 
          className="rounded-2xl border-stone-100 bg-white h-12 px-5 shadow-sm focus-visible:ring-stone-400"
          placeholder="(00) 00000-0000"
        />
      </div>
    </div>

    {/* Payment method */}
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Pagamento</p>
      {paymentOptions.map((opt) => (
        <button
          key={opt.id}
          onClick={() => !opt.disabled && setPaymentMethod(opt.id)}
          disabled={opt.disabled}
          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-4 ${
            opt.disabled
              ? "border-stone-50 bg-stone-50/50 opacity-40 cursor-not-allowed"
              : paymentMethod === opt.id
                ? "border-stone-900 bg-stone-900 text-white shadow-lg shadow-stone-900/10"
                : "border-stone-100 bg-white text-stone-600 hover:border-stone-200"
          }`}
        >
          <opt.icon className={`h-4 w-4 ${paymentMethod === opt.id ? "text-gold" : "text-stone-300"}`} />
          <div className="min-w-0">
            <p className="text-sm font-bold">{opt.label}</p>
            {opt.disabled && <p className="text-[10px] uppercase font-medium opacity-60">Em breve</p>}
          </div>
        </button>
      ))}
    </div>

    {/* Coupon */}
    <div className="bg-white rounded-2xl p-5 border border-stone-100 shadow-sm space-y-3">
      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
        Cupom de desconto
      </p>
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-stone-50 rounded-xl p-3 border border-stone-100">
          <div>
            <p className="text-sm font-bold text-stone-900">{appliedCoupon.code}</p>
            <p className="text-[10px] font-bold text-gold uppercase tracking-tight">Desconto de {fmt(appliedCoupon.discount)} aplicado</p>
          </div>
          <button 
            type="button"
            onClick={() => setAppliedCoupon(null)}
            className="h-8 w-8 text-stone-400 hover:text-red-500 transition-colors flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            value={couponCode}
            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            placeholder="CÓDIGO"
            className="rounded-xl border-stone-100 uppercase text-xs font-bold tracking-widest h-10 px-4"
          />
          <Button 
            type="button"
            onClick={onApplyCoupon} 
            disabled={validatingCoupon || !couponCode.trim()}
            className="bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl h-10 px-4 text-xs font-bold transition-all shadow-none"
          >
            {validatingCoupon ? "..." : "Aplicar"}
          </Button>
        </div>
      )}
    </div>

    {/* Notes */}
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1">Observações</Label>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Informação adicional para o seu pedido..."
        className="rounded-2xl border-stone-100 bg-white shadow-sm resize-none focus-visible:ring-stone-400 min-h-[80px]"
      />
    </div>
  </div>
);

export default StepPayment;
