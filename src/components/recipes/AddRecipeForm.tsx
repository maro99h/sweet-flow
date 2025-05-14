import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DialogTitle, DialogDescription, DialogHeader, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const recipeSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  category_id: z.string().uuid("Please select a category").optional(),
  description: z.string().optional(),
  instructions: z.string().min(10, "Instructions must be at least 10 characters"),
});

type RecipeFormValues = z.infer<typeof recipeSchema>;

interface RecipeCategory {
  id: string;
  name: string;
}

interface AddRecipeFormProps {
  onSuccess?: () => void;
}

const AddRecipeForm = ({ onSuccess }: AddRecipeFormProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: categories, isLoading: isLoadingCategories } = useQuery<RecipeCategory[]>({
    queryKey: ['recipe_categories', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('recipe_categories')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name');
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      title: "",
      description: "",
      instructions: "",
    },
  });

  const onSubmit = async (data: RecipeFormValues) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('recipes').insert({
        user_id: user.id,
        title: data.title,
        category_id: data.category_id || null,
        description: data.description,
        instructions: data.instructions,
      });
      if (error) throw error;
      toast({ title: "Recipe Added", description: `${data.title} has been added.` });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['recipes'] });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add recipe.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Add New Recipe</DialogTitle>
        <DialogDescription>Fill in the details for your new recipe.</DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl><Input placeholder="e.g., Chocolate Cake" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="category_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category (Optional)</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoadingCategories}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={isLoadingCategories ? "Loading categories..." : "Select a category"} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (Optional)</FormLabel>
                <FormControl><Textarea placeholder="A short summary of the recipe" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="instructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Instructions</FormLabel>
                <FormControl><Textarea placeholder="Step 1..." {...field} rows={6} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Recipe"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
};

export default AddRecipeForm;
