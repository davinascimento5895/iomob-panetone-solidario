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
  const { items, updateQuantity, removeItem, clearCart, totalPrice, totalItems } = useCart();
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const { products } = useProducts();

  const getStock = (productId: string) => {
    const p = products.find((p) => p.id === productId);
    return p?.stock ?? 0;
  };

  const fmt = (v: number) => "R$ " + v.toFixed(2).replace(".", ",");

  if (items.length === 0) {
    return (
      <div className="flex-1 min-h-screen bg-gray-50/50 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="h-8 w-8 text-gray-300" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-navy-dark uppercase tracking-widest">Carrinho vazio</h2>
            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">Adicione produtos para continuar</p>
          </div>
          <Button asChild className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-10 px-8 shadow-sm transition-all active:scale-[0.98]">
            <Link to="/app/produtos" className="uppercase tracking-widest text-[10px]">Ver Produtos</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="p-3 md:p-5 pb-24 md:pb-5 min-h-screen bg-gray-50/50">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Barra de Progresso de Frete Grátis */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${totalItems >= 10 ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                  <ShoppingBag className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-navy-dark">
                    {totalItems >= 10 
                      ? "Frete grátis liberado" 
                      : `${10 - totalItems === 1 ? "Falta" : "Faltam"} ${10 - totalItems} ${10 - totalItems === 1 ? "unidade" : "unidades"} para o frete grátis!`}
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    {totalItems >= 10 
                      ? "O benefício será aplicado no checkout." 
                      : "Pedidos a partir de 10 unidades não possuem custo de entrega."}
                  </p>
                </div>
              </div>
              <div className="flex-1 max-w-xs space-y-1.5">
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ease-out ${totalItems >= 10 ? 'bg-green-500' : 'bg-gold'}`}
                    style={{ width: `${Math.min(100, (totalItems / 10) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-gray-400 uppercase">
                  <span>{totalItems} de 10 unidades</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {items.map((item) => {
              const stock = getStock(item.productId);
              const atMax = item.quantity >= stock;
              return (
                <Card key={item.productId} className="border-gray-100 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-3 flex items-center gap-3">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-14 h-14 rounded-lg object-contain bg-gray-50/50 p-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-navy-dark text-xs truncate uppercase tracking-tight">{item.name}</h3>
                      <p className="text-[11px] text-gray-500">{fmt(item.price)}</p>
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden h-8">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-navy-dark hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-navy-dark text-xs">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, Math.min(item.quantity + 1, stock))}
                        disabled={atMax}
                        className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-navy-dark hover:bg-gray-100 transition-colors disabled:opacity-20"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <Button variant="ghost" size="icon"
                      className="h-8 w-8 text-gray-300 hover:text-destructive hover:bg-destructive/5 flex-shrink-0 transition-colors"
                      onClick={() => setRemoveConfirmId(item.productId)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          <Card className="border-gray-100 shadow-sm rounded-xl overflow-hidden">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Subtotal ({totalItems} itens)</span>
                  <span>{fmt(totalPrice)}</span>
                </div>
                <div className="flex items-center justify-between text-sm font-bold text-navy-dark border-t border-gray-50 pt-2">
                  <span>Total</span>
                  <span className="text-navy-dark">{fmt(totalPrice)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Button asChild className="w-full bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-10 shadow-sm transition-all active:scale-[0.98]">
                  <Link to="/checkout" className="flex items-center justify-center gap-2">
                    Finalizar Pedido
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                
                <button
                  onClick={() => setClearConfirmOpen(true)}
                  className="text-[10px] text-gray-400 hover:text-destructive transition-colors font-bold uppercase tracking-wider py-2"
                >
                  Limpar carrinho
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
