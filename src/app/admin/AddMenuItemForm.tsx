
"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useMenuStore } from "@/lib/menuStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, PlusCircle } from "lucide-react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import type { MenuItem } from "@/lib/menuData";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long."),
  price: z.string().min(1, "Price is required."),
  description: z.string().optional(),
  category: z.string().min(2, "Category is required."),
  image: z.string().url("Must be a valid URL.").optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;
type AddMenuItemData = Omit<MenuItem, 'id' | 'slug'>;

const AddMenuItemForm = () => {
    const { toast } = useToast();
    const { addMenuItem } = useMenuStore();
    
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            price: "",
            description: "",
            category: "Uncategorized",
            image: "",
        },
    });

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            await addMenuItem(data as AddMenuItemData);
            toast({
                title: "Item Added!",
                description: `${data.name} has been successfully added to the menu.`,
            });
            form.reset();
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: "Failed to add item",
                description: e.message || 'An error occurred while adding the item.',
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Add New Menu Item</CardTitle>
                <CardDescription>Create a new dish to add to your restaurant's menu.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Samosa" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Ksh 250" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Describe the dish..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Appetizers" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="image"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://example.com/image.png" {...field} />
                                        </FormControl>
                                        <FormDescription>
                                            You can use a service like <a href="https://picsum.photos/" target="_blank" rel="noopener noreferrer" className="underline">picsum.photos</a> for placeholder images.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
                                </>
                            ) : (
                                 <>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add Item to Menu
                                </>
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default AddMenuItemForm;
