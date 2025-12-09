import { useState } from 'react';
import {
  Text,
  Input,
  Dropdown,
  Option,
} from '@fluentui/react-components';
import {
  Search24Regular,
  Grid24Regular,
  List24Regular,
  Play24Filled,
  Folder24Regular,
  Delete24Regular,
} from '@fluentui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';

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
    color: '#FFFFFF',
  },
  stats: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
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
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255, 255, 255, 0.4)',
    pointerEvents: 'none' as const,
  },
  searchInput: {
    width: '100%',
    paddingLeft: '40px',
  },
  viewToggle: {
    display: 'flex',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: 'rgba(255, 255, 255, 0.5)',
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
    paddingRight: '8px',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    overflow: 'hidden' as const,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  gridThumbnail: {
    position: 'relative' as const,
    aspectRatio: '16/9',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    right: '8px',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    fontSize: '11px',
    fontWeight: 500,
    color: '#FFFFFF',
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
    color: '#FFFFFF',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  gridMeta: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  listThumbnail: {
    width: '120px',
    height: '68px',
    borderRadius: '8px',
    overflow: 'hidden' as const,
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
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
    color: '#FFFFFF',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  listMeta: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
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
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
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
  emptyIcon: {
    fontSize: '64px',
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  emptyText: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
    maxWidth: '400px',
  },
};

interface LibraryItem {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  size: string;
  downloadedAt: string;
  platform: string;
}

// Mock data
const mockLibrary: LibraryItem[] = [
  {
    id: '1',
    title: 'Amazing Nature Documentary - Wildlife Adventures',
    channel: 'Nature Channel',
    thumbnail: 'https://picsum.photos/seed/1/400/225',
    duration: '45:32',
    size: '1.2 GB',
    downloadedAt: '2024-01-15',
    platform: 'YouTube',
  },
  {
    id: '2',
    title: 'Learn React in 2024 - Complete Tutorial',
    channel: 'Code Academy',
    thumbnail: 'https://picsum.photos/seed/2/400/225',
    duration: '2:15:45',
    size: '2.8 GB',
    downloadedAt: '2024-01-14',
    platform: 'YouTube',
  },
  {
    id: '3',
    title: 'Cooking Masterclass - Italian Cuisine',
    channel: 'Chef Pro',
    thumbnail: 'https://picsum.photos/seed/3/400/225',
    duration: '32:18',
    size: '850 MB',
    downloadedAt: '2024-01-13',
    platform: 'Vimeo',
  },
  {
    id: '4',
    title: 'Viral Dance Challenge Compilation',
    channel: '@dancequeen',
    thumbnail: 'https://picsum.photos/seed/4/400/225',
    duration: '8:42',
    size: '320 MB',
    downloadedAt: '2024-01-12',
    platform: 'TikTok',
  },
  {
    id: '5',
    title: 'Music Production Tips & Tricks',
    channel: 'Beat Makers',
    thumbnail: 'https://picsum.photos/seed/5/400/225',
    duration: '18:55',
    size: '520 MB',
    downloadedAt: '2024-01-11',
    platform: 'YouTube',
  },
];

type ViewMode = 'grid' | 'list';
type SortOption = 'newest' | 'oldest' | 'name' | 'size';

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [library] = useState<LibraryItem[]>(mockLibrary);

  const filteredLibrary = library.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.channel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedLibrary = [...filteredLibrary].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.downloadedAt).getTime() - new Date(a.downloadedAt).getTime();
      case 'oldest':
        return new Date(a.downloadedAt).getTime() - new Date(b.downloadedAt).getTime();
      case 'name':
        return a.title.localeCompare(b.title);
      case 'size':
        return parseFloat(b.size) - parseFloat(a.size);
      default:
        return 0;
    }
  });

  return (
    <div style={styles.root}>
      <motion.div
        style={styles.header}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={styles.titleRow}>
          <Text style={styles.title}>Library</Text>
          <Text style={styles.stats}>
            {library.length} videos • {library.reduce((acc, item) => acc + parseFloat(item.size), 0).toFixed(1)} GB
          </Text>
        </div>

        <div style={styles.controls}>
          <div style={styles.searchWrapper}>
            <Search24Regular style={styles.searchIcon} />
            <Input
              style={styles.searchInput}
              placeholder="Search your library..."
              value={searchQuery}
              onChange={(_, data) => setSearchQuery(data.value)}
            />
          </div>

          <Dropdown
            value={sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}
            selectedOptions={[sortBy]}
            onOptionSelect={(_, data) => setSortBy(data.optionValue as SortOption)}
            style={{ minWidth: '140px' }}
          >
            <Option value="newest">Newest</Option>
            <Option value="oldest">Oldest</Option>
            <Option value="name">Name</Option>
            <Option value="size">Size</Option>
          </Dropdown>

          <div style={styles.viewToggle}>
            <motion.button
              style={{
                ...styles.viewButton,
                ...(viewMode === 'grid' ? styles.viewButtonActive : {}),
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
            <span style={styles.emptyIcon}>📚</span>
            <Text style={styles.emptyTitle}>Your library is empty</Text>
            <Text style={styles.emptyText}>
              Downloaded videos will appear here. Start downloading to build your collection!
            </Text>
          </div>
        ) : viewMode === 'grid' ? (
          <div style={styles.grid}>
            <AnimatePresence>
              {sortedLibrary.map((item, index) => (
                <motion.div
                  key={item.id}
                  style={styles.gridItem}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <div style={styles.gridThumbnail}>
                    <img
                      style={styles.gridThumbnailImage}
                      src={item.thumbnail}
                      alt={item.title}
                    />
                    <motion.div
                      style={styles.playOverlay}
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                    >
                      <button style={styles.playButton}>
                        <Play24Filled />
                      </button>
                    </motion.div>
                    <span style={styles.duration}>{item.duration}</span>
                  </div>
                  <div style={styles.gridInfo}>
                    <Text style={styles.gridTitle}>{item.title}</Text>
                    <div style={styles.gridMeta}>
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
                  style={styles.listItem}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <div style={styles.listThumbnail}>
                    <img
                      style={styles.listThumbnailImage}
                      src={item.thumbnail}
                      alt={item.title}
                    />
                  </div>
                  <div style={styles.listInfo}>
                    <Text style={styles.listTitle}>{item.title}</Text>
                    <Text style={styles.listMeta}>
                      {item.channel} • {item.duration} • {item.size} • {item.platform}
                    </Text>
                  </div>
                  <div style={styles.listActions}>
                    <motion.button
                      style={styles.actionButton}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Play24Filled />
                    </motion.button>
                    <motion.button
                      style={styles.actionButton}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Folder24Regular />
                    </motion.button>
                    <motion.button
                      style={styles.actionButton}
                      whileHover={{ scale: 1.1, color: '#EF4444' }}
                      whileTap={{ scale: 0.9 }}
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
