import { create } from 'zustand';
import { menuData, MenuItem } from './menuData';

// Flatten all menu items into a single array
const allMenuItems = Object.values(menuData).flat();

interface MenuState {
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemSlug: string) => void;
  addMenuItem: (item: MenuItem) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menuItems: allMenuItems,
  setMenuItems: (items) => set({ menuItems: items }),
  updateMenuItem: (updatedItem) => set(state => ({
    menuItems: state.menuItems.map(item => 
      item.slug === updatedItem.slug ? updatedItem : item
    ),
  })),
  deleteMenuItem: (itemSlug) => set(state => ({
    menuItems: state.menuItems.filter(item => item.slug !== itemSlug),
  })),
  addMenuItem: (newItem) => set(state => ({
    menuItems: [...state.menuItems, newItem],
  })),
}));
