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
import { MoreVertical, PlusCircle, FilePenLine, Trash2, Loader2 } from "lucide-react"
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
} from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabase"
import { useState, useEffect, useTransition } from "react"
import { getMenuItems, deleteMenuItem, upsertMenuItem } from "./actions"
import { cn } from "@/lib/utils"


export type MenuItem = {
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
    const [isPending, startTransition] = useTransition();

    const fetchMenuItems = async () => {
        // const data = await getMenuItems();
        // setMenuItems(data as MenuItem[]);
    };

    useEffect(() => {
        fetchMenuItems();
        // const channel = supabase
        //     .channel('realtime menu_items')
        //     .on(
        //         'postgres_changes',
        //         { event: '*', schema: 'public', table: 'menu_items' },
        //         () => fetchMenuItems()
        //     )
        //     .subscribe();

        // return () => {
        //     supabase.removeChannel(channel);
        // };
    }, []);

    const handleDelete = async (id: string) => {
       startTransition(async () => {
           await deleteMenuItem(id);
       })
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
      
      {menuItems.length === 0 && (
          <Card className="flex items-center justify-center min-h-[300px]">
              <CardContent className="text-center">
                  <p className="text-muted-foreground">No menu items found.</p>
                  <p className="text-sm text-muted-foreground">Click "Add New Item" to get started.</p>
              </CardContent>
          </Card>
      )}

      <div className={cn("grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4", isPending && "opacity-50")}>
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
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full bg-background/70 backdrop-blur-sm" disabled={isPending}>
                               {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
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
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        startTransition(async () => {
            const formData = new FormData(event.currentTarget);
            await upsertMenuItem(formData, item?.id);
            closeSheet();
        });
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
                    <Input id="name" name="name" defaultValue={item?.name} disabled={isPending} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" name="price" defaultValue={item?.price} disabled={isPending} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={item?.description} disabled={isPending} />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="picture">Picture</Label>
                    <Input id="picture" name="picture" type="file" disabled={isPending} />
                </div>
                <Button type="submit" className="mt-4" disabled={isPending}>
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    {item ? "Save Changes" : "Create Item"}
                </Button>
            </form>
        </SheetContent>
    )
}
