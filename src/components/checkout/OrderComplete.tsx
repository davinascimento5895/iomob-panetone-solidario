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
    <main className="min-h-screen flex items-center justify-center px-4 py-8 bg-[#FAFAFA]">
      <div className="w-full max-w-md">
        <Card className="border-none shadow-2xl shadow-stone-200 rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-8 text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-stone-50 flex items-center justify-center mx-auto mb-2">
              <CheckCircle2 className="h-10 w-10 text-gold" />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-stone-900">Reserva confirmada</h2>
              <p className="text-stone-400 text-sm mt-2">Apresente este código no local de retirada</p>
            </div>

            <div className="bg-stone-50 rounded-3xl p-8 border border-stone-100 relative group">
              <p className="text-4xl font-mono font-bold tracking-[0.2em] text-stone-900">{pickupCode}</p>
              <button
                onClick={handleCopy}
                className="mt-4 text-[10px] uppercase tracking-widest font-bold text-stone-400 hover:text-stone-900 flex items-center gap-2 mx-auto transition-all"
              >
                {copied ? <><Check className="h-3 w-3 text-gold" /> Copiado</> : <><Copy className="h-3 w-3" /> Copiar código</>}
              </button>
            </div>

            <div className="space-y-4 text-left pt-2">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="h-5 w-5 text-stone-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">Ponto de retirada</p>
                  <p className="text-stone-400 text-xs mt-0.5">Rotary Club Connect</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-2xl bg-stone-50 flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-stone-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-900">Data e horário</p>
                  <p className="text-stone-400 text-xs mt-0.5">As opções serão enviadas ao seu e-mail</p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-stone-50 space-y-3">
              <Link to="/meus-pedidos" className="block w-full">
                <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white h-14 rounded-2xl transition-all shadow-lg shadow-stone-900/10 font-bold">
                  Ver meus pedidos
                </Button>
              </Link>
              <Link to="/" className="block w-full">
                <Button variant="ghost" className="w-full h-12 text-stone-400 hover:text-stone-900 hover:bg-transparent text-sm">
                  Voltar ao início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <p className="mt-8 text-center text-stone-300 text-[10px] uppercase font-bold tracking-widest">
          Obrigado por apoiar esta causa
        </p>
      </div>
    </main>
  );
};

            <div className="text-left border-t border-border pt-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">{fmt(subtotal)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Desconto</span>
                  <span className="text-green-600">-{fmt(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pagamento</span>
                <span className="text-foreground">Na retirada</span>
              </div>
              {charityName && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Instituição</span>
                  <span className="text-foreground flex items-center gap-1">
                    <Heart className="h-3 w-3 text-gold" /> {charityName}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-display font-bold text-foreground">Total</span>
                <span className="font-bold text-gold text-lg">{fmt(total)}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <Link to="/app/pedidos">
                <Button className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold">Ver Meus Pedidos</Button>
              </Link>
              <Link to="/app/produtos">
                <Button variant="outline" className="w-full">Continuar Comprando</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default OrderComplete;
