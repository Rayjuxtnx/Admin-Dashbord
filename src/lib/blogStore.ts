
import { create } from 'zustand';
import { getBlogPosts, upsertBlogPost, deleteBlogPost } from '@/app/admin/actions';

export interface BlogPost {
  id: number;
  created_at: string;
  title: string;
  content: string;
  published: boolean;
}

interface BlogState {
  blogPosts: BlogPost[];
  isLoading: boolean;
  error: string | null;
  fetchBlogPosts: () => Promise<void>;
  addBlogPost: (post: Omit<BlogPost, 'id' | 'created_at'>) => Promise<void>;
  updateBlogPost: (post: BlogPost) => Promise<void>;
  removeBlogPost: (id: number) => Promise<void>;
}

export const useBlogStore = create<BlogState>((set) => ({
  blogPosts: [],
  isLoading: false,
  error: null,
  fetchBlogPosts: async () => {
    set({ isLoading: true, error: null });
    try {
      const posts = await getBlogPosts();
      set({ blogPosts: posts, isLoading: false });
    } catch (e: any) {
      console.error("Failed to fetch blog posts:", e);
      set({ error: e.message || 'Failed to fetch posts.', isLoading: false });
    }
  },
  addBlogPost: async (postData) => {
    try {
        const newPost = await upsertBlogPost(postData);
        set((state) => ({
            blogPosts: [newPost, ...state.blogPosts],
        }));
    } catch (e: any) {
        console.error("Failed to add blog post:", e);
        throw e;
    }
  },
  updateBlogPost: async (updatedPost) => {
     try {
        const post = await upsertBlogPost(updatedPost);
        set((state) => ({
          blogPosts: state.blogPosts.map((p) => (p.id === post.id ? post : p)),
        }));
    } catch (e: any) {
        console.error("Failed to update blog post:", e);
        throw e;
    }
  },
  removeBlogPost: async (id) => {
    try {
        await deleteBlogPost(id);
        set((state) => ({
          blogPosts: state.blogPosts.filter((post) => post.id !== id),
        }));
    } catch (e: any) {
        console.error("Failed to delete blog post:", e);
        throw e;
    }
  },
}));
