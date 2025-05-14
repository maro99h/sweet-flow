import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Package, Clock, CheckCircle, DollarSign, Users } from "lucide-react"; // Added DollarSign, Users

const OrderSummary = () => {
  const { user } = useAuth();
  
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  
  const { data: orderStats, isLoading, error } = useQuery({
    queryKey: ['orderStatsDashboard', user?.id], // Changed queryKey to be more specific
    queryFn: async () => {
      if (!user) return { today: 0, tomorrow: 0, pending: 0, completed: 0, totalRevenue: 0, totalClients: 0 };
      
      try {
        const commonFilters = (query: any) => query.eq('user_id', user.id);

        const { count: todayCount } = await commonFilters(supabase.from('orders').select('*', { count: 'exact', head: true })).eq('delivery_date', todayStr);
        const { count: tomorrowCount } = await commonFilters(supabase.from('orders').select('*', { count: 'exact', head: true })).eq('delivery_date', tomorrowStr);
        const { count: pendingCount } = await commonFilters(supabase.from('orders').select('*', { count: 'exact', head: true })).eq('status', 'pending');
        const { count: completedCount } = await commonFilters(supabase.from('orders').select('*', { count: 'exact', head: true })).eq('status', 'completed');
        
        const { data: revenueData } = await commonFilters(supabase.from('orders').select('total_price')).eq('status', 'completed');
        const totalRevenue = revenueData?.reduce((sum, order) => sum + order.total_price, 0) || 0;

        const { count: totalClientsCount } = await commonFilters(supabase.from('clients').select('*', { count: 'exact', head: true }));

        return {
          today: todayCount || 0,
          tomorrow: tomorrowCount || 0,
          pending: pendingCount || 0,
          completed: completedCount || 0,
          totalRevenue,
          totalClients: totalClientsCount || 0,
        };
      } catch (err) {
        console.error('Error fetching order stats:', err);
        // Return default on error to prevent crash, error is handled by useQuery's error state
        return { today: 0, tomorrow: 0, pending: 0, completed: 0, totalRevenue: 0, totalClients: 0 };
      }
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-lg rounded-xl bg-brand-peach border-brand-brown">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
              <Skeleton className="h-5 w-24 bg-brand-brown/20" />
              <Skeleton className="h-6 w-6 rounded-full bg-brand-brown/20" />
            </CardHeader>
            <CardContent className="pb-4 px-4">
              <Skeleton className="h-8 w-20 bg-brand-brown/20" />
              <Skeleton className="h-4 w-28 mt-1 bg-brand-brown/20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) return <p className="text-red-600 p-4 bg-red-100 rounded-md">Error loading summary: {error.message}</p>;

  const summaryItems = [
    { title: "Today's Orders", value: orderStats?.today.toString() || '0', icon: <Calendar className="h-5 w-5 text-brand-rust" />, description: "Scheduled for today" },
    { title: "Pending Orders", value: orderStats?.pending.toString() || '0', icon: <Package className="h-5 w-5 text-brand-accent" />, description: "Awaiting processing" },
    { title: "Completed Orders", value: orderStats?.completed.toString() || '0', icon: <CheckCircle className="h-5 w-5 text-green-600" />, description: "Successfully fulfilled" },
    { title: "Total Revenue", value: `${orderStats?.totalRevenue.toFixed(2) || '0.00'} ILS`, icon: <DollarSign className="h-5 w-5 text-brand-gold" />, description: "From completed orders" },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {summaryItems.map((item) => (
        <Card key={item.title} className="shadow-xl rounded-xl border-l-4 border-brand-coral transform hover:scale-105 transition-transform duration-200 bg-white hover:shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-medium text-brand-brown-dark">{item.title}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent className="pb-4 px-4">
            <div className="text-3xl font-bold text-brand-rust">{item.value}</div>
            <p className="text-xs text-muted-foreground pt-1">{item.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default OrderSummary;
