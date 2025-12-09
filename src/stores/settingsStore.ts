import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

export type QualityOption = 'best' | '1080p' | '720p' | '480p';
export type ThemeOption = 'dark' | 'light' | 'system';
export type LanguageOption = 'en' | 'fa';

interface SettingsStore {
  downloadPath: string;
  defaultQuality: QualityOption;
  theme: ThemeOption;
  language: LanguageOption;
  autoUpdate: boolean;
  notifications: boolean;
  simultaneousDownloads: number;
  embedMetadata: boolean;
  embedThumbnail: boolean;
  setDownloadPath: (path: string) => void;
  setDefaultQuality: (quality: QualityOption) => void;
  setTheme: (theme: ThemeOption) => void;
  setLanguage: (language: LanguageOption) => void;
  setAutoUpdate: (value: boolean) => void;
  setNotifications: (value: boolean) => void;
  setSimultaneousDownloads: (count: number) => void;
  setEmbedMetadata: (value: boolean) => void;
  setEmbedThumbnail: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      downloadPath: '',
      defaultQuality: 'best',
      theme: 'dark',
      language: 'en',
      autoUpdate: true,
      notifications: true,
      simultaneousDownloads: 3,
      embedMetadata: true,
      embedThumbnail: true,
      setDownloadPath: (path) => set({ downloadPath: path }),
      setDefaultQuality: (quality) => set({ defaultQuality: quality }),
      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => {
        i18n.changeLanguage(language);
        document.documentElement.dir = language === 'fa' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        set({ language });
      },
      setAutoUpdate: (value) => set({ autoUpdate: value }),
      setNotifications: (value) => set({ notifications: value }),
      setSimultaneousDownloads: (count) => set({ simultaneousDownloads: count }),
      setEmbedMetadata: (value) => set({ embedMetadata: value }),
      setEmbedThumbnail: (value) => set({ embedThumbnail: value }),
    }),
    {
      name: 'ultimate-downloader-settings',
      onRehydrateStorage: () => (state) => {
        if (state?.language) {
          i18n.changeLanguage(state.language);
          document.documentElement.dir = state.language === 'fa' ? 'rtl' : 'ltr';
          document.documentElement.lang = state.language;
        }
      },
    }
  )
);
