'use client'

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
import { supabase } from "@/lib/supabase"
import { useState, useEffect } from "react"

type MenuItem = {
    id: string;
    name: string;
    price: string;
    description: string;
    image: string;
    dataAiHint: string;
}

export default function MenuPage() {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedItem, setSelectedItem] = useState<MenuItem | undefined>(undefined);
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const fetchMenuItems = async () => {
        const { data, error } = await supabase.from('menu_items').select('*');
        if (error) {
            console.error("Error fetching menu items:", error);
        } else {
            setMenuItems(data as MenuItem[]);
        }
    };

    useEffect(() => {
        fetchMenuItems();
        const channel = supabase
            .channel('realtime menu_items')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'menu_items' },
                () => fetchMenuItems()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('menu_items').delete().eq('id', id);
        if (error) {
            console.error("Error deleting item:", error);
        }
    };

    const openSheetForNew = () => {
        setSelectedItem(undefined);
        setIsSheetOpen(true);
    };

    const openSheetForEdit = (item: MenuItem) => {
        setSelectedItem(item);
        setIsSheetOpen(true);
    };

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
        <Button onClick={openSheetForNew}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {menuItems.map((item) => (
          <Card key={item.id} className="flex flex-col overflow-hidden">
            <CardHeader className="relative p-0">
                <Image
                    src={item.image || 'https://picsum.photos/600/400'}
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
                            <DropdownMenuItem onSelect={() => openSheetForEdit(item)}>
                                <FilePenLine className="mr-2 h-4 w-4" />Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => item.id && handleDelete(item.id)}>
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
       <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <MenuFormSheet item={selectedItem} closeSheet={() => setIsSheetOpen(false)} />
       </Sheet>
    </div>
  )
}


function MenuFormSheet({ item, closeSheet }: { item?: MenuItem, closeSheet: () => void }) {
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const name = formData.get('name') as string;
        const price = formData.get('price') as string;
        const description = formData.get('description') as string;

        const record = { name, price, description };

        if (item?.id) {
            // Update
            const { error } = await supabase.from('menu_items').update(record).eq('id', item.id);
            if (error) console.error("Error updating item:", error);
        } else {
            // Create
            const { error } = await supabase.from('menu_items').insert(record);
            if (error) console.error("Error creating item:", error);
        }
        closeSheet();
    };

    return (
        <SheetContent className="sm:max-w-lg">
            <SheetHeader>
                <SheetTitle className="font-headline">{item ? "Edit Menu Item" : "Add New Menu Item"}</SheetTitle>
                <SheetDescription>
                    {item ? "Update the details for this menu item." : "Fill out the form to add a new item to your menu."}
                </SheetDescription>
            </SheetHeader>
            <form className="grid gap-4 py-8" onSubmit={handleSubmit}>
                <div className="grid gap-2">
                    <Label htmlFor="name">Name</Label>
                    <Input id="name" name="name" defaultValue={item?.name} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" defaultValue={item?.price} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={item?.description} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="picture">Picture</Label>
                    <Input id="picture" name="picture" type="file" />
                </div>
                <Button type="submit" className="mt-4">{item ? "Save Changes" : "Create Item"}</Button>
            </form>
        </SheetContent>
    )
}
