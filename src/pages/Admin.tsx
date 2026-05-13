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
import AdminClubs from "@/components/admin/AdminClubs";

const Admin = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen flex bg-gray-50/30">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <AdminMobileHeader activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 md:ml-64 px-6 py-8 md:px-10 md:py-10 pt-20 md:pt-10 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "products" && <AdminProducts />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "stock" && <AdminStockMovements />}
          {activeTab === "coupons" && <AdminCoupons />}
          {activeTab === "combos" && <AdminCombos />}
          {activeTab === "charities" && <AdminCharities />}
          {activeTab === "clubs" && <AdminClubs />}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};

export default Admin;
