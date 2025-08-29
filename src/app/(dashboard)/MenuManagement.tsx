
"use client";

import { MenuItem } from "@/lib/menuData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Image as ImageIcon, PlusCircle } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMenuStore } from "@/lib/menuStore";
import { Skeleton } from "@/components/ui/skeleton";

const MenuManagement = () => {
    const { toast } = useToast();
    const { menuItems, isLoading, error, fetchMenuItems, addMenuItem, updateMenuItem, removeMenuItem } = useMenuStore();
    
    const [selectedItem, setSelectedItem] = useState<Partial<MenuItem> | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        // The store fetches automatically, but we can re-fetch if needed.
        fetchMenuItems();
    }, [fetchMenuItems]);

    const handleEditClick = (item: MenuItem) => {
        setSelectedItem({...item});
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (item: MenuItem) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };
    
    const handleAddClick = () => {
        setSelectedItem({
            id: `new-${Date.now()}`, // Temporary ID
            slug: '',
            name: '',
            price: '',
            description: '',
            image: `https://picsum.photos/200/200?random=${Math.random()}`,
            category: 'Uncategorized'
        });
        setIsEditDialogOpen(true);
    }

    const handleSaveChanges = async () => {
        if (!selectedItem) return;

        const action = selectedItem.id && menuItems.some(item => item.id === selectedItem.id) ? 'update' : 'add';
        const promise = action === 'update' ? updateMenuItem(selectedItem as MenuItem) : addMenuItem(selectedItem as Omit<MenuItem, 'id' | 'slug'>);

        try {
            await promise;
            toast({
                title: `Item ${action === 'update' ? 'Updated' : 'Added'}`,
                description: `${selectedItem.name} has been successfully saved.`,
            });
            setIsEditDialogOpen(false);
            setSelectedItem(null);
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: `Failed to ${action} item`,
                description: e.message || 'An error occurred.',
            });
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedItem || !selectedItem.id) return;

        try {
            await removeMenuItem(selectedItem.id);
            toast({
                title: "Item Deleted",
                description: `${selectedItem.name} has been removed from the menu.`,
            });
            setIsDeleteDialogOpen(false);
            setSelectedItem(null);
        } catch (e: any) {
             toast({
                variant: 'destructive',
                title: "Failed to delete item",
                description: e.message || 'An error occurred.',
            });
        }
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Menu Items</CardTitle>
                        <CardDescription>Manage your restaurant's menu. Changes will be saved to the database.</CardDescription>
                    </div>
                     <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add New Item
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                         <div className="space-y-4">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                         </div>
                    ) : error ? (
                        <p className="text-destructive text-center">{error}</p>
                    ): (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {menuItems.map((item) => (
                                <TableRow key={item.id}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={item.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={item.image || 'https://picsum.photos/64'}
                                            width="64"
                                            unoptimized
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.price}</TableCell>
                                    <TableCell className="hidden md:table-cell max-w-xs truncate">{item.description}</TableCell>
                                    <TableCell className="hidden md:table-cell">{item.category}</TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onSelect={() => handleEditClick(item)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDeleteClick(item)} className="text-destructive focus:text-destructive">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit/Add Item Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedItem?.id?.toString().startsWith('new-') ? 'Add' : 'Edit'}: {selectedItem?.name || 'New Item'}</DialogTitle>
                        <DialogDescription>Make changes to this menu item. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" value={selectedItem?.name || ''} onChange={(e) => setSelectedItem(prev => prev ? {...prev, name: e.target.value} : null)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">Price</Label>
                            <Input id="price" value={selectedItem?.price || ''} onChange={(e) => setSelectedItem(prev => prev ? {...prev, price: e.target.value} : null)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">Description</Label>
                            <Textarea id="description" value={selectedItem?.description || ''} onChange={(e) => setSelectedItem(prev => prev ? {...prev, description: e.target.value} : null)} className="col-span-3" />
                        </div>
                         <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="category" className="text-right">Category</Label>
                            <Input id="category" value={selectedItem?.category || ''} onChange={(e) => setSelectedItem(prev => prev ? {...prev, category: e.target.value} : null)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="image" className="text-right">Image URL</Label>
                            <Input id="image" value={selectedItem?.image || ''} onChange={(e) => setSelectedItem(prev => prev ? {...prev, image: e.target.value} : null)} className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleSaveChanges}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Are you sure you want to delete this item?</DialogTitle>
                        <DialogDescription>
                           This action cannot be undone. This will permanently delete the item from the database: <span className="font-semibold text-foreground">{selectedItem?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>Yes, Delete Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default MenuManagement;
