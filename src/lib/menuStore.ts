import { create } from 'zustand';
import { menuData, MenuData, MenuItem } from './menuData';

interface MenuState {
  menuData: MenuData;
  setMenuData: (data: MenuData) => void;
  // The following are now placeholders as logic will be handled by server actions
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  addMenuItem: (item: MenuItem, category: keyof MenuData) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menuData: menuData,
  setMenuData: (data) => set({ menuData: data }),
  updateMenuItem: (updatedItem) => set(state => {
      const newMenuData = { ...state.menuData };
      for (const category in newMenuData) {
          const key = category as keyof MenuData;
          const items = newMenuData[key];
          const itemIndex = items.findIndex(item => item.id === updatedItem.id);
          if (itemIndex !== -1) {
              items[itemIndex] = updatedItem;
              break;
          }
      }
      return { menuData: newMenuData };
  }),
  deleteMenuItem: (itemId) => set(state => {
      const newMenuData = { ...state.menuData };
      for (const category in newMenuData) {
          const key = category as keyof MenuData;
          newMenuData[key] = newMenuData[key].filter(item => item.id !== itemId);
      }
      return { menuData: newMenuData };
  }),
    addMenuItem: (newItem, category) => set(state => {
        const newMenuData = { ...state.menuData };
        newMenuData[category] = [...newMenuData[category], newItem];
        return { menuData: newMenuData };
    }),
}));
