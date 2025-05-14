
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData?: {
    full_name?: string;
    business_name?: string;
  }) => Promise<{
    error: any | null;
    data: any | null;
  }>;
  signIn: (email: string, password: string) => Promise<{
    error: any | null;
    data: any | null;
    requiresEmailConfirmation?: boolean;
  }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{
    error: any | null;
    data: any | null;
  }>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up the auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);
        
        // Handle auth state changes with proper redirects
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
        
        if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && currentSession) {
          // Only redirect to dashboard if not already on an authenticated page
          const currentPath = window.location.pathname;
          if (currentPath === "/" || currentPath === "/auth" || currentPath.startsWith("/auth?")) {
            navigate("/dashboard");
          }
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        console.log("Getting session:", currentSession?.user?.email);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // If user is already logged in, redirect to dashboard
        if (currentSession?.user) {
          // Only redirect to dashboard if not already on an authenticated page
          const currentPath = window.location.pathname;
           if (currentPath === "/" || currentPath === "/auth" || currentPath.startsWith("/auth?")) {
            navigate("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error getting session:", error);
        toast({
          title: "Authentication Error",
          description: "There was an error loading your profile.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signUp = async (email: string, password: string, userData?: {
    full_name?: string;
    business_name?: string;
  }) => {
    setIsLoading(true);
    console.log("Attempting signup with:", email);
    try {
      const response = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: window.location.origin + "/auth?confirmation=true",
        }
      });
      console.log("Signup response:", response);
      
      return response;
    } catch (error) {
      console.error("Signup error caught:", error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    console.log("Attempting signin with:", email);
    try {
      const response = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log("Signin response:", response);
      
      // Handle email confirmation issues
      if (response.error && response.error.message.includes("Email not confirmed")) {
        return { 
          data: null, 
          error: response.error,
          requiresEmailConfirmation: true
        };
      }
      
      return response;
    } catch (error) {
      console.error("Signin error caught:", error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const response = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + "/auth?reset=true",
      });
      return response;
    } catch (error) {
      console.error("Forgot password error caught:", error);
      return { data: null, error };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signUp,
    signIn,
    signOut,
    forgotPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
