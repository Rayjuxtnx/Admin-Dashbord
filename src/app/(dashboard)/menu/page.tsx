
import { Button } from "@/components/ui/button";
import { Download, QrCode as QrCodeIcon, ChevronsUpDown } from "lucide-react";
import MenuItemCard from "@/components/MenuItemCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import QrCode from "@/components/QrCode";
import { Input } from "@/components/ui/input";
import { MenuItem } from "@/lib/menuData";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getMenuItems } from "@/app/admin/actions";
import MenuClient from "./MenuClient";


const formatCategoryTitle = (title: string) => {
    if (!title) return "Uncategorized";
    return title
        .replace(/([A-Z])/g, ' $1') // Add space before uppercase letters
        .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
        .trim();
}

const MenuPage = async () => {
    const menuItems = await getMenuItems();
    
    const menuCategoriesList = Object.entries(menuItems.reduce((acc, item) => {
        const category = item.category || 'Uncategorized';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(item);
        return acc;
    }, {} as Record<string, MenuItem[]>))
    .map(([title, items]) => ({ title, items }))
    .sort((a, b) => a.title.localeCompare(b.title));

  return (
    <div className="bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">Our Menu</h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            A culinary journey through Kenya's finest flavors and international favorites.
            All prices are inclusive of VAT.
          </p>
        </div>

        <MenuClient menuCategoriesList={menuCategoriesList} />
        
      </div>
    </div>
  );
};

export default MenuPage;
