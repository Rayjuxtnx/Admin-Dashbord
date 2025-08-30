
"use client";

import { Button } from "@/components/ui/button";
import { Download, QrCode as QrCodeIcon, ChevronsUpDown } from "lucide-react";
import MenuItemCard from "@/components/MenuItemCard";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import QrCode from "@/components/QrCode";
import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { MenuItem } from "@/lib/menuData";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type MenuCategory = {
    title: string;
    items: MenuItem[];
};

type FilterCategory = 'All' | string;

type MenuClientProps = {
    menuCategoriesList: MenuCategory[];
}

const formatCategoryTitle = (title: string) => {
    if (!title) return "Uncategorized";
    return title
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();
}

export default function MenuClient({ menuCategoriesList }: MenuClientProps) {
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [menuUrl, setMenuUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('All');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = window.location.origin + '/menu';
      setMenuUrl(url);
    }
  }, []);

  const handleDownload = () => {
    const svgElement = qrCodeRef.current?.querySelector('svg');
    if (svgElement) {
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const svgSize = svgElement.getBoundingClientRect();
      canvas.width = svgSize.width;
      canvas.height = svgSize.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const img = document.createElement("img");
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = "hiddentastygrill-menu-qr-code.png";
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    }
  };
  
  const filteredMenuCategories = useMemo(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    
    let categories = menuCategoriesList;

    if (selectedCategory !== 'All') {
      categories = categories.filter(cat => cat.title === selectedCategory);
    }

    if (lowercasedSearchTerm.trim() !== '') {
      return categories
        .map(category => {
          const filteredItems = category.items.filter(item =>
            item.name.toLowerCase().includes(lowercasedSearchTerm) ||
            (item.description && item.description.toLowerCase().includes(lowercasedSearchTerm))
          );
          return { ...category, items: filteredItems };
        })
        .filter(category => category.items.length > 0);
    }

    return categories.filter(category => category.items && category.items.length > 0);

  }, [searchTerm, selectedCategory, menuCategoriesList]);

  return (
    <>
        <div className="flex justify-center mt-8 gap-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <QrCodeIcon className="mr-2 h-4 w-4" />
                  Show QR Code
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Scan to View Menu</DialogTitle>
                  <DialogDescription>
                    Scan this QR code with your phone's camera to open our interactive online menu.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-center p-4" ref={qrCodeRef}>
                  <QrCode url={menuUrl} />
                </div>
                <Button onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download for Printing
                </Button>
              </DialogContent>
            </Dialog>
        </div>

        <div className="my-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <Input
            type="text"
            placeholder="Search our delicious dishes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-center md:text-left"
          />
           <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span>{selectedCategory === 'All' ? 'Filter by Category' : formatCategoryTitle(selectedCategory)}</span>
                <ChevronsUpDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width] max-h-96 overflow-y-auto">
              <DropdownMenuLabel>Select a Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={selectedCategory} onValueChange={(value) => setSelectedCategory(value as FilterCategory)}>
                <DropdownMenuRadioItem value="All">All</DropdownMenuRadioItem>
                {menuCategoriesList.map(cat => (
                  <DropdownMenuRadioItem key={cat.title} value={cat.title} className={cn(cat.items.length === 0 && "hidden")}>
                    {formatCategoryTitle(cat.title)}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>


        <div className="space-y-12 mt-8">
            {filteredMenuCategories.length > 0 ? (
                filteredMenuCategories.map(category => (
                    <div key={category.title}>
                        <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary border-b pb-2 text-center">
                            {formatCategoryTitle(category.title)}
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
                            {category.items.map((item) => (
                                <MenuItemCard
                                    key={item.id}
                                    {...item}
                                />
                            ))}
                        </div>
                    </div>
                ))
            ) : (
                <div className="text-center py-16">
                    <p className="text-muted-foreground">No dishes found{searchTerm ? ` for "${searchTerm}"`: ''}{selectedCategory !== 'All' ? ` in ${formatCategoryTitle(selectedCategory)}` : ''}. Try another category or search term.</p>
                </div>
            )}
        </div>
    </>
  )
}
