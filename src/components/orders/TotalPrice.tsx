
import { OrderFormValues } from "@/types/orders";
import { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";

interface TotalPriceProps {
  control: any;
}

const TotalPrice = ({ control }: TotalPriceProps) => {
  const [total, setTotal] = useState(0);
  
  // Watch the items array for changes
  const items = useWatch({
    control,
    name: "items"
  });
  
  // Calculate total when items change
  useEffect(() => {
    if (!items) return;
    
    const calculatedTotal = items.reduce((sum: number, item: any) => {
      return sum + ((item?.quantity || 0) * (item?.unit_price || 0));
    }, 0);
    
    setTotal(calculatedTotal);
  }, [items]);
  
  return (
    <div className="flex justify-between items-center bg-muted p-3 rounded-md mt-4">
      <span className="font-semibold">Total Price:</span>
      <span className="font-bold text-lg">{total.toFixed(2)} ILS</span>
    </div>
  );
};

export default TotalPrice;
