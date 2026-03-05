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
    <main className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">Pedido Confirmado!</h2>
              <p className="text-sm text-muted-foreground mt-1">Apresente o código abaixo na retirada</p>
            </div>

            <div className="bg-muted rounded-xl p-4">
              <p className="text-3xl font-mono font-bold tracking-[0.3em] text-gold">{pickupCode}</p>
              <button
                onClick={handleCopy}
                className="mt-2 text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mx-auto transition-colors"
              >
                {copied ? <><Check className="h-3 w-3" /> Copiado!</> : <><Copy className="h-3 w-3" /> Copiar código</>}
              </button>
            </div>

            {/* Local e horário de retirada */}
            <div className="bg-gold/5 border border-gold/20 rounded-xl p-4 text-left space-y-2.5">
              <p className="text-xs font-bold text-gold-dark uppercase tracking-wide text-center mb-3">
                Informações de Retirada
              </p>
              <div className="flex items-start gap-2.5 text-sm">
                <MapPin className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Rotary Club Connect</p>
                  <p className="text-muted-foreground text-xs">Endereço confirmado por e-mail após aprovação do pedido</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5 text-sm">
                <Clock className="h-4 w-4 text-gold flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Período de Retirada</p>
                  <p className="text-muted-foreground text-xs">Você receberá as datas disponíveis por e-mail</p>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center border-t border-gold/10 pt-2.5 mt-1">
                O pagamento é realizado <strong>na retirada</strong>. Guarde o código acima.
              </p>
            </div>

            <div className="text-left border-t border-border pt-3 space-y-1.5">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Itens do pedido</p>
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-foreground">{item.quantity}x {item.name}</span>
                  <span className="font-semibold text-foreground">{fmt(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

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
