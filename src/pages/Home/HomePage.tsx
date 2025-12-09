import { useState, useCallback } from 'react';
import { Text } from '@fluentui/react-components';
import { motion, AnimatePresence } from 'framer-motion';
import URLInput from '../../components/URLInput/URLInput';
import DownloadCard, { DownloadItem } from '../../components/DownloadCard/DownloadCard';
import VideoPreviewModal, {
  VideoInfo,
} from '../../components/VideoPreview/VideoPreviewModal';
import { useDownloadStore } from '../../stores/downloadStore';

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
  emptyIcon: {
    fontSize: '48px',
    opacity: 0.5,
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
  { name: 'YouTube', icon: '▶️', color: '#FF0000' },
  { name: 'Instagram', icon: '📷', color: '#E4405F' },
  { name: 'TikTok', icon: '🎵', color: '#00F2EA' },
  { name: 'Twitter', icon: '🐦', color: '#1DA1F2' },
  { name: 'Facebook', icon: '📘', color: '#1877F2' },
  { name: 'Vimeo', icon: '🎬', color: '#1AB7EA' },
];

// Mock data for demonstration
const mockVideoInfo: VideoInfo = {
  id: 'test123',
  title: 'Amazing Video Title - This is a test video with a long title',
  channel: 'Test Channel',
  thumbnail: 'https://picsum.photos/400/225',
  duration: '10:32',
  viewCount: '1.2M',
  uploadDate: '2024-01-15',
  platform: 'YouTube',
  formats: [
    { id: '1', quality: '2160p 4K', extension: 'mp4', size: '1.2 GB', type: 'video+audio', hasAudio: true, fps: 60 },
    { id: '2', quality: '1440p', extension: 'mp4', size: '650 MB', type: 'video+audio', hasAudio: true, fps: 60 },
    { id: '3', quality: '1080p', extension: 'mp4', size: '350 MB', type: 'video+audio', hasAudio: true, fps: 60 },
    { id: '4', quality: '1080p', extension: 'mp4', size: '280 MB', type: 'video+audio', hasAudio: true, fps: 30 },
    { id: '5', quality: '720p', extension: 'mp4', size: '180 MB', type: 'video+audio', hasAudio: true, fps: 30 },
    { id: '6', quality: '480p', extension: 'mp4', size: '95 MB', type: 'video+audio', hasAudio: true, fps: 30 },
    { id: '7', quality: '360p', extension: 'mp4', size: '55 MB', type: 'video+audio', hasAudio: true, fps: 30 },
    { id: '8', quality: '320kbps', extension: 'mp3', size: '25 MB', type: 'audio', hasAudio: true },
    { id: '9', quality: '256kbps', extension: 'mp3', size: '20 MB', type: 'audio', hasAudio: true },
    { id: '10', quality: '128kbps', extension: 'mp3', size: '10 MB', type: 'audio', hasAudio: true },
  ],
};

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const { downloads, addDownload, pauseDownload, resumeDownload, cancelDownload } =
    useDownloadStore();

  const handleURLSubmit = useCallback(async (_url: string) => {
    setIsLoading(true);
    // Simulate API call to fetch video info
    setTimeout(() => {
      setVideoInfo(mockVideoInfo);
      setShowPreview(true);
      setIsLoading(false);
    }, 1500);
  }, []);

  const handleDownload = useCallback(
    (formatId: string, _options: { downloadSubtitles: boolean; downloadThumbnail: boolean; audioOnly: boolean }) => {
      if (!videoInfo) return;

      const format = videoInfo.formats.find((f) => f.id === formatId);
      if (!format) return;

      const newDownload: DownloadItem = {
        id: `${Date.now()}`,
        title: videoInfo.title,
        channel: videoInfo.channel,
        thumbnail: videoInfo.thumbnail,
        duration: videoInfo.duration,
        status: 'downloading',
        progress: 0,
        speed: '2.5 MB/s',
        eta: '2:30',
        size: format.size,
        downloadedSize: '0 MB',
        platform: videoInfo.platform,
        platformColor: '#FF0000',
      };

      addDownload(newDownload);

      // Simulate download progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 5;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
        }
        // Update progress in store
        useDownloadStore.getState().updateProgress(newDownload.id, progress);
      }, 500);
    },
    [videoInfo, addDownload]
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
          Download from{' '}
          <span style={styles.heroGradient}>Anywhere</span>
        </motion.h1>

        <motion.p
          style={styles.heroSubtitle}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Paste any video URL and download in the highest quality.
          Supports 1800+ websites including YouTube, Instagram, TikTok, and more.
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
            +1800 more
          </motion.span>
        </motion.div>
      </motion.div>

      <div style={styles.inputSection}>
        <URLInput onSubmit={handleURLSubmit} isLoading={isLoading} />
      </div>

      {downloads.length > 0 && (
        <div style={styles.downloadsSection}>
          <div style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Downloads</Text>
            <div style={styles.stats}>
              <span style={styles.stat}>
                Active: <span style={styles.statValue}>{activeDownloads.length}</span>
              </span>
              <span style={styles.stat}>
                Completed:{' '}
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
                  onOpenFolder={() => {
                    // TODO: Open folder with Tauri
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
          <span style={styles.emptyIcon}>📥</span>
          <span style={styles.emptyText}>
            Your downloads will appear here. Paste a URL above to get started!
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
