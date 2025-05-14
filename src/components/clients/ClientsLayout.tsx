
import { ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";

interface ClientsLayoutProps {
  children: ReactNode;
}

const ClientsLayout = ({ children }: ClientsLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAddClientPage = location.pathname === "/clients/add";
  
  const handleAddClient = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/clients/add");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Clients</h1>
          {!isAddClientPage && (
            <Button 
              onClick={handleAddClient}
              className="flex items-center gap-1"
            >
              <PlusIcon className="h-4 w-4" />
              Add Client
            </Button>
          )}
        </div>
        
        {children}
      </main>
    </div>
  );
};

export default ClientsLayout;
