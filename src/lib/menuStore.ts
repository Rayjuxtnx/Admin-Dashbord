
import { create } from 'zustand';
import { MenuItem } from './menuData';
import { getMenuItems, upsertMenuItem, deleteMenuItem } from '@/app/admin/actions';

interface MenuState {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  fetchMenuItems: () => Promise<void>;
  addMenuItem: (item: Omit<MenuItem, 'id' | 'slug'>) => Promise<void>;
  updateMenuItem: (item: MenuItem) => Promise<void>;
  removeMenuItem: (id: string) => Promise<void>;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [],
  isLoading: false,
  error: null,
  fetchMenuItems: async () => {
    // Only fetch if not already loading to prevent race conditions
    if (get().isLoading) return;
    
    try {
      set({ isLoading: true, error: null });
      const items = await getMenuItems();
      set({ menuItems: items, isLoading: false });
    } catch (e: any) {
      console.error("Failed to fetch menu items:", e);
      set({ error: e.message || 'Failed to fetch menu items.', isLoading: false });
    }
  },
  addMenuItem: async (itemData) => {
    try {
        const newItem = await upsertMenuItem(itemData);
        set((state) => ({
            menuItems: [...state.menuItems, newItem],
        }));
    } catch (e: any) {
        console.error("Failed to add menu item:", e);
        // Propagate the error to be caught in the component
        throw e;
    }
  },
  updateMenuItem: async (updatedItem) => {
     try {
        const item = await upsertMenuItem(updatedItem);
        set((state) => ({
          menuItems: state.menuItems.map((i) => (i.id === item.id ? item : i)),
        }));
    } catch (e: any) {
        console.error("Failed to update menu item:", e);
        throw e;
    }
  },
  removeMenuItem: async (id) => {
    try {
        await deleteMenuItem(id);
        set((state) => ({
          menuItems: state.menuItems.filter((item) => item.id !== id),
        }));
    } catch (e: any) {
        console.error("Failed to delete menu item:", e);
        throw e;
    }
  },
}));
