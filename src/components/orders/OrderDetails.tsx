
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Order } from "@/types/orders";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import OrderEditModal from "@/components/orders/OrderEditModal";
import OrderDeleteDialog from "@/components/orders/OrderDeleteDialog";
import { ChevronLeft, Edit, Trash2, Clock } from "lucide-react";

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { data: order, isLoading, error, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      if (!user || !id) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        console.error('Error fetching order:', error);
        throw error;
      }
      
      return data as Order;
    },
    enabled: !!user && !!id,
  });

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
      return format(new Date(dateStr), 'MMMM d, yyyy');
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

  const handleBackToOrders = () => {
    navigate('/orders/all');
  };

  const handleEdit = () => {
    setEditModalOpen(true);
  };
  
  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };
  
  const handleEditSuccess = () => {
    refetch();
    setEditModalOpen(false);
  };
  
  const handleDeleteSuccess = () => {
    navigate('/orders/all');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToOrders} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-1/3" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleBackToOrders} className="mb-4">
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Orders
        </Button>
        <Card className="p-6 border-red-200 bg-red-50">
          <p className="text-red-600">
            {error ? `Error loading order: ${error.message}` : "Order not found"}
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={handleBackToOrders} className="mb-4">
        <ChevronLeft className="h-4 w-4 mr-2" /> Back to Orders
      </Button>
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4">
          <div>
            <CardTitle className="text-xl mb-1">{order.client_name}'s Order</CardTitle>
            <div className="flex items-center text-sm text-gray-500">
              <span>{formatDate(order.delivery_date)}</span>
              {order.delivery_time && (
                <span className="flex items-center ml-2">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatTime(order.delivery_time)}
                </span>
              )}
            </div>
          </div>
          <div className="mt-2 sm:mt-0">
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>
        
        <CardContent className="pt-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Order Items</h3>
            <ul className="mt-2 divide-y">
              {order.items.map((item, index) => (
                <li key={index} className="py-2 flex justify-between">
                  <span>
                    {item.quantity} × {item.dessert_name}
                  </span>
                  <span className="text-gray-600">{(item.quantity * item.unit_price).toFixed(2)} ILS</span>
                </li>
              ))}
            </ul>
            <div className="pt-2 mt-2 border-t border-gray-100 flex justify-between font-semibold">
              <span>Total</span>
              <span>{order.total_price.toFixed(2)} ILS</span>
            </div>
          </div>
          
          {order.notes && (
            <div className="bg-gray-50 p-3 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Notes</h3>
              <p className="mt-1 text-sm whitespace-pre-line">{order.notes}</p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="border-t pt-4 flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={handleEdit}
            className="flex items-center"
          >
            <Edit className="h-4 w-4 mr-1" /> Edit Order
          </Button>
          <Button 
            variant="outline" 
            onClick={handleDelete}
            className="flex items-center text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" /> Delete Order
          </Button>
        </CardFooter>
      </Card>
      
      {order && (
        <>
          <OrderEditModal 
            open={editModalOpen}
            onOpenChange={setEditModalOpen}
            order={order}
            onSuccess={handleEditSuccess}
          />
          
          <OrderDeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            order={order}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </div>
  );
};

export default OrderDetails;
