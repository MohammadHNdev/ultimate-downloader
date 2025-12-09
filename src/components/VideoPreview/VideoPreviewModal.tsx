import { useState } from 'react';
import {
  Text,
  Button,
  Checkbox,
} from '@fluentui/react-components';
import {
  Dismiss24Regular,
  ArrowDownload24Filled,
  Video24Regular,
  MusicNote224Regular,
  Image24Regular,
  Subtitles24Regular,
} from '@fluentui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modal: {
    width: '100%',
    maxWidth: '600px',
    maxHeight: '90vh',
    backgroundColor: '#111326',
    borderRadius: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    overflow: 'hidden' as const,
    display: 'flex',
    flexDirection: 'column' as const,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  closeButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  content: {
    flex: 1,
    overflow: 'auto' as const,
    padding: '24px',
  },
  videoInfo: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  thumbnail: {
    width: '200px',
    height: '112px',
    borderRadius: '12px',
    overflow: 'hidden' as const,
    flexShrink: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
  },
  videoDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    minWidth: 0,
  },
  videoTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
  },
  videoMeta: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: '12px',
  },
  qualityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '8px',
  },
  qualityOption: {
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '12px',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  qualityOptionSelected: {
    borderColor: '#6067D6',
    backgroundColor: 'rgba(96, 103, 214, 0.15)',
  },
  qualityLabel: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  qualitySize: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
    marginTop: '4px',
  },
  formatTabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
  },
  formatTab: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  formatTabActive: {
    backgroundColor: 'rgba(96, 103, 214, 0.15)',
    borderColor: '#6067D6',
    color: '#9597F5',
  },
  optionsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '16px',
    marginTop: '16px',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  selectedInfo: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  downloadBtn: {
    minWidth: '160px',
  },
};

export interface VideoInfo {
  id: string;
  title: string;
  channel: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
  uploadDate: string;
  platform: string;
  formats: FormatOption[];
}

export interface FormatOption {
  id: string;
  quality: string;
  extension: string;
  size: string;
  type: 'video' | 'audio' | 'video+audio';
  hasAudio: boolean;
  fps?: number;
}

interface VideoPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoInfo: VideoInfo | null;
  onDownload: (formatId: string, options: DownloadOptions) => void;
}

interface DownloadOptions {
  downloadSubtitles: boolean;
  downloadThumbnail: boolean;
  audioOnly: boolean;
}

type FormatType = 'video' | 'audio';

export default function VideoPreviewModal({
  isOpen,
  onClose,
  videoInfo,
  onDownload,
}: VideoPreviewModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>('');
  const [formatType, setFormatType] = useState<FormatType>('video');
  const [downloadSubtitles, setDownloadSubtitles] = useState(false);
  const [downloadThumbnail, setDownloadThumbnail] = useState(false);

  if (!videoInfo) return null;

  const filteredFormats = videoInfo.formats.filter((f) =>
    formatType === 'video' ? f.type !== 'audio' : f.type === 'audio'
  );

  const selectedFormatInfo = videoInfo.formats.find((f) => f.id === selectedFormat);

  const handleDownload = () => {
    if (selectedFormat) {
      onDownload(selectedFormat, {
        downloadSubtitles,
        downloadThumbnail,
        audioOnly: formatType === 'audio',
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          style={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            style={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.header}>
              <Text style={styles.headerTitle}>Download Options</Text>
              <motion.button
                style={styles.closeButton}
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Dismiss24Regular />
              </motion.button>
            </div>

            <div style={styles.content}>
              <div style={styles.videoInfo}>
                <div style={styles.thumbnail}>
                  <img
                    style={styles.thumbnailImage}
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                  />
                </div>
                <div style={styles.videoDetails}>
                  <Text style={styles.videoTitle}>{videoInfo.title}</Text>
                  <Text style={styles.videoMeta}>{videoInfo.channel}</Text>
                  <Text style={styles.videoMeta}>
                    {videoInfo.duration} • {videoInfo.viewCount} views
                  </Text>
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>Format Type</div>
                <div style={styles.formatTabs}>
                  <motion.button
                    style={{
                      ...styles.formatTab,
                      ...(formatType === 'video' ? styles.formatTabActive : {}),
                    }}
                    onClick={() => {
                      setFormatType('video');
                      setSelectedFormat('');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Video24Regular />
                    Video
                  </motion.button>
                  <motion.button
                    style={{
                      ...styles.formatTab,
                      ...(formatType === 'audio' ? styles.formatTabActive : {}),
                    }}
                    onClick={() => {
                      setFormatType('audio');
                      setSelectedFormat('');
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <MusicNote224Regular />
                    Audio Only
                  </motion.button>
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>
                  {formatType === 'video' ? <Video24Regular /> : <MusicNote224Regular />}
                  Quality
                </div>
                <div style={styles.qualityGrid}>
                  {filteredFormats.map((format) => (
                    <motion.div
                      key={format.id}
                      style={{
                        ...styles.qualityOption,
                        ...(selectedFormat === format.id ? styles.qualityOptionSelected : {}),
                      }}
                      onClick={() => setSelectedFormat(format.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <span style={styles.qualityLabel}>
                        {format.quality}
                        {format.fps && format.fps > 30 && ` ${format.fps}fps`}
                      </span>
                      <span style={styles.qualitySize}>
                        {format.extension.toUpperCase()} • {format.size}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div style={styles.section}>
                <div style={styles.sectionTitle}>Additional Options</div>
                <div style={styles.optionsRow}>
                  <Checkbox
                    checked={downloadSubtitles}
                    onChange={(_, data) => setDownloadSubtitles(!!data.checked)}
                    label={
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Subtitles24Regular />
                        Download Subtitles
                      </span>
                    }
                  />
                  <Checkbox
                    checked={downloadThumbnail}
                    onChange={(_, data) => setDownloadThumbnail(!!data.checked)}
                    label={
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Image24Regular />
                        Save Thumbnail
                      </span>
                    }
                  />
                </div>
              </div>
            </div>

            <div style={styles.footer}>
              <span style={styles.selectedInfo}>
                {selectedFormatInfo
                  ? `${selectedFormatInfo.quality} • ${selectedFormatInfo.extension.toUpperCase()} • ${selectedFormatInfo.size}`
                  : 'Select a quality option'}
              </span>
              <Button
                style={styles.downloadBtn}
                appearance="primary"
                icon={<ArrowDownload24Filled />}
                onClick={handleDownload}
                disabled={!selectedFormat}
              >
                Download
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
