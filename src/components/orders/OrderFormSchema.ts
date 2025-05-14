
import * as z from "zod";

// Order item schema
export const orderItemSchema = z.object({
  dessert_name: z.string().min(1, "Dessert name is required"),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  unit_price: z.coerce.number().min(1, "Unit price must be at least 1 ILS"),
});

// Form validation schema
export const orderSchema = z.object({
  clientName: z.string().min(2, "Client name is required and must be at least 2 characters"),
  items: z.array(orderItemSchema).min(1, "At least one dessert item is required"),
  deliveryDate: z.string().refine(
    (date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    },
    { message: "Delivery date cannot be in the past" }
  ),
  deliveryTime: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

export type OrderFormSchemaType = z.infer<typeof orderSchema>;
