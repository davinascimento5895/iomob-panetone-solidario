import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Copy, Check, Heart, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { CartItem } from "@/contexts/CartContext";

interface OrderCompleteProps {
  pickupCode: string;
  items: CartItem[];
  total: number;
  discount: number;
  charityName?: string;
  fmt: (v: number) => string;
}

const OrderComplete = ({ pickupCode, items, total, discount, charityName, fmt }: OrderCompleteProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pickupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-gray-50/50">
      <div className="w-full max-w-md">
        <Card className="border border-gray-100 shadow-sm rounded-xl overflow-hidden bg-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="h-16 w-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-navy-dark uppercase tracking-tight">Reserva Confirmada</h2>
              <p className="text-gray-400 text-xs mt-1 uppercase tracking-widest font-medium">Apresente este código no local de retirada</p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 relative">
              <p className="text-3xl font-mono font-bold tracking-[0.2em] text-navy-dark">{pickupCode}</p>
              <button
                onClick={handleCopy}
                className="mt-4 text-[10px] uppercase tracking-widest font-bold text-gray-400 hover:text-navy-dark flex items-center gap-2 mx-auto transition-all"
              >
                {copied ? <><Check className="h-3.5 w-3.5 text-green-600" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar Código</>}
              </button>
            </div>

            <div className="space-y-4 text-left pt-2">
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-dark uppercase tracking-tight">Ponto de Retirada</p>
                  <p className="text-gray-400 text-[11px] font-medium uppercase tracking-tighter">Rotary Club Connect</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-4.5 w-4.5 text-gray-400" />
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-dark uppercase tracking-tight">Data e Horário</p>
                  <p className="text-gray-400 text-[11px] font-medium uppercase tracking-tighter">Informações enviadas ao seu e-mail</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 space-y-2.5 text-left">
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400 font-bold uppercase tracking-tighter">Subtotal</span>
                <span className="text-navy-dark font-bold uppercase tracking-tight">{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Desconto</span>
                  <span className="text-green-600 font-bold uppercase tracking-tight">-{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[11px]">
                <span className="text-gray-400 font-bold uppercase tracking-tighter">Pagamento</span>
                <span className="text-navy-dark font-bold uppercase tracking-tight">Na Retirada</span>
              </div>
              {charityName && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-gray-400 font-bold uppercase tracking-tighter">Instituição</span>
                  <span className="text-navy-dark font-bold uppercase tracking-tight">{charityName}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-gray-50 mt-2">
                <span className="text-xs font-bold text-navy-dark uppercase tracking-tight">Total</span>
                <span className="text-base font-bold text-navy-dark">{fmt(total)}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-50 space-y-2">
              <Link to="/app/pedidos" className="block w-full">
                <Button className="w-full bg-navy hover:bg-navy-dark text-white h-11 rounded-lg transition-all font-bold uppercase tracking-widest text-[10px]">
                  Ver Meus Pedidos
                </Button>
              </Link>
              <Link to="/app/produtos" className="block w-full">
                <Button variant="ghost" className="w-full h-10 text-gray-400 hover:text-navy-dark hover:bg-transparent text-[10px] font-bold uppercase tracking-widest">
                  Continuar Comprando
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-gray-300 text-[9px] uppercase font-bold tracking-[0.2em]">
          Obrigado por apoiar esta causa
        </p>
      </div>
    </main>
  );
};

export default OrderComplete;
