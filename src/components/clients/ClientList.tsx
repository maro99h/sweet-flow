
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription } from "@/components/ui/card";

type Client = {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
}

const ClientList = () => {
  const { user } = useAuth();
  
  const { data: clients, isLoading, error } = useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('clients')
        .select('id, full_name, phone_number, email')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching clients:', error);
        throw error;
      }
      
      return data as Client[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="bg-red-50 border-red-200">
        <CardContent className="pt-6">
          <CardDescription className="text-red-500">
            Error loading clients. Please try again later.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  if (clients?.length === 0) {
    return (
      <Card className="bg-white">
        <CardContent className="pt-6 text-center">
          <CardDescription className="mb-4">
            No clients found
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.full_name}</TableCell>
                <TableCell>{client.phone_number}</TableCell>
                <TableCell>{client.email || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ClientList;
