
export type MenuItem = {
    id: string; 
    slug: string;
    name: string;
    price: string;
    description: string;
    image: string;
    category: string; 
};

// This type is now mainly for reference, as the full menu is in the DB.
export type MenuCategory = {
    title: string;
    items: MenuItem[];
};


// This static data is no longer the source of truth for the menu, 
// but can be kept for reference or as a fallback.
// The primary source is now the Supabase 'menu_items' table.
export const menuData: MenuCategory[] = [];


export const getAllMenuItems = (): MenuItem[] => {
    return menuData.flatMap(category => category.items);
}

export const getTotalMenuItems = () => {
    return menuData.reduce((total, category) => total + category.items.length, 0);
};

