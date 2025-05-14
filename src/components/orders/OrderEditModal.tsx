
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderFormValues } from "@/types/orders";
import { toast } from "@/hooks/use-toast";
import OrderForm from "@/components/orders/OrderForm";
import { useQueryClient } from "@tanstack/react-query";

interface OrderEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: Order;
  onSuccess?: () => void;
}

const OrderEditModal = ({ 
  open, 
  onOpenChange, 
  order,
  onSuccess 
}: OrderEditModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  
  const handleSubmit = async (values: OrderFormValues) => {
    setIsSubmitting(true);
    
    try {
      // Calculate total price
      const totalPrice = values.items.reduce(
        (sum, item) => sum + item.quantity * item.unit_price, 
        0
      );
      
      const { error } = await supabase
        .from('orders')
        .update({
          client_name: values.clientName,
          items: values.items,
          total_price: totalPrice,
          delivery_date: values.deliveryDate,
          delivery_time: values.deliveryTime || null,
          status: values.status || 'pending',
          notes: values.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', order.id);
        
      if (error) throw error;
      
      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      
      toast({
        title: "Order updated",
        description: "The order has been updated successfully",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Close the modal
      onOpenChange(false);
      
    } catch (error: any) {
      console.error("Error updating order:", error);
      toast({
        title: "Error updating order",
        description: error.message || "There was an error updating the order",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert order data to form values
  const initialValues: OrderFormValues = {
    clientName: order.client_name,
    items: order.items,
    deliveryDate: order.delivery_date,
    deliveryTime: order.delivery_time || '',
    status: order.status,
    notes: order.notes || '',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Edit Order</DialogTitle>
        </DialogHeader>
        
        <OrderForm 
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          onCancel={() => onOpenChange(false)}
          initialValues={initialValues}
        />
      </DialogContent>
    </Dialog>
  );
};

export default OrderEditModal;
