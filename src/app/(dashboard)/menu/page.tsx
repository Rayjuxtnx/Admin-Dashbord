
import { getMenuItems } from "@/app/admin/actions";
import MenuClient from "./MenuClient";
import { MenuItem } from "@/lib/menuData";

export const dynamic = 'force-dynamic';

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
