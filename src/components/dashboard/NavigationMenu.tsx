import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { UsersIcon, BookIcon, SettingsIcon } from "lucide-react";

interface DashboardNavigationMenuProps {
  onOrdersClick: () => void;
  onAddOrderClick: () => void;
  onClientsClick: () => void;
  onAddClientClick: () => void;
  onRecipesClick: () => void;
  onAddRecipeClick: () => void;
}

const HoverDropdownMenu = ({
  triggerContent,
  children,
}: {
  triggerContent: React.ReactNode;
  children: React.ReactNode;
}) => {
  const [open, setOpen] = React.useState(false);
  let hoverTimeout: NodeJS.Timeout;

  const handleMouseEnter = () => {
    clearTimeout(hoverTimeout);
    setOpen(true);
  };

  // This duplicate handleMouseEnter was causing the error. Removed it.

  const handleMouseLeave = () => {
    hoverTimeout = setTimeout(() => {
      setOpen(false);
    }, 150); // Adjust delay as needed
  };

  // When an item is clicked, we want to ensure the menu closes.
  // We can wrap the children (DropdownMenuItems) to add this behavior.
  const childrenWithCloseOnClick = React.Children.map(children, (child) => {
    if (React.isValidElement(child) && child.type === DropdownMenuItem) {
      return React.cloneElement(child, {
        // @ts-ignore
        onClick: (...args) => {
          // @ts-ignore
          if (child.props.onClick) {
            // @ts-ignore
            child.props.onClick(...args);
          }
          setOpen(false); // Explicitly close the dropdown
        },
      });
    }
    return child;
  });

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        asChild
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        // Removed onFocus and onBlur from trigger as hover should suffice
      >
        {triggerContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48"
        onMouseEnter={handleMouseEnter} // Keep open if mouse enters content
        onMouseLeave={handleMouseLeave} // Close if mouse leaves content
        // Removed onFocusCapture and onBlurCapture from content
      >
        {childrenWithCloseOnClick}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const DashboardNavigationMenu = ({
  onOrdersClick,
  onAddOrderClick,
  onClientsClick,
  onAddClientClick,
  onRecipesClick,
  onAddRecipeClick,
}: DashboardNavigationMenuProps) => (
  <div className="mb-8 flex space-x-2">
    {/* Orders Dropdown */}
    {/* Orders Dropdown */}
    <HoverDropdownMenu triggerContent={<Button variant="outline" className="bg-brand-peach text-brand-brown-dark border-brand-brown hover:bg-brand-coral hover:text-white hover:border-brand-coral">Orders</Button>}>
      <DropdownMenuItem onClick={onOrdersClick}>Show Orders</DropdownMenuItem>
      <DropdownMenuItem onClick={onAddOrderClick}>Add New Order</DropdownMenuItem>
    </HoverDropdownMenu>

    {/* Clients Dropdown */}
    <HoverDropdownMenu
      triggerContent={
        <Button variant="outline" className="bg-brand-peach text-brand-brown-dark border-brand-brown hover:bg-brand-coral hover:text-white hover:border-brand-coral">
          <UsersIcon className="mr-2 h-4 w-4" /> Clients
        </Button>
      }
    >
      <DropdownMenuItem onClick={onClientsClick}>Show Clients</DropdownMenuItem>
      <DropdownMenuItem onClick={onAddClientClick}>Add New Client</DropdownMenuItem>
    </HoverDropdownMenu>

    {/* Recipes Dropdown */}
    <HoverDropdownMenu
      triggerContent={
        <Button variant="outline" className="bg-brand-peach text-brand-brown-dark border-brand-brown hover:bg-brand-coral hover:text-white hover:border-brand-coral">
          <BookIcon className="mr-2 h-4 w-4" /> Recipes
        </Button>
      }
    >
      <DropdownMenuItem onClick={onRecipesClick}>Show Recipes</DropdownMenuItem>
      <DropdownMenuItem onClick={onAddRecipeClick}>Add New Recipe</DropdownMenuItem>
    </HoverDropdownMenu>

    {/* Settings Button */}
    <Button variant="outline" className="bg-brand-peach text-brand-brown-dark border-brand-brown hover:bg-brand-coral hover:text-white hover:border-brand-coral" asChild>
      <a href="/settings" className="flex items-center">
        <SettingsIcon className="mr-2 h-5 w-5" /> Settings
      </a>
    </Button>
  </div>
);

export default DashboardNavigationMenu;
