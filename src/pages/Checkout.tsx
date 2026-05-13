import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { useProducts } from "@/contexts/ProductContext";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ShoppingBag, ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";
import { toast } from "sonner";
import { getClubId, isClubAuthenticated, getClubName } from "@/lib/clubAuth";

import CheckoutHeader from "@/components/checkout/CheckoutHeader";
import StepReview from "@/components/checkout/StepReview";
import StepPayment from "@/components/checkout/StepPayment";
import StepCharity from "@/components/checkout/StepCharity";
import StepConfirm from "@/components/checkout/StepConfirm";
import OrderComplete from "@/components/checkout/OrderComplete";

const Checkout = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart, updateQuantity, removeItem } = useCart();
  const { products } = useProducts();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);

  const [selectedCharity, setSelectedCharity] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("retirada");
  const [submitting, setSubmitting] = useState(false);
  const submitLock = useRef(false); // anti-duplo-clique atômico
  const [orderComplete, setOrderComplete] = useState<{
    pickupCode: string;
    items: typeof items;
    total: number;
    discount: number;
  } | null>(null);
  const [removeConfirmId, setRemoveConfirmId] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const getStock = (productId: string) => {
    const p = products.find((p) => p.id === productId);
    return p?.stock ?? 0;
  };

  const [cartWarnings, setCartWarnings] = useState<string[]>([]);
  useEffect(() => {
    if (products.length === 0) return;
    const warnings: string[] = [];
    items.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) warnings.push(`"${item.name}" não está mais disponível`);
      else if (!product.available) warnings.push(`"${item.name}" está esgotado`);
      else if (product.stock < item.quantity) warnings.push(`"${item.name}" tem apenas ${product.stock} unidade(s) em estoque`);
    });
    setCartWarnings(warnings);
  }, [items, products]);

  useEffect(() => {
    const checkAuth = async () => {
      // Check if it's a club session first
      if (isClubAuthenticated()) {
        const clubName = getClubName();
        setCustomerName(clubName || "");
        setLoading(false);
        return;
      }

      // getUser() vai ao servidor, sem cache — garante dados frescos de nome/telefone
      const { data: { user: freshUser } } = await supabase.auth.getUser();
      if (!freshUser) { navigate("/login", { state: { redirect: "/checkout" } }); return; }
      setUser(freshUser);
      setCustomerName(freshUser.user_metadata?.full_name || "");
      // phone salvo como dígitos puros — formatar só para exibição se necessário
      const rawPhone = freshUser.user_metadata?.phone || "";
      setCustomerPhone(rawPhone);
      setLoading(false);
    };
    checkAuth();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/login", { state: { redirect: "/checkout" } });
    });
    return () => subscription.unsubscribe();
  }, [navigate]);

  const { data: charities = [] } = useQuery({
    queryKey: ["checkout-charities"],
    queryFn: async () => {
      const { data } = await supabase.from("charities").select("*").eq("active", true).order("name");
      return data || [];
    },
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const { data, error } = await supabase
        .from("coupons").select("*")
        .eq("code", couponCode.trim().toUpperCase()).eq("active", true)
        .maybeSingle();
      if (error || !data) { toast.error("Cupom inválido"); return; }
      if (data.expires_at && new Date(data.expires_at) < new Date()) { toast.error("Cupom expirado"); return; }
      if (data.max_uses && data.used_count >= data.max_uses) { toast.error("Cupom esgotado"); return; }
      if (data.min_order_value && totalPrice < Number(data.min_order_value)) {
        toast.error(`Valor mínimo: R$ ${Number(data.min_order_value).toFixed(2)}`); return;
      }
      let discount = data.discount_type === "percentage"
        ? totalPrice * (Number(data.discount_value) / 100)
        : Math.min(Number(data.discount_value), totalPrice);
      setAppliedCoupon({ code: data.code, discount });
      toast.success(`Cupom "${data.code}" aplicado!`, { description: `Desconto de R$ ${discount.toFixed(2).replace(".", ",")}` });
    } finally { setValidatingCoupon(false); }
  };

  const handleSubmit = async () => {
    if (submitLock.current) return; // impede duplo envio atômico
    if (!customerName.trim()) { toast.error("Nome obrigatório"); setStep(1); return; }
    if (cartWarnings.length > 0) { toast.error(cartWarnings[0]); setStep(0); return; }
    submitLock.current = true;
    setSubmitting(true);
    try {
      const orderItems = items.map((i) => ({
        product_id: i.productId, product_name: i.name, quantity: i.quantity, unit_price: i.price,
      }));
      // Envia telefone como dígitos puros (sem formatação) — evita quebra de integrações
      const rawPhone = customerPhone.replace(/\D/g, "");
      const { data, error } = await supabase.rpc("create_order", {
        p_items: orderItems, p_customer_name: customerName.trim(),
        p_customer_email: user?.email || "", p_customer_phone: rawPhone,
        p_charity_id: selectedCharity || null, p_notes: notes.trim() || null,
        p_coupon_code: appliedCoupon?.code || null,
        p_club_id: getClubId(),
        p_payment_method: paymentMethod,
      });
      if (error) throw error;
      const result = data as any;
      setOrderComplete({
        pickupCode: result.pickup_code || "N/A", items: [...items],
        total: Number(result.total), discount: Number(result.discount) || 0,
      });
      clearCart();
    } catch (err: any) {
      toast.error("Erro ao criar pedido. Por favor, tente novamente.");
    } finally { submitLock.current = false; setSubmitting(false); }
  };

  const canAdvance = () => {
    if (step === 0) return items.length > 0 && cartWarnings.length === 0;
    if (step === 1) return customerName.trim().length > 0;
    return true;
  };

  const fmt = (v: number) => `R$ ${v.toFixed(2).replace(".", ",")}`;
  const finalTotal = appliedCoupon ? Math.max(0, totalPrice - appliedCoupon.discount) : totalPrice;

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </main>
    );
  }

  // Empty cart
  if (items.length === 0 && !orderComplete) {
    return (
      <main className="min-h-screen bg-gray-50/50 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 bg-white border border-gray-100 rounded-xl flex items-center justify-center mx-auto shadow-sm">
            <ShoppingBag className="h-8 w-8 text-gray-300" />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-bold text-navy-dark uppercase tracking-widest">Carrinho vazio</h1>
            <p className="text-gray-400 text-[10px] font-medium uppercase tracking-widest">Adicione produtos antes de finalizar</p>
          </div>
          <Button asChild className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-10 px-8 shadow-sm transition-all active:scale-[0.98]">
            <Link to="/app/produtos" className="uppercase tracking-widest text-[10px]">Ver Produtos</Link>
          </Button>
        </div>
      </main>
    );
  }

  // Order complete
  if (orderComplete) {
    const charityName = charities.find((c) => c.id === selectedCharity)?.name;
    return (
      <OrderComplete
        pickupCode={orderComplete.pickupCode}
        items={orderComplete.items}
        total={orderComplete.total}
        discount={orderComplete.discount}
        charityName={charityName}
        fmt={fmt}
      />
    );
  }

  // Checkout steps
  return (
    <main className="min-h-screen bg-gray-50/50 flex flex-col">
      <CheckoutHeader step={step} onBack={() => (step > 0 ? setStep(step - 1) : navigate(-1))} />

      <div className="flex-1 overflow-y-auto px-4 pb-32 pt-6 max-w-lg mx-auto w-full">
        {step === 0 && (
          <StepReview
            items={items} cartWarnings={cartWarnings} getStock={getStock}
            updateQuantity={updateQuantity} onRemoveConfirm={setRemoveConfirmId}
            fmt={fmt} totalPrice={totalPrice}
          />
        )}
        {step === 1 && (
          <StepPayment
            paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
            couponCode={couponCode} setCouponCode={setCouponCode}
            appliedCoupon={appliedCoupon} setAppliedCoupon={setAppliedCoupon}
            onApplyCoupon={handleApplyCoupon} validatingCoupon={validatingCoupon}
            customerName={customerName} setCustomerName={setCustomerName}
            customerPhone={customerPhone} setCustomerPhone={setCustomerPhone}
            notes={notes} fmt={fmt}
          />
        )}
        {step === 2 && (
          <StepCharity
            charities={charities} selectedCharity={selectedCharity}
            setSelectedCharity={setSelectedCharity}
          />
        )}
        {step === 3 && (
          <StepConfirm
            items={items} customerName={customerName} customerPhone={customerPhone}
            selectedCharity={selectedCharity} charities={charities}
            appliedCoupon={appliedCoupon} notes={notes} finalTotal={finalTotal} fmt={fmt}
          />
        )}
      </div>

      {/* Fixed bottom action: professional design */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-lg">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-6">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Total</span>
            <span className="text-xl font-bold text-navy-dark tracking-tight leading-none mt-0.5">{fmt(finalTotal)}</span>
          </div>

          <div className="flex-1 flex justify-end">
            {step < 3 ? (
              <Button
                size="lg"
                className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-11 px-8 shadow-sm transition-all flex items-center gap-2 group w-full max-w-[180px]"
                disabled={!canAdvance()}
                onClick={() => setStep(step + 1)}
              >
                Próximo <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            ) : (
              <Button
                size="lg"
                className="bg-navy hover:bg-navy-dark text-white font-bold rounded-lg h-11 px-8 shadow-sm transition-all flex items-center gap-2 w-full max-w-[180px]"
                disabled={submitting}
                onClick={handleSubmit}
              >
                {submitting ? (
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  <><ClipboardCheck className="h-4 w-4" /> Finalizar</>
                )}
              </Button>
            )}
          </div>
        </div>
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
    </main>
  );
};

export default Checkout;
