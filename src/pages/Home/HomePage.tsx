import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Text } from '@fluentui/react-components';
import {
  Video24Regular,
  Camera24Regular,
  MusicNote224Regular,
  Chat24Regular,
  People24Regular,
  Film24Regular,
  ArrowDownload24Regular,
} from '@fluentui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import URLInput from '../../components/URLInput/URLInput';
import DownloadCard, { DownloadItem } from '../../components/DownloadCard/DownloadCard';
import VideoPreviewModal, {
  VideoInfo,
} from '../../components/VideoPreview/VideoPreviewModal';
import { useDownloadStore } from '../../stores/downloadStore';
import { useSettingsStore } from '../../stores/settingsStore';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    gap: '32px',
  },
  hero: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    paddingTop: '48px',
    paddingBottom: '32px',
    gap: '24px',
  },
  heroTitle: {
    fontSize: '42px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
    color: '#FFFFFF',
  },
  heroGradient: {
    background: 'linear-gradient(135deg, #6067D6 0%, #00D9FF 50%, #FF6B9D 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontSize: '16px',
    color: 'rgba(255, 255, 255, 0.6)',
    maxWidth: '500px',
    lineHeight: 1.6,
  },
  platformLogos: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginTop: '8px',
  },
  platformLogo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
    fontSize: '18px',
    transition: 'all 0.2s ease',
    cursor: 'default',
  },
  inputSection: {
    display: 'flex',
    justifyContent: 'center',
    paddingBottom: '24px',
  },
  downloadsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    overflow: 'auto' as const,
    paddingRight: '8px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  downloadsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px',
    gap: '16px',
    textAlign: 'center' as const,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: '15px',
  },
  stats: {
    display: 'flex',
    gap: '24px',
  },
  stat: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statValue: {
    color: '#9597F5',
    fontWeight: 600,
  },
};

const platforms = [
  { name: 'YouTube', icon: <Video24Regular />, color: '#FF0000' },
  { name: 'Instagram', icon: <Camera24Regular />, color: '#E4405F' },
  { name: 'TikTok', icon: <MusicNote224Regular />, color: '#00F2EA' },
  { name: 'Twitter', icon: <Chat24Regular />, color: '#1DA1F2' },
  { name: 'Facebook', icon: <People24Regular />, color: '#1877F2' },
  { name: 'Vimeo', icon: <Film24Regular />, color: '#1AB7EA' },
];

const platformColors: Record<string, string> = {
  youtube: '#FF0000',
  instagram: '#E4405F',
  tiktok: '#00F2EA',
  twitter: '#1DA1F2',
  facebook: '#1877F2',
  vimeo: '#1AB7EA',
  twitch: '#9146FF',
  reddit: '#FF4500',
  soundcloud: '#FF5500',
  spotify: '#1DB954',
};

