
import { create } from 'zustand';
import { getAllMenuItems, MenuItem } from './menuData';

interface MenuState {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  fetchMenuItems: () => void;
  addMenuItem: (item: MenuItem) => void;
  updateMenuItem: (item: MenuItem) => void;
  removeMenuItem: (id: string) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [],
  isLoading: true,
  error: null,
  fetchMenuItems: () => {
    try {
      set({ isLoading: true, error: null });
      const items = getAllMenuItems();
      set({ menuItems: items, isLoading: false });
    } catch (e) {
      set({ error: 'Failed to fetch menu items from local data.', isLoading: false });
    }
  },
  addMenuItem: (item) => {
    // This is a placeholder. In a real app with a DB, you'd call an API.
    // Since menuData is read-only, we can't truly add to it at runtime this way.
    // This simulates the UI update.
    set((state) => ({
      menuItems: [...state.menuItems, item],
    }));
  },
  updateMenuItem: (updatedItem) => {
    set((state) => ({
      menuItems: state.menuItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  },
  removeMenuItem: (id) => {
    set((state) => ({
      menuItems: state.menuItems.filter((item) => item.id !== id),
    }));
  },
}));

// Auto-fetch data when the store is initialized
useMenuStore.getState().fetchMenuItems();
