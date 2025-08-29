import { create } from 'zustand';
import { MenuItem } from './menuData';
import { getMenuItems } from '@/app/(dashboard)/actions';

interface MenuState {
  menuItems: MenuItem[];
  isLoading: boolean;
  error: string | null;
  fetchMenuItems: () => Promise<void>;
  setMenuItems: (items: MenuItem[]) => void;
  updateMenuItem: (item: MenuItem) => void;
  removeMenuItem: (itemId: string) => void;
  addMenuItem: (item: MenuItem) => void;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  menuItems: [],
  isLoading: true,
  error: null,
  fetchMenuItems: async () => {
    // Prevent refetching if already loading or has data
    if (get().isLoading || get().menuItems.length > 0) return;
    
    set({ isLoading: true, error: null });
    try {
      const items = await getMenuItems();
      set({ menuItems: items, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
      set({ error: 'Failed to load menu items.', isLoading: false });
    }
  },
  setMenuItems: (items) => set({ menuItems: items }),
  updateMenuItem: (updatedItem) => set(state => ({
    menuItems: state.menuItems.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ),
  })),
  removeMenuItem: (itemId) => set(state => ({
    menuItems: state.menuItems.filter(item => item.id !== itemId),
  })),
  addMenuItem: (newItem) => set(state => ({
    menuItems: [...state.menuItems, newItem],
  })),
}));

// Initialize the store by fetching the menu items on app load
if (typeof window !== 'undefined') {
    useMenuStore.getState().fetchMenuItems();
}