function formatSize(bytes: number | undefined): string {
  if (!bytes) return 'Unknown';
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export default function HomePage() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [currentUrl, setCurrentUrl] = useState('');
  const { downloads, addDownload, pauseDownload, resumeDownload, cancelDownload, updateProgress, updateStatus } =
    useDownloadStore();
  const { downloadPath, embedMetadata, embedThumbnail } = useSettingsStore();

  // Listen for download events from Tauri
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupListeners = async () => {
      const { listen } = await import('@tauri-apps/api/event');

      const progressUnlisten = await listen<{
        id: string;
        progress: number;
        speed: string;
        eta: string;
        downloaded_size: string;
        total_size: string;
        status: string;
      }>('download-progress', (event) => {
        const { id, progress, speed, eta, status, downloaded_size, total_size } = event.payload;

        // Update download in store
        const store = useDownloadStore.getState();
        const download = store.downloads.find(d => d.id === id);
        if (download) {
          store.updateProgress(id, progress);
          // Also update other fields
          const updatedDownload = {
            ...download,
            progress,
            speed,
            eta,
            status: status as any,
            downloadedSize: downloaded_size,
            size: total_size || download.size,
          };
          // This is a simplified update - in production, update the store properly
        }
      });

      const completeUnlisten = await listen<{ id: string; success: boolean }>('download-complete', (event) => {
        const { id, success } = event.payload;
        if (success) {
          updateStatus(id, 'completed');
        }
      });

      const errorUnlisten = await listen<{ id: string; error: string }>('download-error', (event) => {
        const { id } = event.payload;
        updateStatus(id, 'error');
      });

      unlisten = () => {
        progressUnlisten();
        completeUnlisten();
        errorUnlisten();
      };
    };

    setupListeners();

    return () => {
      if (unlisten) unlisten();
    };
  }, [updateProgress, updateStatus]);

  const handleURLSubmit = useCallback(async (url: string) => {
    setIsLoading(true);
    setCurrentUrl(url);

    try {
      const { invoke } = await import('@tauri-apps/api/core');

      interface FetchResult {
        success: boolean;
        data?: {
          id: string;
          title: string;
          channel: string;
          thumbnail: string;
          duration_string: string;
          view_count?: number;
          upload_date?: string;
          extractor: string;
          formats: Array<{
            format_id: string;
            quality_label: string;
            ext: string;
            filesize?: number;
            filesize_approx?: number;
            has_video: boolean;
            has_audio: boolean;
            fps?: number;
          }>;
        };
        error?: string;
      }

      const result = await invoke<FetchResult>('fetch_video_info', { url });

      if (result.success && result.data) {
        const data = result.data;

        // Transform to VideoInfo format
        const info: VideoInfo = {
          id: data.id,
          title: data.title,
          channel: data.channel,
          thumbnail: data.thumbnail,
          duration: data.duration_string,
          viewCount: data.view_count ? `${(data.view_count / 1000000).toFixed(1)}M` : undefined,
          uploadDate: data.upload_date,
          platform: data.extractor,
          formats: data.formats.map(f => ({
            id: f.format_id,
            quality: f.quality_label,
            extension: f.ext,
            size: formatSize(f.filesize || f.filesize_approx),
            type: f.has_video && f.has_audio ? 'video+audio' : f.has_video ? 'video' : 'audio',
            hasAudio: f.has_audio,
            fps: f.fps,
          })),
        };

        setVideoInfo(info);
        setShowPreview(true);
      } else {
        console.error('Failed to fetch video info:', result.error);
        alert(result.error || 'Failed to fetch video information');
      }
    } catch (error) {
      console.error('Error fetching video info:', error);
      alert('Failed to connect to the download service. Make sure the app is running properly.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownload = useCallback(
    async (formatId: string, options: { downloadSubtitles: boolean; downloadThumbnail: boolean; audioOnly: boolean }) => {
      if (!videoInfo || !currentUrl) return;

      const format = videoInfo.formats.find((f) => f.id === formatId);
      if (!format) return;

      const platform = videoInfo.platform.toLowerCase();
      const platformColor = platformColors[platform] || '#6067D6';

      const newDownload: DownloadItem = {
        id: `${Date.now()}`,
        title: videoInfo.title,
        channel: videoInfo.channel,
        thumbnail: videoInfo.thumbnail,
        duration: videoInfo.duration,
        status: 'downloading',
        progress: 0,
        speed: '',
        eta: '',
        size: format.size,
        downloadedSize: '0 MB',
        platform: videoInfo.platform,
        platformColor,
      };

      addDownload(newDownload);
      setShowPreview(false);

      try {
        const { invoke } = await import('@tauri-apps/api/core');

        const path = downloadPath || (await invoke<string>('get_default_download_path'));

        await invoke('start_download', {
          url: currentUrl,
          formatId,
          outputPath: path,
          options: {
            embed_metadata: embedMetadata,
            embed_thumbnail: embedThumbnail,
            download_subtitles: options.downloadSubtitles,
            subtitle_languages: null,
            audio_only: options.audioOnly,
            audio_format: options.audioOnly ? 'mp3' : null,
          },
        });
      } catch (error) {
        console.error('Failed to start download:', error);
        updateStatus(newDownload.id, 'error');
      }
    },
    [videoInfo, currentUrl, addDownload, downloadPath, embedMetadata, embedThumbnail, updateStatus]
  );

  const activeDownloads = downloads.filter(
    (d) => d.status === 'downloading' || d.status === 'paused'
  );

  return (
    <div style={styles.root}>
      <motion.div
        style={styles.hero}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.h1
          style={styles.heroTitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {t('home.title')}{' '}
          <span style={styles.heroGradient}>{t('home.titleHighlight')}</span>
        </motion.h1>

        <motion.p
          style={styles.heroSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {t('home.subtitle')}
        </motion.p>

        <motion.div
          style={styles.platformLogos}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {platforms.map((platform, index) => (
            <motion.div
              key={platform.name}
              style={styles.platformLogo}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
              whileHover={{ scale: 1.1, y: -4 }}
              title={platform.name}
            >
              {platform.icon}
            </motion.div>
          ))}
          <motion.span
            style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {t('home.moreSites')}
          </motion.span>
        </motion.div>
      </motion.div>

      <div style={styles.inputSection}>
        <URLInput onSubmit={handleURLSubmit} isLoading={isLoading} />
      </div>

      {downloads.length > 0 && (
        <div style={styles.downloadsSection}>
          <div style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('nav.downloads')}</Text>
            <div style={styles.stats}>
              <span style={styles.stat}>
                {t('home.activeDownloads')}: <span style={styles.statValue}>{activeDownloads.length}</span>
              </span>
              <span style={styles.stat}>
                {t('home.completedDownloads')}:{' '}
                <span style={styles.statValue}>
                  {downloads.filter((d) => d.status === 'completed').length}
                </span>
              </span>
            </div>
          </div>

          <div style={styles.downloadsList}>
            <AnimatePresence>
              {downloads.map((download) => (
                <DownloadCard
                  key={download.id}
                  item={download}
                  onPause={() => pauseDownload(download.id)}
                  onResume={() => resumeDownload(download.id)}
                  onCancel={() => cancelDownload(download.id)}
                  onOpenFolder={async () => {
                    try {
                      const { open } = await import('@tauri-apps/plugin-shell');
                      const path = downloadPath || (await import('@tauri-apps/api/core').then(m => m.invoke<string>('get_default_download_path')));
                      if (path) {
                        await open(path);
                      }
                    } catch (error) {
                      console.error('Failed to open folder:', error);
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {downloads.length === 0 && (
        <motion.div
          style={styles.emptyState}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ArrowDownload24Regular style={{ fontSize: '48px', opacity: 0.5 }} />
          <span style={styles.emptyText}>
            {t('home.emptyDownloads')}
          </span>
        </motion.div>
      )}

      <VideoPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        videoInfo={videoInfo}
        onDownload={handleDownload}
      />
    </div>
  );
}
