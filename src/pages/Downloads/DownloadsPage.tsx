import { useTranslation } from 'react-i18next';
import { Text, Button, tokens } from '@fluentui/react-components';
import {
  Pause24Regular,
  Play24Regular,
  Dismiss24Regular,
  Delete24Regular,
  Folder24Regular,
  CheckmarkCircle24Filled,
  ErrorCircle24Filled,
  Clock24Regular,
} from '@fluentui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useDownloadStore } from '../../stores/downloadStore';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    gap: '24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
  },
  stats: {
    display: 'flex',
    gap: '16px',
    fontSize: '14px',
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  content: {
    flex: 1,
    overflow: 'auto' as const,
    paddingLeft: '8px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  downloadItem: {
    display: 'flex',
    gap: '16px',
    padding: '16px',
    borderRadius: '16px',
    border: '1px solid',
  },
  thumbnail: {
    position: 'relative' as const,
    width: '140px',
    height: '80px',
    borderRadius: '10px',
    overflow: 'hidden' as const,
    flexShrink: 0,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  duration: {
    position: 'absolute' as const,
    bottom: '4px',
    right: '4px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    fontSize: '11px',
    fontWeight: 500,
    color: '#FFFFFF',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    minWidth: 0,
  },
  titleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  itemTitle: {
    fontSize: '15px',
    fontWeight: 600,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
    flex: 1,
  },
  platform: {
    fontSize: '11px',
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  channel: {
    fontSize: '13px',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  progressBar: {
    height: '6px',
    borderRadius: '3px',
    overflow: 'hidden' as const,
  },
  progressFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease',
  },
  progressInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  actionBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: '16px',
    textAlign: 'center' as const,
    padding: '48px',
  },
};

export default function DownloadsPage() {
  const { t } = useTranslation();
  const { downloads, pauseDownload, resumeDownload, cancelDownload, clearCompleted } = useDownloadStore();

  const activeDownloads = downloads.filter(d => d.status === 'downloading' || d.status === 'paused' || d.status === 'queued');
  const completedDownloads = downloads.filter(d => d.status === 'completed');
  const errorDownloads = downloads.filter(d => d.status === 'error');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckmarkCircle24Filled style={{ color: '#4ADE80' }} />;
      case 'error':
        return <ErrorCircle24Filled style={{ color: '#EF4444' }} />;
      case 'paused':
        return <Clock24Regular style={{ color: '#F59E0B' }} />;
      default:
        return null;
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#4ADE80';
      case 'error':
        return '#EF4444';
      case 'paused':
        return '#F59E0B';
      default:
        return '#6067D6';
    }
  };

  const handleOpenFolder = async (filePath?: string) => {
    if (!filePath) return;
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      await invoke('open_file_location', { path: filePath });
    } catch (error) {
      console.error('Failed to open folder:', error);
    }
  };

  return (
    <div style={styles.root}>
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <Text style={{ ...styles.title, color: tokens.colorNeutralForeground1 }}>
            {t('nav.downloads')}
          </Text>
          <div style={styles.stats}>
            <span style={{ ...styles.statItem, color: '#6067D6' }}>
              {activeDownloads.length} {t('home.activeDownloads')}
            </span>
            <span style={{ ...styles.statItem, color: '#4ADE80' }}>
              {completedDownloads.length} {t('home.completedDownloads')}
            </span>
            {errorDownloads.length > 0 && (
              <span style={{ ...styles.statItem, color: '#EF4444' }}>
                {errorDownloads.length} {t('download.status.error')}
              </span>
            )}
          </div>
        </div>
        {completedDownloads.length > 0 && (
          <Button appearance="subtle" onClick={clearCompleted}>
            {t('common.delete')} {t('home.completedDownloads')}
          </Button>
        )}
      </motion.div>

      <div style={styles.content}>
        {downloads.length === 0 ? (
          <div style={styles.emptyState}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Text style={{ fontSize: '48px', opacity: 0.3 }}>📥</Text>
            </motion.div>
            <Text style={{ fontSize: '18px', fontWeight: 600, color: tokens.colorNeutralForeground1 }}>
              {t('home.emptyDownloads')}
            </Text>
          </div>
        ) : (
          <div style={styles.list}>
            <AnimatePresence>
              {downloads.map((download, index) => (
                <motion.div
                  key={download.id}
                  style={{
                    ...styles.downloadItem,
                    backgroundColor: tokens.colorNeutralBackground2,
                    borderColor: tokens.colorNeutralStroke2,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div style={styles.thumbnail}>
                    <img
                      style={styles.thumbnailImage}
                      src={download.thumbnail}
                      alt={download.title}
                    />
                    {download.duration && (
                      <span style={styles.duration}>{download.duration}</span>
                    )}
                  </div>

                  <div style={styles.info}>
                    <div style={styles.titleRow}>
                      <Text style={{ ...styles.itemTitle, color: tokens.colorNeutralForeground1 }}>
                        {download.title}
                      </Text>
                      <span
                        style={{
                          ...styles.platform,
                          backgroundColor: `${download.platformColor}20`,
                          color: download.platformColor,
                        }}
                      >
                        {download.platform}
                      </span>
                    </div>

                    <Text style={{ ...styles.channel, color: tokens.colorNeutralForeground3 }}>
                      {download.channel}
                    </Text>

                    <div style={styles.progressSection}>
                      <div style={{ ...styles.progressBar, backgroundColor: tokens.colorNeutralBackground4 }}>
                        <div
                          style={{
                            ...styles.progressFill,
                            width: `${download.progress}%`,
                            backgroundColor: getProgressColor(download.status),
                          }}
                        />
                      </div>
                      <div style={{ ...styles.progressInfo, color: tokens.colorNeutralForeground3 }}>
                        <span>
                          {download.downloadedSize || '0 MB'} / {download.size}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {getStatusIcon(download.status)}
                          {download.status === 'downloading' && (
                            <>
                              <span>{download.speed}</span>
                              <span>•</span>
                              <span>{download.progress.toFixed(1)}%</span>
                            </>
                          )}
                          {download.status === 'completed' && t('download.status.completed')}
                          {download.status === 'error' && t('download.status.error')}
                          {download.status === 'paused' && t('download.status.paused')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.actions}>
                    {download.status === 'downloading' && (
                      <motion.button
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: 'rgba(245, 158, 11, 0.15)',
                          color: '#F59E0B',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => pauseDownload(download.id)}
                        title={t('common.pause')}
                      >
                        <Pause24Regular />
                      </motion.button>
                    )}
                    {download.status === 'paused' && (
                      <motion.button
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: 'rgba(74, 222, 128, 0.15)',
                          color: '#4ADE80',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => resumeDownload(download.id)}
                        title={t('common.resume')}
                      >
                        <Play24Regular />
                      </motion.button>
                    )}
                    {download.status === 'completed' && (
                      <motion.button
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: 'rgba(96, 103, 214, 0.15)',
                          color: '#9597F5',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleOpenFolder(download.filePath)}
                        title={t('common.openFolder')}
                      >
                        <Folder24Regular />
                      </motion.button>
                    )}
                    {(download.status === 'downloading' || download.status === 'paused') && (
                      <motion.button
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#EF4444',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => cancelDownload(download.id)}
                        title={t('common.cancel')}
                      >
                        <Dismiss24Regular />
                      </motion.button>
                    )}
                    {(download.status === 'completed' || download.status === 'error') && (
                      <motion.button
                        style={{
                          ...styles.actionBtn,
                          backgroundColor: 'rgba(239, 68, 68, 0.15)',
                          color: '#EF4444',
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => cancelDownload(download.id)}
                        title={t('common.delete')}
                      >
                        <Delete24Regular />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
