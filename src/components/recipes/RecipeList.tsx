import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge"; // Assuming you have a Badge component

// Assuming recipe_categories might be an array from a join, but we only care about the first one or it's a direct object.
// If it's an array and you want to display multiple, the rendering logic would need to change.
interface RecipeCategory {
  name: string;
}

interface Recipe {
  id: string;
  title: string;
  description?: string;
  instructions?: string;
  category_id?: string;
  recipe_categories: RecipeCategory | RecipeCategory[] | null; // Can be single, array, or null
  created_at: string;
}

const RecipeList = () => {
  const { user } = useAuth();
  const { data: recipes, isLoading, error } = useQuery<Recipe[], Error>({ // Added Error type for useQuery
    queryKey: ['recipes', user?.id],
    queryFn: async (): Promise<Recipe[]> => {
      if (!user) return [];
      const { data, error: queryError } = await supabase
        .from('recipes')
        .select(`
          id,
          title,
          description,
          created_at,
          recipe_categories (name) 
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (queryError) throw queryError;
      // Ensure the fetched data conforms to the Recipe interface, especially recipe_categories
      const typedData = data?.map(item => ({
        ...item,
        recipe_categories: Array.isArray(item.recipe_categories) ? item.recipe_categories[0] : item.recipe_categories,
      })) as Recipe[];
      return typedData || [];
    },
    enabled: !!user,
  });

  if (isLoading) return <p>Loading recipes...</p>;
  if (error) return <p>Error loading recipes: {error.message}</p>;
  if (!recipes || recipes.length === 0) return <p>No recipes found. Add your first recipe!</p>;

  return (
    <div className="space-y-4">
      {recipes.map((recipe) => (
        <Card key={recipe.id}>
          <CardHeader>
            <CardTitle>{recipe.title}</CardTitle>
            {recipe.recipe_categories && (typeof recipe.recipe_categories === 'object' && !Array.isArray(recipe.recipe_categories)) && recipe.recipe_categories.name && (
              <Badge variant="outline" className="w-fit">{recipe.recipe_categories.name}</Badge>
            )}
          </CardHeader>
          <CardContent>
            {recipe.description && <p className="text-sm text-muted-foreground mb-2">{recipe.description}</p>}
            <p className="text-xs text-gray-500">Created: {new Date(recipe.created_at).toLocaleDateString()}</p>
            {/* Add view/edit/delete buttons here if needed */}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecipeList;
