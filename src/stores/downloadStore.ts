import { create } from 'zustand';
import { DownloadItem, DownloadStatus } from '../components/DownloadCard/DownloadCard';

interface DownloadUpdate {
  progress?: number;
  speed?: string;
  eta?: string;
  downloadedSize?: string;
  size?: string;
  status?: DownloadStatus;
}

interface DownloadStore {
  downloads: DownloadItem[];
  addDownload: (download: DownloadItem) => void;
  removeDownload: (id: string) => void;
  updateProgress: (id: string, progress: number) => void;
  updateDownload: (id: string, update: DownloadUpdate) => void;
  updateDownloadId: (oldId: string, newId: string) => void;
  updateStatus: (id: string, status: DownloadStatus) => void;
  pauseDownload: (id: string) => void;
  resumeDownload: (id: string) => void;
  cancelDownload: (id: string) => void;
  clearCompleted: () => void;
}

export const useDownloadStore = create<DownloadStore>((set) => ({
  downloads: [],

  addDownload: (download) =>
    set((state) => ({
      downloads: [download, ...state.downloads],
    })),

  removeDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== id),
    })),

  updateProgress: (id, progress) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id
          ? {
              ...d,
              progress,
              status: progress >= 100 ? 'completed' : d.status,
              downloadedSize:
                progress >= 100
                  ? d.size
                  : `${((parseFloat(d.size || '0') * progress) / 100).toFixed(1)} MB`,
            }
          : d
      ),
    })),

  updateDownload: (id, update) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id
          ? {
              ...d,
              ...update,
              status: update.status || (update.progress && update.progress >= 100 ? 'completed' : d.status),
            }
          : d
      ),
    })),

  updateDownloadId: (oldId, newId) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === oldId ? { ...d, id: newId } : d
      ),
    })),

  updateStatus: (id, status) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, status } : d
      ),
    })),

  pauseDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, status: 'paused' as DownloadStatus } : d
      ),
    })),

  resumeDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, status: 'downloading' as DownloadStatus } : d
      ),
    })),

  cancelDownload: (id) =>
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== id),
    })),

  clearCompleted: () =>
    set((state) => ({
      downloads: state.downloads.filter((d) => d.status !== 'completed'),
    })),
}));
