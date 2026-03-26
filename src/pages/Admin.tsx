import { useState } from "react";
import { AdminSidebar, AdminMobileHeader, Tab } from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminSettings from "@/components/admin/AdminSettings";
import AdminStockMovements from "@/components/admin/AdminStockMovements";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminCombos from "@/components/admin/AdminCombos";
import AdminCharities from "@/components/admin/AdminCharities";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen flex">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AdminMobileHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 md:ml-64 px-4 py-4 md:p-6 pt-16 bg-background overflow-x-hidden">
        {activeTab === "dashboard" && <AdminDashboard />}
        {activeTab === "products" && <AdminProducts />}
        {activeTab === "orders" && <AdminOrders />}
        {activeTab === "stock" && <AdminStockMovements />}
        {activeTab === "coupons" && <AdminCoupons />}
        {activeTab === "combos" && <AdminCombos />}
        {activeTab === "charities" && <AdminCharities />}
        {activeTab === "settings" && <AdminSettings />}
      </main>
    </div>
  );
};

export default Admin;
