import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Order } from "@/types/orders";
import { CheckCircle, Edit, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns"; // Ensure date-fns is imported

interface OrderDisplayCardProps {
  order: Order;
  onEdit: (order: Order) => void;
  onDelete: (order: Order) => void;
  onViewDetails: (order: Order) => void;
}

const OrderDisplayCard = ({ order, onEdit, onDelete, onViewDetails }: OrderDisplayCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleMarkAsCompleted = async () => {
    if (!user) {
      toast({ title: "Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'completed' })
        .eq('id', order.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: "Order Updated", description: `${order.client_name}'s order marked as completed.` });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to update order status.", variant: "destructive" });
    }
  };
  
  const deliveryDateTime = order.delivery_time && order.delivery_date
    ? `${format(new Date(order.delivery_date), 'MMM d, yyyy')} at ${order.delivery_time.substring(0,5)}`
    : order.delivery_date ? format(new Date(order.delivery_date), 'MMM d, yyyy') : 'N/A';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{order.client_name}</CardTitle>
        <CardDescription>Delivery: {deliveryDateTime}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          {order.items.map((item, index) => (
            <li key={index}>
              {item.quantity} x {item.dessert_name} (@ {item.unit_price.toFixed(2)} ILS each)
            </li>
          ))}
        </ul>
        <p className="font-semibold mt-2">Total: {order.total_price.toFixed(2)} ILS</p>
        <p className="text-xs text-muted-foreground mt-1">Status: {order.status}</p>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {order.status !== 'completed' && (
          <Button variant="outline" size="sm" onClick={handleMarkAsCompleted} className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> Mark Completed
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={() => onViewDetails(order)} className="flex items-center gap-1">
          <Eye className="h-4 w-4" /> View
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onEdit(order)} className="flex items-center gap-1">
          <Edit className="h-4 w-4" /> Edit
        </Button>
        <Button variant="destructive" size="sm" onClick={() => onDelete(order)} className="flex items-center gap-1">
          <Trash2 className="h-4 w-4" /> Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default OrderDisplayCard;
