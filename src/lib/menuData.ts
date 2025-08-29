export type MenuItem = {
    slug: string;
    name: string;
    price: string;
    description: string;
    image: string;
    category: keyof MenuData;
};

export type MenuData = {
    tastyStarters: MenuItem[];
    mombasaStyleChapatis: MenuItem[];
    salads: MenuItem[];
    breakfast: MenuItem[];
    sandwichesAndMore: MenuItem[];
    chickenDishes: MenuItem[];
    beefAndMuttonDishes: MenuItem[];
    mixedGrillPlatters: MenuItem[];
    seafoodDishes: MenuItem[];
    specialTastyCurries: MenuItem[];
    vegetarianDishes: MenuItem[];
    kiddyMeals: MenuItem[];
    miniLunches: MenuItem[];
    soups: MenuItem[];
    tastyRiceDishes: MenuItem[];
    familyPacksDishes: MenuItem[];
    sharwamaSpecial: MenuItem[];
    tastySwahiliSideDishes: MenuItem[];
    drinks: MenuItem[];
    freshJuices: MenuItem[];
    milkshakes: MenuItem[];
    healthDrinks: MenuItem[];
    smoothies: MenuItem[];
};

export const menuData: MenuData = {
    tastyStarters: [],
    mombasaStyleChapatis: [],
    salads: [],
    breakfast: [],
    sandwichesAndMore: [],
    chickenDishes: [],
    beefAndMuttonDishes: [],
    mixedGrillPlatters: [],
    seafoodDishes: [],
    specialTastyCurries: [],
    vegetarianDishes: [],
    kiddyMeals: [],
    miniLunches: [],
    soups: [],
    tastyRiceDishes: [],
    familyPacksDishes: [],
    sharwamaSpecial: [],
    tastySwahiliSideDishes: [],
    drinks: [],
    freshJuices: [],
    milkshakes: [],
    healthDrinks: [],
    smoothies: [],
};
