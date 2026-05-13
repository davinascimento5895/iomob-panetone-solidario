
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProducts, Product } from "@/contexts/ProductContext";
import { toast } from "sonner";
import ProductEditDialog from "./ProductEditDialog";
import ProductAddDialog from "./ProductAddDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

const AdminProducts = ({ readOnly = false }: { readOnly?: boolean }) => {
  const { products, updateProduct, addProduct, deleteProduct } = useProducts();
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-dark tracking-tight">Produtos</h1>
          <p className="text-sm text-gray-500 mt-1">Gestão de catálogo e estoque</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Input
              placeholder="Buscar produto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border-gray-100 rounded-xl shadow-sm h-11 text-sm"
            />
          </div>
          {!readOnly && (
            <Button 
              className="bg-navy hover:bg-navy-dark text-white font-bold rounded-xl h-11 px-8 shadow-sm gap-2 uppercase text-[10px] tracking-widest" 
              onClick={() => setAddOpen(true)}
            >
              Novo Produto
            </Button>
          )}
        </div>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Imagem</th>
                <th className="px-6 py-4">Nome / Peso</th>
                <th className="px-6 py-4 text-center">Preço</th>
                <th className="px-6 py-4 text-center">Estoque</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1 border border-gray-100" />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100 text-[10px] font-bold text-gray-300">
                        SEM FOTO
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-navy-dark">{product.name}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">{product.weight}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-navy-dark">{product.price}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      product.stock <= 10 ? "bg-red-50 text-red-600" : "bg-gray-50 text-gray-500"
                    }`}>
                      {product.stock} un.
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      product.available ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                    }`}>
                      {product.available ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!readOnly && (
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-3 rounded-xl hover:bg-navy/5 text-gray-400 hover:text-navy transition-all text-[10px] font-bold uppercase" 
                          onClick={() => setEditProduct(product)}
                        >
                          Editar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-9 px-3 rounded-xl hover:bg-red-50 text-gray-400 hover:text-red-600 transition-all text-[10px] font-bold uppercase" 
                          onClick={() => setDeleteId(product.id)}
                        >
                          Excluir
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 font-medium">Nenhum produto cadastrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ProductEditDialog product={editProduct} open={!!editProduct} onClose={() => setEditProduct(null)} onSave={updateProduct} />
      <ProductAddDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addProduct} />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border-gray-100 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display font-bold text-navy-dark">Excluir Produto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O produto será removido permanentemente do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-gray-100 text-xs font-bold uppercase tracking-widest">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold uppercase tracking-widest"
              onClick={async () => {
                if (deleteId !== null) {
                  try {
                    await deleteProduct(deleteId);
                    toast.success("Produto excluído.");
                  } catch (e) {
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
