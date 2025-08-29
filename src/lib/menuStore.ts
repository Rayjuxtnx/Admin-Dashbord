import { create } from 'zustand';
import { menuData, MenuData } from './menuData';

interface MenuState {
  menuData: MenuData;
  setMenuData: (data: MenuData) => void;
}

export const useMenuStore = create<MenuState>((set) => ({
  menuData: menuData,
  setMenuData: (data) => set({ menuData: data }),
}));
