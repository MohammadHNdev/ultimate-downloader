import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Text,
  Input,
  Dropdown,
  Option,
  tokens,
} from '@fluentui/react-components';
import {
  Search24Regular,
  Grid24Regular,
  List24Regular,
  Play24Filled,
  Folder24Regular,
  Delete24Regular,
  VideoClip24Regular,
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
    flexDirection: 'column' as const,
    gap: '16px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
  },
  stats: {
    fontSize: '14px',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  searchWrapper: {
    flex: 1,
    maxWidth: '400px',
    position: 'relative' as const,
  },
  searchIcon: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none' as const,
  },
  viewToggle: {
    display: 'flex',
    borderRadius: '10px',
    padding: '4px',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  viewButtonActive: {
    backgroundColor: 'rgba(96, 103, 214, 0.2)',
    color: '#9597F5',
  },
  content: {
    flex: 1,
    overflow: 'auto' as const,
    paddingLeft: '8px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '16px',
  },
  list: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    borderRadius: '12px',
    overflow: 'hidden' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  gridThumbnail: {
    position: 'relative' as const,
    aspectRatio: '16/9',
    overflow: 'hidden' as const,
  },
  gridThumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  playOverlay: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    opacity: 0,
    transition: 'opacity 0.2s ease',
  },
  playButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    color: '#0A0B14',
    border: 'none',
    cursor: 'pointer',
  },
  duration: {
    position: 'absolute' as const,
    bottom: '8px',
    left: '8px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    fontSize: '11px',
    fontWeight: 500,
    color: '#FFFFFF',
  },
  platform: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: 600,
  },
  gridInfo: {
    padding: '12px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
  },
  gridTitle: {
    fontSize: '14px',
    fontWeight: 500,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  gridMeta: {
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  listThumbnail: {
    width: '120px',
    height: '68px',
    borderRadius: '8px',
    overflow: 'hidden' as const,
    flexShrink: 0,
  },
  listThumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  listInfo: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    fontSize: '14px',
    fontWeight: 500,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  listMeta: {
    fontSize: '12px',
    marginTop: '4px',
  },
  listActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
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

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name' | 'size';

export default function LibraryPage() {
  const { t } = useTranslation();
  const { downloads, removeDownload } = useDownloadStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Only show completed downloads in library
  const completedDownloads = downloads.filter(d => d.status === 'completed');

  const filteredLibrary = completedDownloads.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedLibrary = [...filteredLibrary].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return -1; // Keep newest first (already in order from store)
      case 'oldest':
        return 1;
      case 'name':
        return a.title.localeCompare(b.title);
      case 'size':
        return parseFloat(b.size || '0') - parseFloat(a.size || '0');
      default:
        return 0;
    }
  });

  const totalSize = completedDownloads.reduce((acc, item) => {
    const size = parseFloat(item.size?.replace(/[^\d.]/g, '') || '0');
    return acc + size;
  }, 0);

  const handlePlay = async (filePath?: string) => {
    if (!filePath) return;
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(filePath);
    } catch (error) {
      console.error('Failed to play file:', error);
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
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={styles.titleRow}>
          <Text style={{ ...styles.title, color: tokens.colorNeutralForeground1 }}>
            {t('library.title')}
          </Text>
          <Text style={{ ...styles.stats, color: tokens.colorNeutralForeground3 }}>
            {completedDownloads.length} {t('library.videos')} • {totalSize.toFixed(1)} MB
          </Text>
        </div>

        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <Input
              placeholder={t('library.search')}
              value={searchQuery}
              onChange={(_, data) => setSearchQuery(data.value)}
              style={{ width: '100%', paddingRight: '40px' }}
            />
            <Search24Regular style={{ ...styles.searchIcon, color: tokens.colorNeutralForeground3 }} />
          </div>

          <Dropdown
            value={t(`library.sort.${sortBy}`)}
            selectedOptions={[sortBy]}
            onOptionSelect={(_, data) => setSortBy(data.optionValue as SortOption)}
            style={{ minWidth: '140px' }}
          >
            <Option value="newest">{t('library.sort.newest')}</Option>
            <Option value="oldest">{t('library.sort.oldest')}</Option>
            <Option value="name">{t('library.sort.name')}</Option>
            <Option value="size">{t('library.sort.size')}</Option>
          </Dropdown>

          <div style={{ ...styles.viewToggle, backgroundColor: tokens.colorNeutralBackground3 }}>
            <motion.button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'grid' ? styles.viewButtonActive : {}),
                color: viewMode === 'grid' ? '#9597F5' : tokens.colorNeutralForeground3,
              }}
              onClick={() => setViewMode('grid')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Grid24Regular />
            </motion.button>
            <motion.button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'list' ? styles.viewButtonActive : {}),
                color: viewMode === 'list' ? '#9597F5' : tokens.colorNeutralForeground3,
              }}
              onClick={() => setViewMode('list')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <List24Regular />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div style={styles.content}>
        {sortedLibrary.length === 0 ? (
          <div style={styles.emptyState}>
            <VideoClip24Regular style={{ fontSize: '64px', opacity: 0.3, color: tokens.colorNeutralForeground3 }} />
            <Text style={{ fontSize: '18px', fontWeight: 600, color: tokens.colorNeutralForeground1 }}>
              {t('library.empty.title')}
            </Text>
            <Text style={{ fontSize: '14px', color: tokens.colorNeutralForeground3, maxWidth: '400px' }}>
              {t('library.empty.description')}
            </Text>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={styles.grid}>
            <AnimatePresence>
              {sortedLibrary.map((item, index) => (
                <motion.div
                  key={item.id}
                  style={{
                    ...styles.gridItem,
                    backgroundColor: tokens.colorNeutralBackground2,
                    border: `1px solid ${tokens.colorNeutralStroke2}`,
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <div style={{ ...styles.gridThumbnail, backgroundColor: tokens.colorNeutralBackground4 }}>
                    <img
                      style={styles.gridThumbnailImage}
                      src={item.thumbnail}
                      alt={item.title}
                    />
                    <motion.div
                      style={styles.playOverlay}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      onClick={() => handlePlay(item.filePath)}
                    >
                      <button style={styles.playButton}>
                        <Play24Filled />
                      </button>
                    </motion.div>
                    {item.duration && <span style={styles.duration}>{item.duration}</span>}
                    <span style={{
                      ...styles.platform,
                      backgroundColor: `${item.platformColor}20`,
                      color: item.platformColor,
                    }}>
                      {item.platform}
                    </span>
                  </div>
                  <div style={styles.gridInfo}>
                    <Text style={{ ...styles.gridTitle, color: tokens.colorNeutralForeground1 }}>{item.title}</Text>
                    <div style={{ ...styles.gridMeta, color: tokens.colorNeutralForeground3 }}>
                      <span>{item.channel}</span>
                      <span>•</span>
                      <span>{item.size}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div style={styles.list}>
            <AnimatePresence>
              {sortedLibrary.map((item, index) => (
                <motion.div
                  key={item.id}
                  style={{
                    ...styles.listItem,
                    backgroundColor: tokens.colorNeutralBackground2,
                    border: `1px solid ${tokens.colorNeutralStroke2}`,
                  }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <div style={{ ...styles.listThumbnail, backgroundColor: tokens.colorNeutralBackground4 }}>
                    <img
                      style={styles.listThumbnailImage}
                      src={item.thumbnail}
                      alt={item.title}
                    />
                  </div>
                  <div style={styles.listInfo}>
                    <Text style={{ ...styles.listTitle, color: tokens.colorNeutralForeground1 }}>{item.title}</Text>
                    <Text style={{ ...styles.listMeta, color: tokens.colorNeutralForeground3 }}>
                      {item.channel} • {item.duration} • {item.size} • {item.platform}
                    </Text>
                  </div>
                  <div style={styles.listActions}>
                    <motion.button
                      style={{ ...styles.actionButton, color: tokens.colorNeutralForeground3 }}
                      whileHover={{ scale: 1.1, color: '#9597F5' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handlePlay(item.filePath)}
                    >
                      <Play24Filled />
                    </motion.button>
                    <motion.button
                      style={{ ...styles.actionButton, color: tokens.colorNeutralForeground3 }}
                      whileHover={{ scale: 1.1, color: '#9597F5' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleOpenFolder(item.filePath)}
                    >
                      <Folder24Regular />
                    </motion.button>
                    <motion.button
                      style={{ ...styles.actionButton, color: tokens.colorNeutralForeground3 }}
                      whileHover={{ scale: 1.1, color: '#EF4444' }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeDownload(item.id)}
                    >
                      <Delete24Regular />
                    </motion.button>
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
