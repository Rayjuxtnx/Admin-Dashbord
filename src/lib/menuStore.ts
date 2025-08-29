
import { create } from 'zustand';
import { MenuItem } from './menuData';
import { getMenuItems, upsertMenuItem, deleteMenuItem } from '@/app/(dashboard)/actions';

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
  isLoading: true,
  error: null,
  fetchMenuItems: async () => {
    try {
      set({ isLoading: true, error: null });
      const items = await getMenuItems();
      set({ menuItems: items, isLoading: false });
    } catch (e: any) {
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
        // Optionally update the state to show an error
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
    }
  },
}));

// Initial fetch when the app loads
useMenuStore.getState().fetchMenuItems();
