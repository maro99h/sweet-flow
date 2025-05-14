import { Route, Routes, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import OrdersLayout from "@/components/orders/OrdersLayout";
import { AllOrders, CompletedOrders, InProgressOrders } from "@/components/orders/OrderViews"; // Added InProgressOrders
import AddOrderForm from "@/components/orders/AddOrderForm";
import OrderDetails from "@/components/orders/OrderDetails";


const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Default to 'in-progress' if on base /orders path
  useEffect(() => {
    if (location.pathname === "/orders" || location.pathname === "/orders/") {
      navigate("/orders/in-progress", { replace: true });
    }
  }, [location.pathname, navigate]);

  return (
    <OrdersLayout>
      <Routes>
        <Route path="in-progress" element={<InProgressOrders />} />
        <Route path="completed" element={<CompletedOrders />} />
        <Route path="all" element={<AllOrders />} /> 
        <Route path="add" element={<AddOrderForm />} />
        <Route path=":id" element={<OrderDetails />} />
        {/* Fallback redirect for any other sub-paths under /orders */}
        <Route path="*" element={<Navigate to="in-progress" replace />} />
      </Routes>
    </OrdersLayout>
  );
};

export default OrdersPage;
