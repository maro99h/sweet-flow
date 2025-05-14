
import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";

const RecipesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Recipe Management</h1>
          
          <Routes>
            <Route path="/" element={<RecipeLibrary />} />
            <Route path="/library" element={<RecipeLibrary />} />
            <Route path="/add" element={<AddRecipe />} />
            <Route path="/categories" element={<RecipeCategories />} />
            <Route path="/:id" element={<RecipeDetails />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

// Placeholder components for different recipe views
const RecipeLibrary = () => <div>Recipe Library (Coming soon)</div>;
const AddRecipe = () => <div>Add New Recipe Form (Coming soon)</div>;
const RecipeCategories = () => <div>Recipe Categories Management (Coming soon)</div>;
const RecipeDetails = () => <div>Recipe Details (Coming soon)</div>;

export default RecipesPage;
