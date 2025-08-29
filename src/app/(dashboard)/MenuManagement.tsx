"use client";

import { MenuItem } from "@/lib/menuData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import MediaUploader from "./MediaUploader";
import { useMenuStore } from "@/lib/menuStore";

const MenuManagement = () => {
    const { toast } = useToast();
    const { menuItems, updateMenuItem, deleteMenuItem } = useMenuStore();
    const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isChangePictureOpen, setIsChangePictureOpen] = useState(false);

    // This effect handles hydration mismatch between server and client
    const [hydratedMenuItems, setHydratedMenuItems] = useState<MenuItem[]>([]);
    useEffect(() => {
        setHydratedMenuItems(menuItems);
    }, [menuItems]);


    const handleEditClick = (item: MenuItem) => {
        setSelectedItem({...item});
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (item: MenuItem) => {
        setSelectedItem(item);
        setIsDeleteDialogOpen(true);
    };
    
    const handleChangePictureClick = (item: MenuItem) => {
        setSelectedItem(item);
        setIsChangePictureOpen(true);
    }

    const handleSaveChanges = () => {
        if (!selectedItem) return;
        
        updateMenuItem(selectedItem);
        
        toast({
            title: "Item Updated",
            description: `${selectedItem.name} has been successfully updated.`,
        });
        setIsEditDialogOpen(false);
        setSelectedItem(null);
    };

    const handleDeleteConfirm = () => {
        if (!selectedItem) return;

        deleteMenuItem(selectedItem.slug);
        
        toast({
            title: "Item Deleted",
            description: `${selectedItem.name} has been removed from the menu.`,
        });
        setIsDeleteDialogOpen(false);
        setSelectedItem(null);
    };

    const handleImageUpload = (newImageUrl: string) => {
        if (!selectedItem) return;

        const updatedItem = { ...selectedItem, image: newImageUrl };
        updateMenuItem(updatedItem);

        toast({
            title: "Image Updated",
            description: `The image for ${selectedItem.name} has been successfully changed.`,
        });
        
        setIsChangePictureOpen(false);
        setSelectedItem(null);
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Menu Items</CardTitle>
                    <CardDescription>Manage your restaurant's menu. You can edit, delete, or change images for any item.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="hidden w-[100px] sm:table-cell">Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead className="hidden md:table-cell">Description</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {hydratedMenuItems.map((item) => (
                                <TableRow key={`${item.slug}-${item.name}`}>
                                    <TableCell className="hidden sm:table-cell">
                                        <Image
                                            alt={item.name}
                                            className="aspect-square rounded-md object-cover"
                                            height="64"
                                            src={item.image}
                                            width="64"
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{item.name}</TableCell>
                                    <TableCell>{item.price}</TableCell>
                                    <TableCell className="hidden md:table-cell max-w-sm truncate">{item.description}</TableCell>
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
                                                <DropdownMenuItem onSelect={() => handleChangePictureClick(item)}>
                                                    <ImageIcon className="mr-2 h-4 w-4" /> Change Picture
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
                </CardContent>
            </Card>

            {/* Edit Item Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit: {selectedItem?.name}</DialogTitle>
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
                           This action cannot be undone. This will permanently delete the item: <span className="font-semibold text-foreground">{selectedItem?.name}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>Yes, Delete Item</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            
            {/* Change Picture Dialog */}
            <Dialog open={isChangePictureOpen} onOpenChange={setIsChangePictureOpen}>
                <DialogContent className="max-w-4xl">
                     <DialogHeader>
                        <DialogTitle>Change Picture for: {selectedItem?.name}</DialogTitle>
                        <DialogDescription>
                           Upload a new image or video for this menu item.
                        </DialogDescription>
                    </DialogHeader>
                    <MediaUploader onUploadComplete={(url) => handleImageUpload(url)} purpose="gallery" />
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </>
    );
};

export default MenuManagement;
