import { MenuItem } from "@/lib/menuData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const MenuItemCard = ({ name, price, description }: MenuItem) => {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-headline">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-muted-foreground">{description}</p>
        <p className="mt-4 font-semibold text-lg text-primary">{price}</p>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;
