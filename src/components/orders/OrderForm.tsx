
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { OrderFormValues } from "@/types/orders";
import { PlusIcon } from "lucide-react";
import { orderSchema } from "./OrderFormSchema";
import OrderItemCard from "./OrderItemCard";
import DeliveryDetails from "./DeliveryDetails";
import OrderStatus from "./OrderStatus";
import TotalPrice from "./TotalPrice";

interface OrderFormProps {
  onSubmit: (values: OrderFormValues) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  initialValues?: Partial<OrderFormValues>;
}

const OrderForm = ({ onSubmit, isSubmitting, onCancel, initialValues }: OrderFormProps) => {
  // Get today's date for date validation
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Format today as ISO string for min date
  const todayStr = today.toISOString().split('T')[0];

  const form = useForm<OrderFormValues>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      clientName: initialValues?.clientName || "",
      items: initialValues?.items || [{ dessert_name: "", quantity: 1, unit_price: 0 }],
      deliveryDate: initialValues?.deliveryDate || todayStr,
      deliveryTime: initialValues?.deliveryTime || "",
      status: initialValues?.status || "pending",
      notes: initialValues?.notes || ""
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="clientName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Client Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter client name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Dessert Items *</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ dessert_name: "", quantity: 1, unit_price: 0 })}
              className="flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" /> Add Item
            </Button>
          </div>

          {fields.map((field, index) => (
            <OrderItemCard
              key={field.id}
              control={form.control}
              index={index}
              remove={remove}
              canRemove={fields.length > 1}
              watch={form.watch}
            />
          ))}
          
          <TotalPrice control={form.control} />

          {form.formState.errors.items?.root && (
            <p className="text-sm font-medium text-destructive mt-2">
              {form.formState.errors.items.root.message}
            </p>
          )}
        </div>
        
        <DeliveryDetails control={form.control} />
        
        <OrderStatus control={form.control} />
        
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (Optional)</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Additional instructions or notes"
                  className="min-h-[80px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrderForm;
