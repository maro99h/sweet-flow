import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import DashboardNavigationMenu from "@/components/dashboard/NavigationMenu";
import WelcomeSection from "@/components/dashboard/WelcomeSection";
import OrderSummary from "@/components/dashboard/OrderSummary";
import { AllOrders } from "@/components/orders/OrderViews";
import ClientList from "@/components/clients/ClientList";
import RecipeList from "@/components/recipes/RecipeList"; // Import RecipeList
import OrderFormModal from "@/components/orders/OrderFormModal";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import AddClientForm from "@/components/clients/AddClientForm";
import AddRecipeForm from "@/components/recipes/AddRecipeForm"; // Import AddRecipeForm

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<{ full_name?: string; business_name?: string } | null>(null);
  const [showOrders, setShowOrders] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [showRecipes, setShowRecipes] = useState(false); // State for recipes visibility
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false); // State for recipe modal
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, business_name")
        .eq("id", user.id)
        .single();
      if (!error) setProfile(data);
    };
    fetchProfile();
  }, [user]);

  const toggleOrders = () => {
    setShowClients(false);
    setShowRecipes(false);
    setShowOrders((prev) => !prev);
  };
  const toggleClients = () => {
    setShowOrders(false);
    setShowRecipes(false);
    setShowClients((prev) => !prev);
  };
  const toggleRecipes = () => { // Handler for showing recipes
    setShowOrders(false);
    setShowClients(false);
    setShowRecipes((prev) => !prev);
  };
  const openOrderModal = () => setIsOrderModalOpen(true);
  const openClientModal = () => setIsClientModalOpen(true);
  const openRecipeModal = () => setIsRecipeModalOpen(true); // Handler for opening recipe modal

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Navigation Menu */}
        <DashboardNavigationMenu
          onOrdersClick={toggleOrders}
          onAddOrderClick={openOrderModal}
          onClientsClick={toggleClients}
          onAddClientClick={openClientModal}
          onRecipesClick={toggleRecipes} // Pass handler
          onAddRecipeClick={openRecipeModal} // Pass handler
        />

        {/* Order Summary */}
        <OrderSummary />

        {/* Welcome + Expandable Sections Container */}
        <div
          className={`bg-brand-peach rounded-lg shadow-lg p-6 mb-6 overflow-hidden transition-all duration-500 ease-in-out ${ // Added shadow-lg, duration-500, ease-in-out
            showOrders || showClients || showRecipes ? "max-h-[1000px]" : "max-h-40" // Increased max-h for expanded, adjusted max-h for collapsed
          }`} // Changed bg-white to bg-brand-peach
        >
          <WelcomeSection userName={profile?.full_name} />
          {showOrders && <div className="mt-4"><AllOrders /></div>}
          {showClients && <div className="mt-4"><ClientList /></div>}
          {showRecipes && <div className="mt-4"><RecipeList /></div>} 
        </div>
      </main>

      {/* Modals */}
      <OrderFormModal open={isOrderModalOpen} onOpenChange={setIsOrderModalOpen} />
      <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
        <DialogContent><AddClientForm onSuccess={() => setIsClientModalOpen(false)} /></DialogContent>
      </Dialog>
      <Dialog open={isRecipeModalOpen} onOpenChange={setIsRecipeModalOpen}>
        <DialogContent><AddRecipeForm onSuccess={() => setIsRecipeModalOpen(false)} /></DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
