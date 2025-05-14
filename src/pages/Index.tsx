
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFE8D6]">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[#A47149] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#FFE8D6] p-4">
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl font-bold text-[#A47149] mb-4">Welcome to SweetFlow</h1>
        <p className="text-xl text-gray-700 mb-8">
          The perfect solution for pastry chefs to manage orders, recipes, and schedules all in one place.
        </p>
        <Button 
          onClick={() => navigate("/auth")} 
          className="bg-[#A47149] hover:bg-[#8B5E3C] text-white px-8 py-2 text-lg"
        >
          Get Started
        </Button>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#A47149] mb-3">Order Management</h2>
          <p className="text-gray-600">Keep track of all your customer orders in one organized system.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#A47149] mb-3">Recipe Library</h2>
          <p className="text-gray-600">Store and access your personal recipes anytime, anywhere.</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-[#A47149] mb-3">Smart Calendar</h2>
          <p className="text-gray-600">View upcoming orders and plan your production schedule efficiently.</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
