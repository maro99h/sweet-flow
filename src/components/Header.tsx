
import { useNavigate, Link } from "react-router-dom"; // Added Link
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Settings, ListOrdered } from "lucide-react"; // Added ListOrdered
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem 
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  showBackButton?: boolean;
}

const Header = ({ showBackButton = false }: HeaderProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleNavigateToSettings = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Navigating to settings page");
    navigate("/settings");
  };
  
  const handleNavigateToDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate("/dashboard");
  };
  
  return (
    <header className="bg-brand-brown text-white shadow-md"> {/* Updated Header background and text color */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        {showBackButton ? (
          <div className="flex-1">
            <Button 
              variant="ghost" 
              onClick={(e) => {
                e.preventDefault();
                navigate("/dashboard");
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        ) : (
          <div className="flex-1"></div>
        )}
        
        <h1 
          className="text-2xl font-bold text-center flex-1 cursor-pointer" // Removed text-gray-800
          onClick={handleNavigateToDashboard}
        >
          SweetFlow
        </h1>
        
        <div className="flex items-center space-x-4 flex-1 justify-end">
          <Button variant="ghost" className="text-white hover:bg-brand-brown-dark hover:text-white" onClick={() => navigate("/orders")}> {/* Changed to onClick */}
            {/* <Link to="/orders" className="flex items-center"> */}
              <ListOrdered className="h-5 w-5 mr-2" /> Orders
            {/* </Link> */}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:bg-brand-brown-dark hover:text-white"> {/* Ensure icon is white */}
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end"> {/* Consider styling dropdown content for contrast if needed */}
              <DropdownMenuItem onClick={handleNavigateToSettings}>
                Business Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button 
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-brand-brown" // Styled outline button
            onClick={signOut}
          >
            Sign out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
