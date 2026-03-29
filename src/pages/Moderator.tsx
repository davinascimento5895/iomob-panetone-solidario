import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { QrCode, CheckCircle2, Search, User as UserIcon } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const statusMap: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-yellow-100 text-yellow-700" },
  pronto: { label: "Pronto p/ Retirada", className: "bg-blue-100 text-blue-700" },
  retirado: { label: "Retirado", className: "bg-green-100 text-green-700" },
  cancelado: { label: "Cancelado", className: "bg-red-100 text-red-700" },
};

const Moderator = () => {
  const queryClient = useQueryClient();
  const [pickupCode, setPickupCode] = useState("");
  const [foundOrder, setFoundOrder] = useState<any | null>(null);
  const [pickupDialogOpen, setPickupDialogOpen] = useState(false);
  const [moderatorUserId, setModeratorUserId] = useState<string | null>(null);
  const [user, setUser] = useState<any | null>(null);
  const [scanning, setScanning] = useState(false);
  const [debugQuery, setDebugQuery] = useState("");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const detectorRef = useRef<any>(null);
  const rafRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const debugMode = new URLSearchParams(location.search).get("debug") === "1";

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setModeratorUserId(session?.user?.id || null);
      setUser(session?.user || null);
    });
  }, []);

  const { data: recent = [] } = useQuery({
    queryKey: ["moderator-history"],
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("id,pickup_code,customer_name,delivered_at,total,created_at")
        .eq("status", "retirado")
        .order("delivered_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const { data: orderItems = [] } = useQuery({
    queryKey: ["moderator-order-items", foundOrder?.id],
    enabled: !!foundOrder,
    queryFn: async () => {
      const { data } = await supabase.from("order_items").select("*").eq("order_id", foundOrder.id);
      return data || [];
    },
  });

  const handlePickupSearch = async () => {
    const code = pickupCode.trim().toUpperCase();

    if (code.length !== 6) {
      toast.error("Código inválido — use 6 caracteres.");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("pickup_code", code)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        toast.error("Erro ao buscar pedido: " + (error.message || "verifique o console"));
        return;
      }

      if (data && data.length > 0) {
        const preferred = data.find((d: any) => d.status !== "cancelado" && d.status !== "retirado") || data[0];
        setFoundOrder(preferred);
        setPickupDialogOpen(true);
        return;
      }

      const { data: data2, error: error2 } = await supabase
        .from("orders")
        .select("*")
        .ilike("pickup_code", code)
        .order("created_at", { ascending: false })
        .limit(5);

      const wildcardPattern = `%${code}%`;
      const { data: data3, error: error3 } = await supabase
        .from("orders")
        .select("*")
        .ilike("pickup_code", wildcardPattern)
        .order("created_at", { ascending: false })
        .limit(5);

      const fallbackData = data2?.length ? data2 : data3?.length ? data3 : [];
      if (fallbackData.length > 0) {
        const preferred = fallbackData.find((d: any) => d.status !== "cancelado" && d.status !== "retirado") || fallbackData[0];
        setFoundOrder(preferred);
        setPickupDialogOpen(true);
        return;
      }

      toast.error("Pedido não encontrado com esse código.");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao buscar pedido. Verifique o console para detalhes.");
    }
  };

  const confirmPickupMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const now = new Date().toISOString();
      await supabase.from("orders").update({
        status: "retirado",
        delivered_by: moderatorUserId,
        delivered_at: now,
      }).eq("id", orderId);
    },
    onSuccess: () => {
      toast.success("Retirada confirmada com sucesso.");
      setFoundOrder(null);
      setPickupCode("");
      setPickupDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["moderator-history"] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders-all"] });
    },
    onError: () => {
      toast.error("Erro ao confirmar retirada.");
    },
  });

  const startScanner = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Câmera não disponível neste dispositivo.");
      return;
    }
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const BarcodeDetectorConstructor = (window as any).BarcodeDetector;
      if (BarcodeDetectorConstructor) {
        detectorRef.current = new BarcodeDetectorConstructor({ formats: ["qr_code"] });
        const scan = async () => {
          if (!videoRef.current || videoRef.current.readyState < 2) {
            rafRef.current = requestAnimationFrame(scan);
            return;
          }
          try {
            const barcodes = await detectorRef.current.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              const raw = barcodes[0].rawValue || barcodes[0].rawText || "";
              if (raw) {
                stopScanner();
                setPickupCode(raw.trim().toUpperCase().slice(0, 6));
                handlePickupSearch();
                return;
              }
            }
          } catch (e) {
            // ignore
          }
          rafRef.current = requestAnimationFrame(scan);
        };
        scan();
      } else {
        toast.info("Leitura de QR requer navegador compatível; cole o código manualmente.");
      }
    } catch (err) {
      toast.error("Erro ao acessar a câmera.");
      setScanning(false);
    }
  };

  const stopScanner = () => {
    setScanning(false);
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
    }
    detectorRef.current = null;
  };

  useEffect(() => {
    return () => stopScanner();
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  const formatTrackingInfo = (userId: string | null, timestamp: string | null) => {
    if (!userId || !timestamp) return null;
    const name = userId.slice(0, 8) + "…";
    const date = new Date(timestamp).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
    return `${name} em ${date}`;
  };

  return (
    <div className="min-h-screen p-6 bg-background pt-16">
      <main className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold">Retirada — Balcão</h1>
            <p className="text-muted-foreground">Leitura de QR e confirmação de retirada (somente moderador).</p>
          </div>
          <div>
            <Button asChild variant="ghost" size="sm" className="flex items-center gap-2">
              <Link to="/moderator/profile" title="Perfil" aria-label="Perfil" className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                <span className="ml-1 text-sm">Perfil</span>
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <Input
                    id="moderatorPickupCode"
                    name="moderatorPickupCode"
                    placeholder="Código (6 caracteres)"
                    value={pickupCode}
                    onChange={(e) => setPickupCode(e.target.value.toUpperCase().slice(0, 6))}
                    onKeyDown={(e) => e.key === "Enter" && handlePickupSearch()}
                    className="font-mono text-lg tracking-widest uppercase flex-1"
                    aria-label="Código de retirada"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handlePickupSearch} className="bg-gold hover:bg-gold-dark text-primary font-semibold">
                      <Search className="h-4 w-4 mr-2" /> Buscar
                    </Button>
                    <Button variant="outline" onClick={() => (scanning ? stopScanner() : startScanner())}>
                      <QrCode className="h-4 w-4 mr-2" /> {scanning ? "Parar Câmera" : "Abrir Câmera"}
                    </Button>
                  </div>
                </div>

                {scanning && (
                  <div className="mt-4">
                    <video ref={videoRef} className="w-full rounded-md bg-black" playsInline muted />
                    <p className="text-xs text-muted-foreground mt-2">Apresente o QR code para a câmera. Se não funcionar, use o campo acima.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {foundOrder && (
              <Card>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Código</p>
                      <p className="font-mono text-lg tracking-widest">{foundOrder.pickup_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Cliente</p>
                      <p className="font-medium">{foundOrder.customer_name}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="font-bold">R$ {Number(foundOrder.total).toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className={`px-2 py-0.5 rounded-full text-xs inline-block ${foundOrder.status === "retirado" ? "bg-green-100 text-green-800" : foundOrder.status === "cancelado" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
                        {foundOrder.status || "—"}
                      </p>
                    </div>
                  </div>

                  {orderItems.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-foreground">Itens</p>
                      <div className="mt-2 space-y-1 text-sm">
                        {orderItems.map((it: any) => (
                          <div key={it.id} className="flex justify-between">
                            <span>{it.quantity}x {it.product_name}</span>
                            <span className="text-muted-foreground">R$ {(Number(it.unit_price) * it.quantity).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3">
                    <Button variant="outline" onClick={() => { setFoundOrder(null); setPickupCode(""); }}>
                      Fechar
                    </Button>
                    <Button
                      onClick={() => setPickupDialogOpen(true)}
                      disabled={foundOrder.status === "retirado" || foundOrder.status === "cancelado"}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar Retirada
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-foreground">Últimas retiradas</h3>
                <p className="text-xs text-muted-foreground mb-3">Histórico de retiradas recentes (máx. 20).</p>
                <div className="space-y-2">
                  {recent.map((r: any) => (
                    <div key={r.id} className="flex items-center justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs tracking-widest">{r.pickup_code}</span>
                          <span className="text-sm truncate">{r.customer_name}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">{formatDate(r.delivered_at) || formatDate(r.created_at)}</div>
                      </div>
                      <div className="text-right ml-3">
                        <div className="font-medium">R$ {Number(r.total).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {recent.length === 0 && <div className="text-xs text-muted-foreground">Nenhuma retirada registrada ainda.</div>}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium">Dicas de uso</h3>
                <ul className="text-xs text-muted-foreground mt-2 space-y-2">
                  <li>Leia o QR code ou digite o código manualmente.</li>
                  <li>Confirme somente se o cliente apresentar o pedido correto.</li>
                  <li>Será solicitado digitar o código para evitar confirmações acidentais.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {debugMode && (
          <div className="fixed bottom-4 right-4 z-50">
            <Card>
              <CardContent className="p-2 flex gap-2 items-center">
                <Input id="moderatorDebugQuery" name="moderatorDebugQuery" value={debugQuery} onChange={(e) => setDebugQuery(e.target.value)} placeholder="Código ou id (debug)" className="w-40" />
                <Button size="sm" onClick={handleDebugSearch}>Debug Buscar</Button>
              </CardContent>
            </Card>
          </div>
        )}

        <Dialog open={pickupDialogOpen} onOpenChange={setPickupDialogOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display flex items-center gap-2">
                <QrCode className="h-5 w-5 text-gold" /> Validação de Retirada
              </DialogTitle>
            </DialogHeader>
            {foundOrder && (
              <div className="space-y-4 py-2">
                <div className="bg-muted rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Código</span>
                    <span className="font-mono font-bold tracking-widest text-foreground">{foundOrder.pickup_code}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cliente</span>
                    <span className="font-medium text-foreground">{foundOrder.customer_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total</span>
                    <span className="font-bold text-foreground">R$ {Number(foundOrder.total).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status Atual</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${(statusMap[foundOrder.status] || statusMap.pendente).className}`}>
                      {(statusMap[foundOrder.status] || { label: foundOrder.status }).label}
                    </span>
                  </div>
                  {foundOrder.paid_by && foundOrder.paid_at && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Pgto aprovado</span>
                      <span className="text-xs text-foreground">{formatTrackingInfo(foundOrder.paid_by, foundOrder.paid_at)}</span>
                    </div>
                  )}
                </div>

                {orderItems.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Itens do Pedido:</p>
                    <div className="bg-muted rounded-lg p-3 space-y-1">
                      {orderItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-foreground">{item.quantity}x {item.product_name}</span>
                          <span className="text-muted-foreground">R$ {(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {foundOrder.status === "retirado" && (
                  <p className="text-sm text-green-600 font-medium text-center">✅ Este pedido já foi retirado.</p>
                )}
                {foundOrder.status === "cancelado" && (
                  <p className="text-sm text-red-500 font-medium text-center">❌ Este pedido foi cancelado.</p>
                )}
              </div>
            )}
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setPickupDialogOpen(false)} className="w-full sm:w-auto">Fechar</Button>
              {foundOrder && foundOrder.status !== "retirado" && foundOrder.status !== "cancelado" && (
                <Button onClick={() => confirmPickupMutation.mutate(foundOrder.id)} className="bg-green-600 hover:bg-green-700 text-white font-semibold w-full sm:w-auto">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Confirmar Retirada
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Moderator;