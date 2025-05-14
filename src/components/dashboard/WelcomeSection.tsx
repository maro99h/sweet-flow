
import { useState, useEffect } from "react";

// Array of engaging bakery/confectionery-related messages
const welcomeMessages = [
  "Fresh ideas for your sweet creations today!",
  "Ready to create something delicious?",
  "Managing your bakery just got sweeter!",
  "Organize your recipes and delight your customers!",
  "Streamline your sweet business operations today!",
  "Let's bake success into your business!",
  "Your confectionery management just got easier!",
  "Whipping up organization for your bakery!",
  "Sweet success starts with good planning!",
  "Making your bakery business run as smooth as fondant!"
];

interface WelcomeSectionProps {
  userName?: string;
}

const WelcomeSection = ({ userName }: WelcomeSectionProps) => {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  
  useEffect(() => {
    // Select a random welcome message on page load
    const randomIndex = Math.floor(Math.random() * welcomeMessages.length);
    setWelcomeMessage(welcomeMessages[randomIndex]);
  }, []);

  // Use the user's name if available, otherwise use a default
  const displayName = userName || 'Baker';

  return (
    // Removed mb-6 as parent div now handles margin
    // Background color will be inherited or set by parent
    <div> 
      <h2 className="text-3xl font-extrabold text-brand-rust"> {/* Bolder, zesty color, larger */}
        Welcome, {displayName}!
      </h2>
      <p className="text-brand-brown-dark mt-2 text-xl"> {/* Larger, darker for readability */}
        {welcomeMessage}
      </p>
    </div>
  );
};

export default WelcomeSection;
