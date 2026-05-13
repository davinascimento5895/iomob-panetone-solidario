
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AdminLogs = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["order-history-all"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_history")
        .select("*, orders(customer_name, pickup_code), profiles(full_name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Carregando logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-navy-dark tracking-tight">Logs de Movimentação</h1>
        <p className="text-sm text-gray-500">Histórico completo de alterações no sistema</p>
      </div>

      <Card className="border-gray-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 border-b border-gray-100 uppercase text-[10px] font-bold text-gray-400 tracking-widest">
              <tr>
                <th className="px-6 py-4">Data/Hora</th>
                <th className="px-6 py-4">Usuário</th>
                <th className="px-6 py-4">Pedido</th>
                <th className="px-6 py-4">Alteração</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-[11px] font-medium text-gray-500">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-navy-dark uppercase text-[10px] tracking-tight">
                      {log.profiles?.full_name || log.user_id?.slice(0, 8)}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-navy-dark uppercase text-[10px]">
                      {log.orders?.customer_name}
                    </p>
                    <p className="text-[9px] font-mono text-gray-400 tracking-widest mt-0.5">
                      {log.orders?.pickup_code}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 py-0.5 bg-gray-100 rounded">
                        {log.old_status || "INÍCIO"}
                      </span>
                      <span className="text-gray-300">→</span>
                      <span className="text-[9px] font-bold text-navy-dark uppercase tracking-widest px-2 py-0.5 bg-gray-200 rounded">
                        {log.new_status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium italic">
                    Nenhum log registrado até o momento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogs;
