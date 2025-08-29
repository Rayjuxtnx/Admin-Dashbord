export type MenuItem = {
    slug: string;
    name: string;
    price: string;
    description: string;
    image: string;
    dataAiHint: string;
}

export const menuData: MenuItem[] = [
    {
        slug: "classic-beef-burger",
        name: "Classic Beef Burger",
        price: "KES 1,200",
        description: "A juicy beef patty with fresh lettuce, tomatoes, and our special sauce.",
        image: "https://picsum.photos/seed/burger/600/400",
        dataAiHint: "beef burger"
    },
    {
        slug: "margherita-pizza",
        name: "Margherita Pizza",
        price: "KES 1,500",
        description: "Classic pizza with tomato sauce, mozzarella, and fresh basil.",
        image: "https://picsum.photos/seed/pizza/600/400",
        dataAiHint: "pizza"
    },
    {
        slug: "chicken-alfredo",
        name: "Chicken Alfredo",
        price: "KES 1,800",
        description: "Creamy Alfredo sauce with grilled chicken and fettuccine pasta.",
        image: "https://picsum.photos/seed/pasta/600/400",
        dataAiHint: "pasta dish"
    },
    {
        slug: "chocolate-lava-cake",
        name: "Chocolate Lava Cake",
        price: "KES 800",
        description: "Warm chocolate cake with a gooey molten center, served with ice cream.",
        image: "https://picsum.photos/seed/cake/600/400",
        dataAiHint: "chocolate cake"
    },
];
