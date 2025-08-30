

import { create } from 'zustand';
import { getPosts, upsertPost, deletePost } from '@/app/admin/actions';

export interface Post {
  id: number;
  created_at: string;
  title: string;
  author: string | null;
  date: string;
  excerpt: string | null;
  image_url: string | null;
  image_hint: string | null;
  slug: string;
  content: string | null;
}


interface PostState {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  addPost: (post: Partial<Omit<Post, 'created_at' | 'slug'>>) => Promise<void>;
  updatePost: (post: Post) => Promise<void>;
  removePost: (id: number) => Promise<void>;
}

export const usePostStore = create<PostState>((set) => ({
  posts: [],
  isLoading: false,
  error: null,
  fetchPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const posts = await getPosts();
      set({ posts: posts, isLoading: false });
    } catch (e: any) {
      console.error("Failed to fetch posts:", e);
      set({ error: e.message || 'Failed to fetch posts.', isLoading: false });
    }
  },
  addPost: async (postData) => {
    try {
        const newPost = await upsertPost(postData);
        set((state) => ({
            posts: [newPost, ...state.posts],
        }));
    } catch (e: any) {
        console.error("Failed to add post:", e);
        throw e;
    }
  },
  updatePost: async (updatedPost) => {
     try {
        const post = await upsertPost(updatedPost);
        set((state) => ({
          posts: state.posts.map((p) => (p.id === post.id ? post : p)),
        }));
    } catch (e: any) {
        console.error("Failed to update post:", e);
        throw e;
    }
  },
  removePost: async (id) => {
    try {
        await deletePost(id);
        set((state) => ({
          posts: state.posts.filter((post) => post.id !== id),
        }));
    } catch (e: any) {
        console.error("Failed to delete post:", e);
        throw e;
    }
  },
}));
