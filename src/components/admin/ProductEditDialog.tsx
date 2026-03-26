import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Product } from "@/contexts/ProductContext";
import { uploadProductImage } from "@/lib/uploadProductImage";

interface ProductEditDialogProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Product>) => void;
}

const ProductEditDialog = ({ product, open, onClose, onSave }: ProductEditDialogProps) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    priceUnit: "",
    weight: "",
    stock: 0,
    available: true,
    image: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description,
        price: product.price,
        priceUnit: product.priceUnit,
        weight: product.weight,
        stock: product.stock,
        available: product.available,
        image: product.image,
      });
    }
  }, [product]);

  const handleSave = () => {
    if (!product) return;
    onSave(product.id, form);
    onClose();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadProductImage(file);
    if (url) {
      setForm((prev) => ({ ...prev, image: url }));
    }
    setUploading(false);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Editar Produto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <div className="flex items-center gap-4">
              <img
                src={form.image || "/placeholder.svg"}
                alt={form.name}
                className="w-20 h-20 rounded-lg object-cover border"
              />
              <div className="flex-1">
                <Input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
                {uploading && <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Enviando...</div>}
                <p className="text-xs text-muted-foreground mt-1">Selecione uma nova imagem para o mostruário</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço</Label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input value={form.priceUnit} onChange={(e) => setForm({ ...form, priceUnit: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Peso</Label>
              <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={form.available} onCheckedChange={(checked) => setForm({ ...form, available: checked })} />
            <Label>Produto disponível para venda</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={uploading} className="bg-gold hover:bg-gold-dark text-primary font-semibold">
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductEditDialog;
