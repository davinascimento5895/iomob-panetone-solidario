import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  priceUnit: string;
  image: string;
  weight: string;
  available: boolean;
  stock: number;
}

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  updateProduct: (id: string, data: Partial<Product>) => void;
  addProduct: (data: Omit<Product, "id">) => void;
  deleteProduct: (id: string) => void;
  refetch: () => void;
}

const ProductContext = createContext<ProductContextType | null>(null);

const formatPrice = (price: number) =>
  `R$ ${price.toFixed(2).replace(".", ",")}`;

const mapRow = (row: any): Product => ({
  id: row.id,
  name: row.name,
  description: row.description ?? "",
  price: formatPrice(Number(row.price)),
  priceUnit: row.price_unit,
  image: row.image_url ?? "/placeholder.svg",
  weight: row.weight ?? "",
  available: row.available,
  stock: row.stock,
});

export const ProductProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: true });

      if (fetchError) throw fetchError;
      setProducts((data ?? []).map(mapRow));
    } catch (err: any) {
      setError("Não foi possível carregar os produtos. Verifique sua conexão.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateProduct = async (id: string, data: Partial<Product>) => {
    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description;
    if (data.price !== undefined) {
      const num = parseFloat(data.price.replace("R$", "").replace(",", ".").trim());
      if (!isNaN(num)) updates.price = num;
    }
    if (data.priceUnit !== undefined) updates.price_unit = data.priceUnit;
    if (data.image !== undefined) updates.image_url = data.image;
    if (data.weight !== undefined) updates.weight = data.weight;
    if (data.available !== undefined) updates.available = data.available;
    if (data.stock !== undefined) updates.stock = data.stock;

    await supabase.from("products").update(updates).eq("id", id);
    fetchProducts();
  };

  const addProduct = async (data: Omit<Product, "id">) => {
    const num = parseFloat(data.price.replace("R$", "").replace(",", ".").trim());
    await supabase.from("products").insert({
      name: data.name,
      description: data.description,
      price: isNaN(num) ? 0 : num,
      price_unit: data.priceUnit,
      image_url: data.image || null,
      weight: data.weight || null,
      stock: data.stock,
      available: data.available,
    });
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await supabase.from("products").delete().eq("id", id);
    fetchProducts();
  };

  return (
    <ProductContext.Provider value={{ products, loading, error, updateProduct, addProduct, deleteProduct, refetch: fetchProducts }}>
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be used within ProductProvider");
  return ctx;
};
