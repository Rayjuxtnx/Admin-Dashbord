import Image from "next/image"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MoreVertical, PlusCircle, FilePenLine, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const menuItems = [
  {
    name: "Grilled Salmon",
    price: "KES 1850",
    description: "Fresh salmon fillet grilled to perfection, served with asparagus and lemon butter sauce.",
    image: "https://picsum.photos/600/400?random=1",
    dataAiHint: "grilled salmon"
  },
  {
    name: "Wagyu Burger",
    price: "KES 2200",
    description: "Premium Wagyu beef patty with truffle aioli, caramelized onions, and aged cheddar.",
    image: "https://picsum.photos/600/400?random=2",
    dataAiHint: "gourmet burger"
  },
  {
    name: "Truffle Pasta",
    price: "KES 1600",
    description: "Homemade pasta in a creamy truffle sauce, topped with fresh parmesan.",
    image: "https://picsum.photos/600/400?random=3",
    dataAiHint: "truffle pasta"
  },
  {
    name: "Chicken Alfredo",
    price: "KES 1450",
    description: "Classic creamy alfredo with grilled chicken breast and fettuccine.",
    image: "https://picsum.photos/600/400?random=4",
    dataAiHint: "chicken alfredo"
  },
    {
    name: "Margherita Pizza",
    price: "KES 1200",
    description: "Traditional pizza with fresh mozzarella, San Marzano tomatoes, and basil.",
    image: "https://picsum.photos/600/400?random=5",
    dataAiHint: "margherita pizza"
  },
  {
    name: "Caesar Salad",
    price: "KES 950",
    description: "Crisp romaine lettuce, croutons, parmesan cheese, and classic Caesar dressing.",
    image: "https://picsum.photos/600/400?random=6",
    dataAiHint: "caesar salad"
  },
]

export default function MenuPage() {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold font-headline tracking-tight">
            Menu Management
            </h1>
            <p className="text-muted-foreground">
            Add, edit, or delete items from your restaurant's menu.
            </p>
        </div>
        <Sheet>
            <SheetTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
                </Button>
            </SheetTrigger>
            <MenuFormSheet />
        </Sheet>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {menuItems.map((item) => (
          <Card key={item.name} className="flex flex-col overflow-hidden">
            <CardHeader className="relative p-0">
                <Image
                    src={item.image}
                    alt={item.name}
                    width={600}
                    height={400}
                    className="aspect-video w-full object-cover"
                    data-ai-hint={item.dataAiHint}
                />
                 <div className="absolute right-2 top-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <FilePenLine className="mr-2 h-4 w-4" />Edit Item
                                    </DropdownMenuItem>
                                </SheetTrigger>
                                <MenuFormSheet item={item} />
                            </Sheet>
                            <DropdownMenuItem className="text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" />Delete Item
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="flex-1 p-4">
              <CardTitle className="mb-1 text-lg font-headline">{item.name}</CardTitle>
              <CardDescription>{item.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 pt-0">
              <p className="font-semibold text-primary">{item.price}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


function MenuFormSheet({ item }: { item?: typeof menuItems[0] }) {
    return (
        <SheetContent className="sm:max-w-lg">
            <SheetHeader>
                <SheetTitle className="font-headline">{item ? "Edit Menu Item" : "Add New Menu Item"}</SheetTitle>
                <SheetDescription>
                    {item ? "Update the details for this menu item." : "Fill out the form to add a new item to your menu."}
                </SheetDescription>
            </SheetHeader>
            <form className="grid gap-4 py-8">
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" defaultValue={item?.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" defaultValue={item?.price} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" defaultValue={item?.description} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="picture">Picture</Label>
                    <Input id="picture" type="file" />
                </div>
                <Button type="submit" className="mt-4">{item ? "Save Changes" : "Create Item"}</Button>
            </form>
        </SheetContent>
    )
}
