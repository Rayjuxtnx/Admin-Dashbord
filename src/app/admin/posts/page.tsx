
"use client";

import { Post, usePostStore } from "@/lib/postStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

const PostManagementPage = () => {
    const { toast } = useToast();
    const { posts, isLoading, error, fetchPosts, addPost, updatePost, removePost } = usePostStore();
    
    const [selectedPost, setSelectedPost] = useState<Partial<Post> | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const handleEditClick = (post: Post) => {
        setSelectedPost({...post});
        setIsEditDialogOpen(true);
    };

    const handleDeleteClick = (post: Post) => {
        setSelectedPost(post);
        setIsDeleteDialogOpen(true);
    };
    
    const handleAddClick = () => {
        setSelectedPost({
            id: `new-${Date.now()}`, // Temporary ID
            title: '',
            content: '',
            author: 'Admin',
            date: new Date().toISOString(),
            excerpt: '',
            image_url: '',
            image_hint: '',
        });
        setIsEditDialogOpen(true);
    }

    const handleSaveChanges = async () => {
        if (!selectedPost) return;

        const action = selectedPost.id && posts.some(post => post.id === selectedPost.id) ? 'update' : 'add';
        
        const postToSave: Partial<Post> = { ...selectedPost };
        if (action === 'add') {
            delete postToSave.id;
        }
        
        try {
            if (action === 'update') {
                await updatePost(postToSave as Post);
            } else {
                await addPost(postToSave as Omit<Post, 'id' | 'created_at' | 'slug'>);
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
            await removePost(Number(selectedPost.id));
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
    
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "PP");
        } catch (e) {
            return "Invalid Date";
        }
    }


    return (
        <div className="flex flex-col gap-8">
             <header>
                <h1 className="text-3xl font-bold font-headline tracking-tight">
                    Post Management
                </h1>
                <p className="text-muted-foreground">
                    Create, edit, and manage all your posts.
                </p>
            </header>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Posts</CardTitle>
                        <CardDescription>Manage your site's content. Posts will appear on your public blog page.</CardDescription>
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
                            <Button onClick={() => fetchPosts()} className="mt-4">Try Again</Button>
                        </div>
                    ): posts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <p>No posts found. Click "New Post" to create one.</p>
                        </div>
                    ) : (
                        <>
                        {/* Mobile View */}
                        <div className="grid gap-4 md:hidden">
                            {posts.map((post) => (
                                <Card key={post.id}>
                                    <CardHeader>
                                        <CardTitle className="text-lg">{post.title}</CardTitle>
                                        <CardDescription>by {post.author} on {formatDate(post.date)}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</p>
                                    </CardContent>
                                    <CardFooter className="flex justify-end">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button aria-haspopup="true" size="icon" variant="ghost">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                    <span className="sr-only">Toggle menu</span>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onSelect={() => handleEditClick(post)}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                                                <DropdownMenuItem onSelect={() => handleDeleteClick(post)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        {/* Desktop View */}
                        <Table className="hidden md:table">
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Author</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead className="text-right">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {posts.map((post) => (
                                    <TableRow key={post.id}>
                                        <TableCell className="font-medium">{post.title}</TableCell>
                                        <TableCell>{post.author}</TableCell>
                                        <TableCell>{formatDate(post.date)}</TableCell>
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
                        </>
                    )}
                </CardContent>
            </Card>

            {/* Edit/Add Post Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-3xl h-[90vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle>{selectedPost?.id?.toString().startsWith('new-') ? 'Add New Post' : 'Edit Post'}</DialogTitle>
                        <DialogDescription>Make changes to the post here. Click save when you're done.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4 overflow-y-auto flex-grow">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input id="title" value={selectedPost?.title || ''} onChange={(e) => setSelectedPost(prev => prev ? {...prev, title: e.target.value} : null)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="author">Author</Label>
                                <Input id="author" value={selectedPost?.author || ''} onChange={(e) => setSelectedPost(prev => prev ? {...prev, author: e.target.value} : null)} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="content">Content</Label>
                            <Textarea id="content" value={selectedPost?.content || ''} onChange={(e) => setSelectedPost(prev => prev ? {...prev, content: e.target.value} : null)} className="min-h-[250px]" placeholder="Write your post content here..."/>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="excerpt">Excerpt</Label>
                            <Textarea id="excerpt" value={selectedPost?.excerpt || ''} onChange={(e) => setSelectedPost(prev => prev ? {...prev, excerpt: e.target.value} : null)} className="min-h-[100px]" placeholder="A short summary of the post."/>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="image_url">Image URL</Label>
                                <Input id="image_url" value={selectedPost?.image_url || ''} onChange={(e) => setSelectedPost(prev => prev ? {...prev, image_url: e.target.value} : null)} placeholder="https://example.com/image.png"/>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image_hint">Image Hint</Label>
                                <Input id="image_hint" value={selectedPost?.image_hint || ''} onChange={(e) => setSelectedPost(prev => prev ? {...prev, image_hint: e.target.value} : null)} placeholder="e.g. food delicious"/>
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

export default PostManagementPage;

    