import { useState } from "react";
import { AdminSidebar, AdminMobileHeader, Tab } from "@/components/admin/AdminSidebar";
import AdminDashboard from "@/components/admin/AdminDashboard";
import AdminProducts from "@/components/admin/AdminProducts";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminStockMovements from "@/components/admin/AdminStockMovements";
import AdminCoupons from "@/components/admin/AdminCoupons";
import AdminCharities from "@/components/admin/AdminCharities";
import AdminLogs from "@/components/admin/AdminLogs";

const Staff = () => {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  return (
    <div className="min-h-screen flex bg-gray-50/30">
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} role="staff" />
      <AdminMobileHeader activeTab={activeTab} setActiveTab={setActiveTab} role="staff" />

      <main className="flex-1 md:ml-64 px-6 py-8 md:px-10 md:py-10 pt-20 md:pt-10 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto h-full">
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "products" && <AdminProducts readOnly />}
          {activeTab === "orders" && <AdminOrders />}
          {activeTab === "stock" && <AdminStockMovements readOnly />}
          {activeTab === "coupons" && <AdminCoupons readOnly />}
          {activeTab === "charities" && <AdminCharities readOnly />}
          {activeTab === "logs" && <AdminLogs />}
        </div>
      </main>
    </div>
  );
};

export default Staff;
