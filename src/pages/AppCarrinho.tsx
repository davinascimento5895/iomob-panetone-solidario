import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AppCarrinho = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const { products } = useProducts();

  const getStock = (productId: string) => {
    const p = products.find((p) => p.id === productId);
    return p?.stock ?? 0;
  };

  if (items.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center">
          <ShoppingBag className="h-14 w-14 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-lg font-display font-bold text-foreground mb-2">Carrinho vazio</h2>
          <p className="text-muted-foreground text-sm mb-6">Adicione produtos para continuar</p>
          <Link to="/app/produtos">
            <Button className="bg-gold hover:bg-gold-dark text-primary font-semibold rounded-xl">
              Ver Produtos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 md:p-6 max-w-3xl mx-auto flex flex-col gap-3">
      {items.map((item) => {
        const stock = getStock(item.productId);
        const atMax = item.quantity >= stock;
        return (
          <Card key={item.productId}>
            <CardContent className="p-3 flex items-center gap-3">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-foreground text-sm truncate">{item.name}</h3>
                <p className="text-xs text-muted-foreground">
                  R$ {item.price.toFixed(2).replace(".", ",")}
                </p>
                {stock > 0 && stock <= 5 && (
                  <p className="text-[10px] text-destructive font-medium">Últimas {stock} un.</p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg"
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                  <Minus className="h-3 w-3" />
                </Button>
                <span className="w-6 text-center font-bold text-foreground text-sm">{item.quantity}</span>
                <Button variant="outline" size="icon" className="h-7 w-7 rounded-lg"
                  onClick={() => updateQuantity(item.productId, Math.min(item.quantity + 1, stock))}
                  disabled={atMax}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
                <Button variant="ghost" size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive flex-shrink-0"
                  onClick={() => setRemoveConfirmId(item.productId)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
            </CardContent>
          </Card>
        );
      })}

      {/* Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-muted-foreground text-sm">
              Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} itens)
            </span>
            <span className="font-bold text-foreground">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
          </div>
          <div className="border-t border-border my-3" />
          <div className="flex items-center justify-between mb-4">
            <span className="text-lg font-display font-bold text-foreground">Total</span>
            <span className="text-xl font-bold text-gold">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
          </div>

          <Link to="/checkout" className="block">
            <Button className="w-full bg-gold hover:bg-gold-dark text-primary font-semibold rounded-xl">
              Finalizar Pedido <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>

          <button
            onClick={() => setClearConfirmOpen(true)}
            className="text-xs text-muted-foreground hover:text-destructive mt-3 underline block mx-auto transition-colors"
          >
            Limpar carrinho
          </button>
        </CardContent>
      </Card>
    </div>
      {/* Remove item confirmation */}
      <AlertDialog open={!!removeConfirmId} onOpenChange={(open) => !open && setRemoveConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover item?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja remover "{items.find((i) => i.productId === removeConfirmId)?.name}" do carrinho?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (removeConfirmId) removeItem(removeConfirmId); setRemoveConfirmId(null); }}
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Clear cart confirmation */}
      <AlertDialog open={clearConfirmOpen} onOpenChange={(open) => !open && setClearConfirmOpen(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Limpar carrinho?</AlertDialogTitle>
            <AlertDialogDescription>Deseja remover todos os itens do carrinho?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { clearCart(); setClearConfirmOpen(false); }}>
              Limpar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AppCarrinho;
