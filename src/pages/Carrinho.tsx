import { Link } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";

const Carrinho = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4">
        <div className="container mx-auto max-w-2xl text-center py-20">
          <ShoppingBag className="h-16 w-16 text-muted-foreground/30 mx-auto mb-6" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-3">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground mb-8">Adicione produtos para continuar</p>
          <Link to="/produtos">
            <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold rounded-xl">
              <ArrowLeft className="h-4 w-4 mr-2" /> Ver Produtos
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground mb-6">Carrinho</h1>

        <div className="space-y-3 mb-6">
          {items.map((item) => (
            <Card key={item.productId}>
              <CardContent className="p-4 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-bold text-foreground truncate">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    R$ {item.price.toFixed(2).replace(".", ",")} / unidade
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="w-8 text-center font-bold text-foreground">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-right flex-shrink-0 w-24 hidden sm:block">
                  <p className="font-bold text-foreground">
                    R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive"
                  onClick={() => removeItem(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} itens)</span>
              <span className="font-bold text-foreground">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="border-t border-border my-4" />
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-display font-bold text-foreground">Total</span>
              <span className="text-2xl font-bold text-gradient-gold">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/produtos" className="flex-1">
                <Button variant="outline" className="w-full rounded-xl">
                  <ArrowLeft className="h-4 w-4 mr-2" /> Continuar Comprando
                </Button>
              </Link>
              <Link to="/checkout" className="flex-1">
                <Button className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold rounded-xl">
                  Finalizar Pedido <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>

            <button
              onClick={clearCart}
              className="text-xs text-muted-foreground hover:text-destructive mt-4 underline block mx-auto transition-colors"
            >
              Limpar carrinho
            </button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
};

export default Carrinho;
