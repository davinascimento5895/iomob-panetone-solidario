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
  <div className="space-y-5">
    {/* Form Info */}
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Nome completo</Label>
        <Input 
          value={customerName} 
          onChange={(e) => setCustomerName(e.target.value)} 
          className="h-10 bg-white border-gray-100 rounded-lg text-sm focus:ring-navy/5"
          placeholder="Seu nome completo"
        />
      </div>
      <div className="space-y-1.5">
        <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">WhatsApp</Label>
        <Input 
          value={customerPhone} 
          onChange={(e) => setCustomerPhone(e.target.value)} 
          className="h-10 bg-white border-gray-100 rounded-lg text-sm focus:ring-navy/5"
          placeholder="(11) 99999-9999"
        />
      </div>
    </div>

    {/* Payment method */}
    <div className="space-y-2">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Método de Pagamento</p>
      {paymentOptions.map((opt) => (
        <button
          key={opt.id}
          onClick={() => !opt.disabled && setPaymentMethod(opt.id)}
          disabled={opt.disabled}
          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
            opt.disabled
              ? "border-gray-50 bg-gray-50/50 opacity-40 cursor-not-allowed"
              : paymentMethod === opt.id
                ? "border-navy bg-navy/5 text-navy-dark ring-1 ring-navy/10"
                : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
          }`}
        >
          <div className={`p-2 rounded-lg ${paymentMethod === opt.id ? "bg-navy text-white" : "bg-gray-50 text-gray-400"}`}>
            <opt.icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-tight">{opt.label}</p>
            <p className="text-[10px] text-gray-400 font-medium">{opt.desc}</p>
          </div>
        </button>
      ))}
    </div>

    {/* Coupon */}
    <div className="space-y-1.5">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Cupom de Desconto</p>
      {appliedCoupon ? (
        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2.5 border border-gray-100">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-navy-dark uppercase tracking-widest">{appliedCoupon.code}</span>
            <span className="text-[9px] text-green-600 font-bold uppercase">Desconto de {fmt(appliedCoupon.discount)}</span>
          </div>
          <button 
            type="button"
            onClick={() => setAppliedCoupon(null)}
            className="h-7 w-7 text-gray-300 hover:text-destructive transition-colors flex items-center justify-center"
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
            className="h-10 bg-white border-gray-100 rounded-lg text-xs font-bold uppercase tracking-widest px-4 flex-1"
          />
          <Button 
            type="button"
            onClick={onApplyCoupon} 
            disabled={validatingCoupon || !couponCode.trim()}
            className="h-10 px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-none"
          >
            {validatingCoupon ? "..." : "Aplicar"}
          </Button>
        </div>
      )}
    </div>

    {/* Notes */}
    <div className="space-y-1.5">
      <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-0.5">Observações Adicionais</Label>
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Informações adicionais para o seu pedido"
        className="h-20 bg-white border-gray-100 rounded-xl text-sm shadow-none focus:ring-navy/5 resize-none p-3"
      />
    </div>
  </div>
);

export default StepPayment;
