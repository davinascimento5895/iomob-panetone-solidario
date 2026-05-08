import { Link } from "react-router-dom";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, ArrowLeft } from "lucide-react";
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

const Carrinho = () => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-24 pb-12 px-4 bg-[#FAFAFA]">
        <div className="container mx-auto max-w-2xl text-center py-32 bg-white rounded-2xl shadow-sm border border-stone-100">
          <p className="text-stone-400 mb-8">Seu carrinho está vazio</p>
          <Link to="/produtos">
            <Button className="bg-gold hover:bg-gold/90 text-white px-8 h-12 rounded-full transition-all shadow-lg shadow-gold/20">
              Ver produtos
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-12 px-4 bg-[#FAFAFA]">
      <div className="container mx-auto max-w-2xl">
        <h1 className="text-2xl font-display font-semibold text-stone-900 mb-8">Carrinho</h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <Card key={item.productId} className="border-stone-100 shadow-sm rounded-2xl overflow-hidden bg-white">
              <CardContent className="p-4 flex items-center gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-stone-900 truncate">{item.name}</h3>
                  <p className="text-xs text-stone-400">
                    R$ {item.price.toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-stone-50 p-1 rounded-lg border border-stone-100">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-sm hover:bg-white transition-colors"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="h-3 w-3 text-stone-600" />
                  </Button>
                  <span className="w-6 text-center text-sm font-semibold text-stone-900">{item.quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-sm hover:bg-white transition-colors"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                  >
                    <Plus className="h-3 w-3 text-stone-600" />
                  </Button>
                </div>
                <div className="text-right flex-shrink-0 w-20 hidden sm:block">
                  <p className="font-semibold text-stone-900 text-sm">
                    R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-stone-300 hover:text-red-500 hover:bg-transparent transition-colors"
                  onClick={() => setRemoveConfirmId(item.productId)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="border-stone-100 shadow-lg shadow-stone-200/50 rounded-2xl bg-white overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-stone-500">Subtotal</span>
              <span className="text-sm font-semibold text-stone-900">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
            </div>
            <div className="border-t border-stone-50 my-4" />
            <div className="flex items-center justify-between mb-8">
              <span className="text-stone-900 font-semibold">Total</span>
              <span className="text-2xl font-bold text-gold">R$ {totalPrice.toFixed(2).replace(".", ",")}</span>
            </div>

            <div className="flex flex-col gap-3">
              <Link to="/checkout" className="w-full">
                <Button className="w-full bg-stone-900 hover:bg-stone-800 text-white h-12 rounded-full transition-all shadow-lg shadow-stone-900/10">
                  Finalizar pedido
                </Button>
              </Link>
              <Link to="/produtos" className="w-full">
                <Button variant="ghost" className="w-full h-12 text-stone-500 hover:text-stone-900 hover:bg-transparent">
                  Adicionar mais produtos
                </Button>
              </Link>
            </div>

            <button
              onClick={() => setClearConfirmOpen(true)}
              className="text-[10px] uppercase tracking-widest font-bold text-stone-300 hover:text-stone-500 mt-6 block mx-auto transition-colors"
            >
              Esvaziar carrinho
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
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (removeConfirmId) removeItem(removeConfirmId); setRemoveConfirmId(null); }}>
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

    </main>
  );
};

export default Carrinho;
