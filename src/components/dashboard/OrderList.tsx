
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Order } from "@/types/orders";

interface OrderListProps {
  title: string;
  period: "today" | "tomorrow";
}

const OrderList = ({ title, period }: OrderListProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Define date for filtering based on period
  const today = new Date();
  const filterDate = new Date(today);
  if (period === "tomorrow") {
    filterDate.setDate(filterDate.getDate() + 1);
  }
  
  // Format date for display and filtering
  const dateStr = filterDate.toISOString().split('T')[0];
  
  // Fetch orders for the specified period
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ['orders', user?.id, period],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .eq('delivery_date', dateStr)
        .order('delivery_time', { ascending: true });
        
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });

  const handleViewAll = () => {
    navigate("/orders");
  };

  const formatTime = (timeString: string | null) => {
    if (!timeString) return '';
    
    try {
      // Convert HH:MM:SS to display format
      const [hours, minutes] = timeString.split(':');
      const time = new Date();
      time.setHours(parseInt(hours), parseInt(minutes), 0);
      return format(time, 'h:mm a'); // Format as 1:30 PM
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const getFirstItemInfo = (order: Order) => {
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      return { name: "No items", quantity: 0 };
    }
    
    const firstItem = order.items[0];
    const quantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const itemCount = order.items.length;
    
    let name = firstItem.dessert_name;
    if (itemCount > 1) {
      name += ` + ${itemCount - 1} more`;
    }
    
    return { name, quantity };
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">{title}</CardTitle>
          <CalendarIcon className="h-5 w-5 text-gray-400" />
        </div>
        <CardDescription>
          {period === "today" ? "Orders scheduled for today" : "Upcoming orders for tomorrow"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : error ? (
          <div className="text-sm text-red-500">Error loading orders</div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => {
              const { name, quantity } = getFirstItemInfo(order);
              return (
                <div 
                  key={order.id} 
                  className="border border-gray-100 rounded-md p-3 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <div className="flex justify-between">
                    <span className="font-medium">{order.client_name}</span>
                    <span className="text-sm text-gray-500">
                      {order.delivery_time && (
                        <span className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" /> 
                          {formatTime(order.delivery_time)}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-sm mt-1">
                    {quantity}x {name}
                  </div>
                  <div className="text-xs mt-1 flex justify-between">
                    <span className={`px-2 py-0.5 rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      order.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-medium">{order.total_price.toFixed(2)} ILS</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-sm text-gray-500">No orders scheduled for {period === "today" ? "today" : "tomorrow"}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={() => navigate("/orders/add")}
            >
              Add an order
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="ghost" 
          className="w-full justify-start p-0"
          onClick={handleViewAll}
        >
          View all orders
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderList;
