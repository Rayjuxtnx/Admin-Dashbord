
export type GalleryMedia = {
  id: number;
  url: string;
  type: 'image' | 'video';
  alt_text: string | null;
  purpose: 'homepage_hero' | 'gallery';
  created_at: string;
  path: string;
};
