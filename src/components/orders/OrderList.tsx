
import { format } from "date-fns";
import { Edit, Trash2, Clock, CheckCircle } from "lucide-react";
import { Order } from "@/types/orders";
import { Card } from "@/components/ui/card"; // Re-added Card import
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useAuth } from "@/contexts/AuthContext"; // Added
import { supabase } from "@/integrations/supabase/client"; // Added
import { useToast } from "@/hooks/use-toast"; // Added
import { useQueryClient } from "@tanstack/react-query"; // Added

interface OrderListProps {
  orders: Order[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onViewDetails: (order: Order) => void;
}

import OrderDisplayCard from "./OrderDisplayCard"; // Import the display card

const OrderList = ({ orders, isLoading, error, onEdit, onDelete, onViewDetails }: OrderListProps) => {
  const { user } = useAuth(); // Added
  const { toast } = useToast(); // Added
  const queryClient = useQueryClient(); // Added

  const handleMarkAsCompleted = async (order: Order) => { // Added function
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({ title: "Order Updated", description: `${order.client_name}'s order marked as completed.` });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to update order status.", variant: "destructive" });
    }
  };
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex flex-col space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <div className="flex justify-between">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-24" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <Card className="p-6 border-red-200 bg-red-50">
        <p className="text-red-600">Error loading orders: {error.message}</p>
      </Card>
    );
  }
  
  if (orders.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-gray-500">No orders found in this category</p>
      </Card>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">New</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">In Progress</Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'MMM d, yyyy');
    } catch (error) {
      return dateStr;
    }
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return '';
    try {
      const [hours, minutes] = timeStr.split(':');
      return format(new Date().setHours(parseInt(hours), parseInt(minutes)), 'h:mm a');
    } catch (error) {
      return timeStr;
    }
  };

  const formatItems = (items: any[]) => {
    if (!items || !Array.isArray(items) || items.length === 0) {
      return "No items";
    }

    return items.map(item => `${item.quantity}x ${item.dessert_name}`).join(', ');
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <OrderDisplayCard
          key={order.id}
          order={order}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewDetails={onViewDetails}
        />
      ))}
    </div>
  );
};

export default OrderList;
