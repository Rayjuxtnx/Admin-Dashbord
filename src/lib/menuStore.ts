import { create } from 'zustand';
import { MenuItem } from './menuData';

interface MenuState {
  menuItems: MenuItem[];
  setMenuItems: (items: MenuItem[]) => void;
  addMenuItem: (item: Omit<MenuItem, 'slug'>) => void;
  updateMenuItem: (updatedItem: MenuItem) => void;
  deleteMenuItem: (slug: string) => void;
}

const toSlug = (name: string) => name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

export const useMenuStore = create<MenuState>((set) => ({
  menuItems: [],
  setMenuItems: (items) => set({ menuItems: items }),
  addMenuItem: (item) => set((state) => ({
    menuItems: [...state.menuItems, { ...item, slug: toSlug(item.name) }]
  })),
  updateMenuItem: (updatedItem) => set((state) => ({
    menuItems: state.menuItems.map((item) =>
      item.slug === updatedItem.slug ? updatedItem : item
    ),
  })),
  deleteMenuItem: (slug) => set((state) => ({
    menuItems: state.menuItems.filter((item) => item.slug !== slug),
  })),
}));
