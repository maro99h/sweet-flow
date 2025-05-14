
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, CheckCircle, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Enhanced email regex for better validation
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Enhanced password regex for security requirements
const passwordRegex = /^(?=.*[0-9])(?=.*[a-zA-Z])[a-zA-Z0-9!@#$%^&*]{8,}$/;

const loginSchema = z.object({
  email: z.string()
    .email("Please enter a valid email address")
    .regex(emailRegex, "Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  fullName: z.string().min(2, "Please enter your full name"),
  businessName: z.string().min(2, "Please enter your business name"),
  email: z.string()
    .email("Please enter a valid email address")
    .regex(emailRegex, "Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      passwordRegex,
      "Password must include at least one number and one letter"
    ),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEmailConfirmationPending, setIsEmailConfirmationPending] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const { signIn, signUp, forgotPassword, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for email confirmation in URL
    const queryParams = new URLSearchParams(location.search);
    const hasConfirmation = queryParams.get("confirmation") === "true";
    const hasReset = queryParams.get("reset") === "true";
    
    if (hasConfirmation) {
      setSuccessMsg("Your email has been verified! You can now log in.");
      setMode("login");
    }
    
    if (hasReset) {
      setSuccessMsg("You can now reset your password.");
      setMode("login");
    }
    
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate, location]);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      businessName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Enable real-time validation
  });

  const forgotPasswordForm = useForm({
    resolver: zodResolver(
      z.object({
        email: z.string().email("Please enter a valid email address"),
      })
    ),
    defaultValues: {
      email: "",
    },
  });

  // Reset forms and errors when switching modes
  useEffect(() => {
    setServerError(null);
    setSuccessMsg(null);
    setIsEmailConfirmationPending(false);
    setIsForgotPassword(false);
    
    if (mode === "login") {
      loginForm.reset();
    } else {
      registerForm.reset();
    }
  }, [mode, loginForm, registerForm]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    setServerError(null);
    try {
      const { error, data: authData, requiresEmailConfirmation } = await signIn(data.email, data.password);
      
      if (error) {
        console.error("Login error:", error);
        if (error.message.includes("Invalid login")) {
          setServerError("Email or password is incorrect. Please try again.");
        } else if (error.message.includes("Email not confirmed") || requiresEmailConfirmation) {
          setServerError("Please verify your email before logging in.");
          setIsEmailConfirmationPending(true);
        } else {
          setServerError(error.message || "An error occurred during login.");
        }
        return;
      }
      
      if (authData?.user) {
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      console.error("Unexpected login error:", error);
      setServerError(error.message || "An unexpected error occurred.");
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setServerError(null);
    try {
      const { error, data: authData } = await signUp(
        data.email, 
        data.password,
        {
          full_name: data.fullName,
          business_name: data.businessName,
        }
      );
      
      if (error) {
        console.error("Signup error:", error);
        if (error.message.includes("already registered")) {
          setServerError("Email is already registered. Try logging in instead.");
        } else {
          setServerError(error.message || "An error occurred during registration.");
        }
        return;
      }
      
      setSuccessMsg("Registration successful! Please check your email for verification.");
      setIsEmailConfirmationPending(true);
      toast({
        title: "Registration successful!",
        description: "Please check your email to verify your account.",
      });
      
      // Switch to login mode after successful registration
      setTimeout(() => {
        setMode("login");
      }, 3000);
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      setServerError(error.message || "An unexpected error occurred.");
    }
  };

  const onForgotPasswordSubmit = async (data: { email: string }) => {
    setServerError(null);
    try {
      const { error } = await forgotPassword(data.email);
      
      if (error) {
        setServerError(error.message || "An error occurred. Please try again.");
        return;
      }
      
      setSuccessMsg("Password reset instructions have been sent to your email.");
      setIsForgotPassword(false);
      
      toast({
        title: "Password reset email sent",
        description: "Check your email for instructions to reset your password.",
      });
    } catch (error: any) {
      console.error("Forgot password error:", error);
      setServerError(error.message || "An unexpected error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FFE8D6]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-[#A47149] mb-6">
          {isForgotPassword 
            ? "Reset Password" 
            : mode === "login" 
              ? "Sign In" 
              : "Create Account"}
        </h1>
        
        {serverError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert variant="default" className="mb-6 bg-[#C4D6B0] text-white">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        {isEmailConfirmationPending && (
          <Alert className="mb-6 bg-[#f0f9ff] border-blue-200 text-blue-800">
            <Info className="h-4 w-4" />
            <AlertDescription>
              We've sent you an email to verify your account. Please check your inbox (including spam folder) and click on the verification link.
            </AlertDescription>
          </Alert>
        )}
        
        {isForgotPassword ? (
          <>
            <Form {...forgotPasswordForm}>
              <form onSubmit={forgotPasswordForm.handleSubmit(onForgotPasswordSubmit)} className="space-y-4">
                <FormField
                  control={forgotPasswordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          dir="ltr"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#A47149] hover:bg-[#8B5E3C]"
                  disabled={isLoading || forgotPasswordForm.formState.isSubmitting}
                >
                  {(isLoading || forgotPasswordForm.formState.isSubmitting) ? 
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : 
                    "Send Reset Instructions"}
                </Button>
                
                <div className="text-center mt-4">
                  <button 
                    type="button"
                    onClick={() => setIsForgotPassword(false)} 
                    className="text-[#A47149] font-medium hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </Form>
          </>
        ) : mode === "login" ? (
          <>
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          dir="ltr"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          autoComplete="current-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-sm text-[#A47149] hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#A47149] hover:bg-[#8B5E3C]"
                  disabled={isLoading || loginForm.formState.isSubmitting}
                >
                  {(isLoading || loginForm.formState.isSubmitting) ? 
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : 
                    "Sign In"}
                </Button>
              </form>
            </Form>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{" "}
                <button 
                  onClick={() => setMode("register")} 
                  className="text-[#A47149] font-medium hover:underline"
                >
                  Create Account
                </button>
              </p>
            </div>
          </>
        ) : (
          <>
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="John Smith"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your Business"
                          autoComplete="organization"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          dir="ltr"
                          placeholder="you@example.com"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs text-gray-500">
                        Password must be at least 8 characters and include both letters and numbers.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="********"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-[#A47149] hover:bg-[#8B5E3C]"
                  disabled={isLoading || registerForm.formState.isSubmitting}
                >
                  {(isLoading || registerForm.formState.isSubmitting) ? 
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</> : 
                    "Create Account"}
                </Button>
              </form>
            </Form>
            
            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <button 
                  onClick={() => setMode("login")} 
                  className="text-[#A47149] font-medium hover:underline"
                >
                  Sign In
                </button>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
