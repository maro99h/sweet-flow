
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { Loader2 } from "lucide-react";

type BusinessProfile = {
  id: string;
  full_name: string;
  business_name: string;
  phone?: string;
  email?: string;
  business_logo?: string;
  language?: string;
  currency?: string;
  enable_daily_reminders?: boolean;
  enable_payment_alerts?: boolean;
}

const defaultProfile: Partial<BusinessProfile> = {
  full_name: "",
  business_name: "",
  phone: "",
  language: "en",
  currency: "ILS",
  enable_daily_reminders: false,
  enable_payment_alerts: false,
};

const SettingsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("business");
  // const [profile, setProfile] = useState<BusinessProfile | null>(null); // Profile state can be removed or managed differently
  
  const { register, handleSubmit, setValue, watch, formState: { isDirty, isSubmitting }, reset } = useForm<BusinessProfile>({
    defaultValues: defaultProfile, // Initialize with defaultProfile
  });
  
  // Optionally, fetch existing profile data if user is available, but don't block rendering
  useEffect(() => {
    const loadProfileData = async () => {
      if (user) {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setLoading(false);
        if (data) {
          reset(data); // Reset form with fetched data
        } else if (error && error.code !== 'PGRST116') {
          console.error('Error fetching profile for settings form:', error);
          toast({ title: "Error", description: "Could not load existing settings.", variant: "destructive" });
        }
      }
    };
    loadProfileData();
  }, [user, reset, toast]);

  // Handle form submission
  const onSubmit = async (formData: BusinessProfile) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Update profile in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          business_name: formData.business_name,
          phone: formData.phone,
          language: formData.language,
          currency: formData.currency,
          enable_daily_reminders: formData.enable_daily_reminders,
          enable_payment_alerts: formData.enable_payment_alerts,
        })
        .eq('id', user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Settings updated",
        description: "Your settings have been saved successfully",
      });
      
      // Optionally, reset the form with new data if needed, or just rely on next fetch
      reset(formData); 
      
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "There was an error saving your settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user || !window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete user account
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Account deleted",
        description: "Your account has been successfully deleted",
      });
      
      // Sign out user
      await supabase.auth.signOut();
      navigate("/");
      
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "There was an error deleting your account",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Show loading state (simplified)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header showBackButton={true} />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex justify-center items-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary mb-4" />
            <p>Loading settings...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-gray-500">Manage your business settings and preferences</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6 grid grid-cols-3 w-full">
            <TabsTrigger value="business">Business Information</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <TabsContent value="business" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Business Information</CardTitle>
                  <CardDescription>Manage your business details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="business_name">Business Name</Label>
                    <Input 
                      id="business_name" 
                      placeholder="Your Business Name" 
                      {...register("business_name", { required: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Owner Full Name</Label>
                    <Input 
                      id="full_name" 
                      placeholder="Your Full Name" 
                      {...register("full_name", { required: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={user?.email || ''} 
                      disabled 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (optional)</Label>
                    <Input 
                      id="phone" 
                      placeholder="+972 123 456 7890" 
                      {...register("phone")}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Customize your SweetFlow experience</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="language">Interface Language</Label>
                    <Select 
                      onValueChange={(value) => setValue("language", value)}
                      defaultValue={watch("language") || "en"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="he">Hebrew</SelectItem>
                        <SelectItem value="ar">Arabic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <Select 
                      onValueChange={(value) => setValue("currency", value)}
                      defaultValue={watch("currency") || "ILS"}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ILS">ILS ₪</SelectItem>
                        <SelectItem value="USD">USD $</SelectItem>
                        <SelectItem value="EUR">EUR €</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <h3 className="font-medium">Notification Preferences</h3>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="daily-reminders" 
                        checked={watch("enable_daily_reminders")}
                        onCheckedChange={(checked) => setValue("enable_daily_reminders", !!checked)}
                      />
                      <Label htmlFor="daily-reminders">Enable daily reminders</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="payment-alerts" 
                        checked={watch("enable_payment_alerts")}
                        onCheckedChange={(checked) => setValue("enable_payment_alerts", !!checked)}
                      />
                      <Label htmlFor="payment-alerts">Enable payment alerts</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account settings and security</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Button variant="outline" className="w-full" onClick={() => navigate("/reset-password")}>
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h3 className="text-red-600 font-medium mb-2">Danger Zone</h3>
                    <p className="text-sm text-gray-500 mb-4">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <Button 
                      variant="destructive" 
                      type="button"
                      onClick={handleDeleteAccount} 
                      disabled={loading}
                    >
                      Delete My Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <div className="flex justify-end mt-6">
              <Button 
                type="submit" 
                disabled={!isDirty || isSubmitting || loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Tabs>
      </main>
    </div>
  );
};

export default SettingsPage;
