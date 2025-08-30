import { MenuItem } from "@/lib/menuData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";

const MenuItemCard = ({ name, price, description, image }: MenuItem) => {
  // Ensure the image URL is clean and valid
  const imageUrl = image?.trim();

  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {imageUrl && (
        <div className="relative w-full">
            <Image 
                src={imageUrl} 
                alt={name}
                width={600}
                height={400}
                className="w-full h-auto object-contain"
                unoptimized
            />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-xl font-headline">{name}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col">
        {description && <CardDescription className="flex-grow">{description}</CardDescription>}
        <p className="mt-4 font-semibold text-lg text-primary">{price}</p>
      </CardContent>
    </Card>
  );
};

export default MenuItemCard;
