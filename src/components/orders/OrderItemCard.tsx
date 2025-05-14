import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrashIcon } from "lucide-react";
import { Control, useWatch } from "react-hook-form"; // Import useWatch
import { OrderFormValues } from "@/types/orders";

interface OrderItemCardProps {
  control: Control<OrderFormValues>;
  index: number;
  remove: (index: number) => void;
  canRemove: boolean;
  // watch prop is no longer needed as we'll use useWatch
}

const OrderItemCard = ({ control, index, remove, canRemove }: OrderItemCardProps) => {
  // Use useWatch for more optimized re-renders if needed, or stick to form.watch if simpler
  const quantity = useWatch({ control, name: `items.${index}.quantity` }) || 0;
  const unitPrice = useWatch({ control, name: `items.${index}.unit_price` }) || 0;
  const subtotal = Number(quantity) * Number(unitPrice);
  
  return (
    <Card key={index} className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name={`items.${index}.dessert_name`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Dessert Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter dessert name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`items.${index}.quantity`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Quantity *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="1"
                  placeholder="Enter quantity" 
                  {...field}
                  onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} // Ensure number
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={control}
          name={`items.${index}.unit_price`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Price (ILS) *</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min="0" // Allow 0 for unit price
                  step="0.01"
                  placeholder="Enter unit price" 
                  {...field} 
                  onChange={e => field.onChange(parseFloat(e.target.value) || 0)} // Ensure number
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      {canRemove && (
        <div className="flex justify-end mt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            className="text-red-500 hover:text-red-700 flex items-center gap-1"
          >
            <TrashIcon className="h-4 w-4" /> Remove
          </Button>
        </div>
      )}
      
      <div className="mt-2 text-right text-sm">
        <span className="font-medium">Subtotal:</span> {subtotal.toFixed(2)} ILS
      </div>
    </Card>
  );
};

export default OrderItemCard;
