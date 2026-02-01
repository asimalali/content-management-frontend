import { create } from 'zustand';
import {
  brandConfig,
  type BrandConfig,
  type BrandName,
  type BrandTagline,
  type BrandLogo,
  type BrandColors,
} from '@/config/brand.config';

interface BrandState {
  config: BrandConfig;
  updateConfig: (partial: Partial<BrandConfig>) => void;
  updateColors: (colors: Partial<BrandColors>) => void;
  resetConfig: () => void;
}

export const useBrand = create<BrandState>((set) => ({
  config: brandConfig,

  updateConfig: (partial) =>
    set((state) => ({
      config: { ...state.config, ...partial },
    })),

  updateColors: (colors) =>
    set((state) => ({
      config: {
        ...state.config,
        colors: { ...state.config.colors, ...colors },
      },
    })),

  resetConfig: () => set({ config: brandConfig }),
}));

// Selector hooks for specific parts of the config
export const useBrandName = (): BrandName =>
  useBrand((state) => state.config.name);

export const useBrandTagline = (): BrandTagline =>
  useBrand((state) => state.config.tagline);

export const useBrandLogo = (): BrandLogo =>
  useBrand((state) => state.config.logo);

export const useBrandColors = (): BrandColors =>
  useBrand((state) => state.config.colors);

export const useBrandMeta = () => useBrand((state) => state.config.meta);

export const useBrandFavicon = () => useBrand((state) => state.config.favicon);
