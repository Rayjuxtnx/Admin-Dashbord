
export type MenuItem = {
    slug: string;
    name: string;
    price: string;
    description: string;
    image: string;
};

export type MenuCategory = {
    title: string;
    items: MenuItem[];
};

export const menuData: MenuCategory[] = [
    { 
        title: "Breakfast", 
        items: [
            { slug: "spanish-omelette", name: "Spanish Omelette", price: "Ksh 450", description: "Served with toast, sausages, and salad.", image: "https://picsum.photos/400/300?random=1" },
            { slug: "egg-benedict", name: "Egg Benedict", price: "Ksh 650", description: "Served with toast, sausages, and salad.", image: "https://picsum.photos/400/300?random=2" },
        ] 
    },
    { 
        title: "Soups", 
        items: [
            { slug: "chicken-soup", name: "Chicken Soup", price: "Ksh 400", description: "Clear chicken broth with vegetables.", image: "https://picsum.photos/400/300?random=3" },
            { slug: "tomato-soup", name: "Tomato Soup", price: "Ksh 350", description: "Creamy tomato soup with a hint of basil.", image: "https://picsum.photos/400/300?random=4" },
        ] 
    },
     { 
        title: "Tasty Starters", 
        items: [
            { slug: "samosa", name: "Samosa", price: "Ksh 150", description: "Crispy pastry filled with spiced vegetables or meat.", image: "https://picsum.photos/400/300?random=5" },
            { slug: "spring-rolls", name: "Spring Rolls", price: "Ksh 200", description: "Golden fried rolls with a vegetable filling.", image: "https://picsum.photos/400/300?random=6" },
        ] 
    },
    { 
        title: "Salads", 
        items: [
            { slug: "chicken-salad", name: "Chicken Salad", price: "Ksh 550", description: "Grilled chicken strips on a bed of fresh greens.", image: "https://picsum.photos/400/300?random=7" },
            { slug: "garden-salad", name: "Garden Salad", price: "Ksh 450", description: "A mix of fresh seasonal vegetables.", image: "https://picsum.photos/400/300?random=8" },
        ] 
    },
    // Add all other categories and items here...
];

export const getTotalMenuItems = () => {
    return menuData.reduce((total, category) => total + category.items.length, 0);
};
