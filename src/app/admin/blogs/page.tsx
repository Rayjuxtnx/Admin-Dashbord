
"use client";

import { BlogPost, useBlogStore } from "@/lib/blogStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, PlusCircle, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";

const BlogManagementPage = () => {
    const { toast } = useToast();
    const { blogPosts, isLoading, error, fetchBlogPosts, addBlogPost, updateBlogPost, removeBlogPost } = useBlogStore();
    
    const [selectedPost, setSelectedPost] = useState<Partial<BlogPost> | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchBlogPosts();
    }, [fetchBlogPosts]);

    const handleEditClick = (post: BlogPost) => {
        setSelectedPost({...post});
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (post: BlogPost) => {
        setSelectedPost(post);
        setIsDeleteDialogOpen(true);
    };
    
    const handleAddClick = () => {
        setSelectedPost({
            id: `new-${Date.now()}`, // Temporary ID
            title: '',
            content: '',
            published: false,
        });
        setIsEditDialogOpen(true);
    }

    const handleSaveChanges = async () => {
        if (!selectedPost) return;

        const action = selectedPost.id && blogPosts.some(post => post.id === selectedPost.id) ? 'update' : 'add';
        
        const postToSave: Partial<BlogPost> = { ...selectedPost };
        if (action === 'add') {
            delete postToSave.id;
        }
        
        try {
            if (action === 'update') {
                await updateBlogPost(postToSave as BlogPost);
            } else {
                await addBlogPost(postToSave as Omit<BlogPost, 'id' | 'created_at'>);
            }
            
            toast({
                title: `Post ${action === 'update' ? 'Updated' : 'Added'}`,
                description: `"${selectedPost.title}" has been successfully saved.`,
            });
            setIsEditDialogOpen(false);
            setSelectedPost(null);
        } catch (e: any) {
            toast({
                variant: 'destructive',
                title: `Failed to ${action} post`,
                description: e.message || 'An error occurred.',
            });
        }
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPost || !selectedPost.id) return;

        try {
            await removeBlogPost(Number(selectedPost.id));
            toast({
                title: "Post Deleted",
                description: `"${selectedPost.title}" has been removed.`,
            });
            setIsDeleteDialogOpen(false);
            setSelectedPost(null);
        } catch (e: any) {
             toast({
                variant: 'destructive',
                title: "Failed to delete post",
                description: e.message || 'An error occurred.',
            });
        }
    };

    return (
        <div className="flex flex-col gap-8">
             <header>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Blog Management
                </h1>
                <p className="text-muted-foreground">
                    Create, edit, and manage all your blog posts.
                </p>
            </header>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Blog Posts</CardTitle>
                        <CardDescription>Manage your blog content. Published posts will appear on your public blog page.</CardDescription>
                    </div>
                     <Button onClick={handleAddClick}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        New Post
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
                        <div className="text-center py-8">
                            <p className="text-destructive">{error}</p>
                            <Button onClick={() => fetchBlogPosts()} className="mt-4">Try Again</Button>
                        </div>
                    ): (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead className="text-center">Published</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {blogPosts.map((post) => (
                                <TableRow key={post.id}>
                                    <TableCell className="font-medium">{post.title}</TableCell>
                                    <TableCell>{format(new Date(post.created_at), "PPp")}</TableCell>
                                    <TableCell className="text-center">
                                        {post.published ? 
                                            <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" /> Published</Badge> : 
                                            <Badge variant="outline"><XCircle className="mr-1 h-3 w-3"/> Draft</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
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
                                                <DropdownMenuItem onSelect={() => handleEditClick(post)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDeleteClick(post)} className="text-destructive focus:text-destructive">
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

            {/* Edit/Add Post Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{selectedPost?.id?.toString().startsWith('new-') ? 'Add New Post' : 'Edit Post'}</DialogTitle>
                        <DialogDescription>Make changes to the blog post here. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">Title</Label>
                            <Input id="title" value={selectedPost?.title || ''} onChange={(e) => setSelectedPost(prev => prev ? {...prev, title: e.target.value} : null)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-start gap-4">
                            <Label htmlFor="content" className="text-right pt-2">Content</Label>
                            <Textarea id="content" value={selectedPost?.content || ''} onChange={(e) => setSelectedPost(prev => prev ? {...prev, content: e.target.value} : null)} className="col-span-3 min-h-[200px]" placeholder="Write your blog post content here..."/>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="published" className="text-right">Published</Label>
                            <div className="col-span-3 flex items-center gap-2">
                                <Switch id="published" checked={selectedPost?.published || false} onCheckedChange={(checked) => setSelectedPost(prev => prev ? {...prev, published: checked} : null)} />
                                <span className="text-sm text-muted-foreground">{selectedPost?.published ? "This post will be visible to the public." : "This post is a draft."}</span>
                            </div>
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
                        <DialogTitle>Are you sure you want to delete this post?</DialogTitle>
                        <DialogDescription>
                           This action cannot be undone. This will permanently delete the post: <span className="font-semibold text-foreground">{selectedPost?.title}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button variant="destructive" onClick={handleDeleteConfirm}>Yes, Delete Post</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default BlogManagementPage;
