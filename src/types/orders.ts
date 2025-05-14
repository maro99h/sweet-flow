
export interface OrderItem {
  dessert_name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  user_id: string;
  client_name: string;
  items: OrderItem[];
  total_price: number;
  delivery_date: string;
  delivery_time: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type OrderFormValues = {
  clientName: string;
  items: {
    dessert_name: string;
    quantity: number;
    unit_price: number;
  }[];
  deliveryDate: string;
  deliveryTime?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
};

// Database type that includes the orders table for typecasting
export type Database = {
  public: {
    Tables: {
      orders: {
        Row: Order;
        Insert: {
          user_id: string;
          client_name: string;
          items: OrderItem[];
          total_price: number;
          delivery_date: string;
          delivery_time?: string | null;
          status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          notes?: string | null;
        };
        Update: Partial<{
          client_name: string;
          items: OrderItem[];
          total_price: number;
          delivery_date: string;
          delivery_time: string | null;
          status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
          notes: string | null;
        }>;
      };
      profiles: {
        Row: {
          business_name: string | null;
          created_at: string;
          full_name: string | null;
          id: string;
          updated_at: string;
        };
      };
    };
  };
};
