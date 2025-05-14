
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Order } from "@/types/orders";
import OrderList from "@/components/orders/OrderList";
import OrderEditModal from "@/components/orders/OrderEditModal";
import OrderDeleteDialog from "@/components/orders/OrderDeleteDialog";
import { toast } from "@/hooks/use-toast";

const useOrders = (status?: string) => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['orders', user?.id, status],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('delivery_date', { ascending: true });
        
      if (status && status !== 'all') {
        // Show both pending and in-progress as "in progress" view
        if (status === 'in_progress') {
          query = query.in('status', ['pending', 'in_progress']);
        } else {
          query = query.eq('status', status);
        }
      }
      
      const { data, error } = await query;
        
      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }
      
      return data || [];
    },
    enabled: !!user,
  });
};

// Shared component structure for all order views
const OrdersView = ({ title, status }: { title: string; status?: string }) => {
  const navigate = useNavigate();
  const { data: orders, isLoading, error, refetch } = useOrders(status);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditModalOpen(true);
  };
  
  const handleDelete = (order: Order) => {
    setSelectedOrder(order);
    setDeleteDialogOpen(true);
  };

  const handleViewDetails = (order: Order) => {
    if (!order || !order.id) {
      toast({
        title: "Error",
        description: "Cannot view order details: Invalid order data",
        variant: "destructive",
      });
      return;
    }
    navigate(`/orders/${order.id}`);
  };
  
  const handleEditSuccess = () => {
    setEditModalOpen(false);
    refetch();
  };
  
  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    refetch();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">{title}</h2>
      
      <OrderList 
        orders={orders || []}
        isLoading={isLoading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onViewDetails={handleViewDetails}
      />
      
      {selectedOrder && (
        <>
          <OrderEditModal 
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            order={selectedOrder}
            onSuccess={handleEditSuccess}
          />
          
          <OrderDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            order={selectedOrder}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>
  );
};

// Individual view components 
export const AllOrders = () => (
  <OrdersView title="All Orders" />
);

export const NewOrders = () => (
  <OrdersView title="New Orders" status="pending" />
);

export const InProgressOrders = () => (
  <OrdersView title="In Progress Orders" status="in_progress" />
);

export const CompletedOrders = () => (
  <OrdersView title="Completed Orders" status="completed" />
);
