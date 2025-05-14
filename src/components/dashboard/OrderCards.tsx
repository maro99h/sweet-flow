
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderCards = () => {
  const navigate = useNavigate();

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      {/* Today's Orders */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Today's Orders</CardTitle>
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <CardDescription>Orders scheduled for today</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No orders scheduled for today</p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-0"
            onClick={() => handleNavClick("/orders")}
          >
            View all orders
          </Button>
        </CardFooter>
      </Card>

      {/* Orders for Tomorrow */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-medium">Tomorrow's Orders</CardTitle>
            <CalendarIcon className="h-5 w-5 text-gray-400" />
          </div>
          <CardDescription>Upcoming orders for tomorrow</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No orders scheduled for tomorrow</p>
        </CardContent>
        <CardFooter>
          <Button 
            variant="ghost" 
            className="w-full justify-start p-0"
            onClick={() => handleNavClick("/orders")}
          >
            View upcoming orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OrderCards;
