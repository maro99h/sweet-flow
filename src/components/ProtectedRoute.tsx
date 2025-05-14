
import { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log("Protected route check:", {
      path: location.pathname,
      isAuthenticated: !!user,
      isLoading
    });

    if (!isLoading && !user) {
      toast({
        title: "Authentication Required",
        description: "You must be logged in to view this page",
        variant: "destructive",
      });
    }
  }, [user, isLoading, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FFE8D6]">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-[#A47149] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-[#A47149] text-lg font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log("No user found, redirecting to auth page");
    // Save the current path to redirect back after login
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  return <>{children}</>;
};
