import { Text, ProgressBar } from '@fluentui/react-components';
import {
  Pause20Filled,
  Play20Filled,
  Dismiss20Regular,
  Folder20Regular,
  CheckmarkCircle20Filled,
  ErrorCircle20Regular,
  ArrowSync20Regular,
} from '@fluentui/react-icons';
import { motion } from 'framer-motion';

const styles = {
  root: {
    position: 'relative' as const,
    display: 'flex',
    gap: '16px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    overflow: 'hidden' as const,
  },
  thumbnail: {
    position: 'relative' as const,
    width: '120px',
    height: '68px',
    borderRadius: '8px',
    overflow: 'hidden' as const,
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    minWidth: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
  },
  titleSection: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  subtitle: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '2px',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexShrink: 0,
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  progressBar: {
    height: '4px',
    borderRadius: '2px',
  },
  progressInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 500,
  },
  statusDownloading: {
    backgroundColor: 'rgba(96, 103, 214, 0.15)',
    color: '#9597F5',
  },
  statusCompleted: {
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    color: '#4ADE80',
  },
  statusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: '#F87171',
  },
  platformIndicator: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    width: '3px',
    height: '100%',
    borderRadius: '0 4px 4px 0',
  },
};

export type DownloadStatus = 'downloading' | 'completed' | 'error' | 'paused' | 'queued';

export interface DownloadItem {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  status: DownloadStatus;
  progress: number;
  speed?: string;
  eta?: string;
  size?: string;
  downloadedSize?: string;
  platform: string;
  platformColor: string;
  error?: string;
  filePath?: string;
}

interface DownloadCardProps {
  item: DownloadItem;
  onPause?: () => void;
  onResume?: () => void;
  onCancel?: () => void;
  onOpenFolder?: () => void;
}

export default function DownloadCard({
  item,
  onPause,
  onResume,
  onCancel,
  onOpenFolder,
}: DownloadCardProps) {
  const getStatusBadge = () => {
    switch (item.status) {
      case 'downloading':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusDownloading }}>
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ display: 'flex' }}
            >
              <ArrowSync20Regular />
            </motion.span>
            Downloading
          </span>
        );
      case 'completed':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusCompleted }}>
            <CheckmarkCircle20Filled />
            Completed
          </span>
        );
      case 'error':
        return (
          <span style={{ ...styles.statusBadge, ...styles.statusError }}>
            <ErrorCircle20Regular />
            Error
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      style={styles.root}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      layout
      whileHover={{ scale: 1.01 }}
    >
      <motion.div
        style={{ ...styles.platformIndicator, backgroundColor: item.platformColor }}
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.3 }}
      />

      <div style={styles.thumbnail}>
        {item.thumbnail ? (
          <img style={styles.thumbnailImage} src={item.thumbnail} alt={item.title} />
        ) : (
          <div style={styles.thumbnailImage} />
        )}
        <span style={styles.duration}>{item.duration}</span>
      </div>

      <div style={styles.content}>
        <div style={styles.header}>
          <div style={styles.titleSection}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle}>{item.channel}</Text>
          </div>

          <div style={styles.actions}>
            {item.status === 'downloading' && onPause && (
              <motion.button
                style={styles.actionButton}
                onClick={onPause}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Pause20Filled />
              </motion.button>
            )}
            {item.status === 'paused' && onResume && (
              <motion.button
                style={styles.actionButton}
                onClick={onResume}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Play20Filled />
              </motion.button>
            )}
            {item.status === 'completed' && onOpenFolder && (
              <motion.button
                style={styles.actionButton}
                onClick={onOpenFolder}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Folder20Regular />
              </motion.button>
            )}
            {(item.status === 'downloading' || item.status === 'paused') && onCancel && (
              <motion.button
                style={styles.actionButton}
                onClick={onCancel}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Dismiss20Regular />
              </motion.button>
            )}
          </div>
        </div>

        <div style={styles.progressSection}>
          {(item.status === 'downloading' || item.status === 'paused') && (
            <>
              <ProgressBar
                style={styles.progressBar}
                value={item.progress / 100}
                color={item.status === 'paused' ? 'warning' : 'brand'}
              />
              <div style={styles.progressInfo}>
                <span>{item.downloadedSize} / {item.size}</span>
                <span>
                  {item.status === 'downloading' && item.speed && `${item.speed} • `}
                  {item.progress.toFixed(1)}%
                  {item.status === 'downloading' && item.eta && ` • ${item.eta} left`}
                </span>
              </div>
            </>
          )}
          {item.status === 'completed' && (
            <div style={styles.progressInfo}>
              <span>{item.size}</span>
              {getStatusBadge()}
            </div>
          )}
          {item.status === 'error' && (
            <div style={styles.progressInfo}>
              <span style={{ color: '#F87171' }}>{item.error || 'Download failed'}</span>
              {getStatusBadge()}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
