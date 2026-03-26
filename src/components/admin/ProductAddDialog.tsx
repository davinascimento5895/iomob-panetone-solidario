import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

interface ProductAddDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (data: Omit<Product, "id">) => void;
}

const defaultForm = {
  name: "",
  description: "",
  price: "",
  priceUnit: "unidade",
  weight: "",
  stock: 0,
  available: true,
  image: "",
};

const ProductAddDialog = ({ open, onClose, onAdd }: ProductAddDialogProps) => {
  const [form, setForm] = useState(defaultForm);
  const [uploading, setUploading] = useState(false);

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

  const handleAdd = () => {
    if (!form.name || !form.price) return;
    onAdd(form);
    setForm(defaultForm);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display">Novo Produto</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Imagem do Produto</Label>
            <Input type="file" accept="image/*" onChange={handleImageChange} disabled={uploading} />
            {uploading && <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> Enviando...</div>}
            {form.image && (
              <img src={form.image} alt="Preview" className="w-20 h-20 rounded-lg object-cover border mt-2" />
            )}
          </div>
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Nome do produto" />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Descrição do produto" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Preço *</Label>
              <Input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="R$ 0,00" />
            </div>
            <div className="space-y-2">
              <Label>Unidade</Label>
              <Input value={form.priceUnit} onChange={(e) => setForm({ ...form, priceUnit: e.target.value })} placeholder="unidade" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Peso</Label>
              <Input value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} placeholder="400g" />
            </div>
            <div className="space-y-2">
              <Label>Estoque</Label>
              <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleAdd} disabled={uploading} className="bg-gold hover:bg-gold-dark text-primary font-semibold">
            Adicionar Produto
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductAddDialog;
