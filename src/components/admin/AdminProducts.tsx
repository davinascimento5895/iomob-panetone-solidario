import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react";
import { useProducts, Product } from "@/contexts/ProductContext";
import { toast } from "sonner";
import ProductEditDialog from "./ProductEditDialog";
import ProductAddDialog from "./ProductAddDialog";
import { Card, CardContent } from "@/components/ui/card";
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

const AdminProducts = () => {
  const { products, updateProduct, addProduct, deleteProduct } = useProducts();
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Produtos</h1>
        <Button size="sm" className="bg-gold hover:bg-gold-dark text-primary font-semibold" onClick={() => setAddOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Novo Produto
        </Button>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-card rounded-md overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Imagem</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nome</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Preço</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Estoque</th>
              <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
              <th className="text-right py-3 px-4 text-muted-foreground font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="py-3 px-4">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <p className="font-medium text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.weight}</p>
                </td>
                <td className="py-3 px-4 text-foreground">{product.price}</td>
                <td className="py-3 px-4">
                  <span className={`font-medium ${product.stock <= 10 ? "text-destructive" : "text-foreground"}`}>
                    {product.stock} un.
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    product.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {product.available ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditProduct(product)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(product.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardContent className="p-4">
              <div className="flex gap-3">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.weight}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex-shrink-0 ${
                      product.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                      {product.available ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex gap-4 text-sm">
                      <span className="text-foreground font-medium">{product.price}</span>
                      <span className={`font-medium ${product.stock <= 10 ? "text-destructive" : "text-muted-foreground"}`}>
                        {product.stock} un.
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditProduct(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteId(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {products.length === 0 && (
          <div className="py-12 text-center text-muted-foreground">Nenhum produto cadastrado.</div>
        )}
      </div>

      <ProductEditDialog product={editProduct} open={!!editProduct} onClose={() => setEditProduct(null)} onSave={updateProduct} />
      <ProductAddDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addProduct} />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir produto?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita. O produto será removido permanentemente.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (deleteId !== null) {
                  try {
                    await deleteProduct(deleteId);
                    toast.success("Produto excluído.");
                  } catch (e) {
                    console.error(e);
                    toast.error("Erro ao excluir produto.");
                  }
                }
                setDeleteId(null);
              }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;
