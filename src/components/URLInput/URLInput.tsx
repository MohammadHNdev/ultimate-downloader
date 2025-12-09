import { useState, useCallback } from 'react';
import { Spinner } from '@fluentui/react-components';
import {
  Link24Regular,
  ArrowDownload24Filled,
  Clipboard24Regular,
  Dismiss20Regular,
} from '@fluentui/react-icons';
import { motion, AnimatePresence } from 'framer-motion';

const styles = {
  root: {
    position: 'relative' as const,
    width: '100%',
    maxWidth: '720px',
  },
  inputWrapper: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '4px',
    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  inputWrapperHover: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  inputWrapperFocus: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderColor: '#6067D6',
    boxShadow: '0 0 0 3px rgba(96, 103, 214, 0.15)',
  },
  inputWrapperError: {
    borderColor: '#EF4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.15)',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '48px',
    height: '48px',
    color: 'rgba(255, 255, 255, 0.4)',
    flexShrink: 0,
  },
  input: {
    flex: 1,
    height: '48px',
    border: 'none',
    background: 'transparent',
    color: '#FFFFFF',
    fontSize: '15px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    paddingRight: '4px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44px',
    paddingLeft: '20px',
    paddingRight: '20px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #6067D6 0%, #7075E3 100%)',
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
    gap: '8px',
    transition: 'all 0.2s ease',
  },
  downloadButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  errorMessage: {
    position: 'absolute' as const,
    bottom: '-28px',
    left: '16px',
    color: '#EF4444',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  platformBadge: {
    position: 'absolute' as const,
    top: '-10px',
    right: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    backgroundColor: 'rgba(15, 15, 25, 0.9)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    fontSize: '12px',
    fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    zIndex: 10,
  },
  platformIcon: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
  },
};

interface URLInputProps {
  onSubmit: (url: string) => void;
  isLoading?: boolean;
}

const platformPatterns = [
  { name: 'YouTube', pattern: /youtube\.com|youtu\.be/i, color: '#FF0000' },
  { name: 'Instagram', pattern: /instagram\.com/i, color: '#E4405F' },
  { name: 'TikTok', pattern: /tiktok\.com/i, color: '#00F2EA' },
  { name: 'Twitter', pattern: /twitter\.com|x\.com/i, color: '#1DA1F2' },
  { name: 'Facebook', pattern: /facebook\.com|fb\.watch/i, color: '#1877F2' },
  { name: 'Vimeo', pattern: /vimeo\.com/i, color: '#1AB7EA' },
  { name: 'Twitch', pattern: /twitch\.tv/i, color: '#9146FF' },
  { name: 'Reddit', pattern: /reddit\.com/i, color: '#FF4500' },
  { name: 'Spotify', pattern: /spotify\.com/i, color: '#1DB954' },
  { name: 'SoundCloud', pattern: /soundcloud\.com/i, color: '#FF5500' },
];

function detectPlatform(url: string) {
  for (const platform of platformPatterns) {
    if (platform.pattern.test(url)) {
      return platform;
    }
  }
  return null;
}

export default function URLInput({ onSubmit, isLoading = false }: URLInputProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [platform, setPlatform] = useState<ReturnType<typeof detectPlatform>>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrl(value);
    setError('');
    setPlatform(detectPlatform(value));
  }, []);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      setUrl(text);
      setError('');
      setPlatform(detectPlatform(text));
    } catch {
      setError('Could not access clipboard');
    }
  }, []);

  const handleClear = useCallback(() => {
    setUrl('');
    setError('');
    setPlatform(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!url.trim()) {
      setError('Please enter a URL');
      return;
    }

    try {
      new URL(url);
      onSubmit(url);
    } catch {
      setError('Please enter a valid URL');
    }
  }, [url, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isLoading) {
        handleSubmit();
      }
    },
    [handleSubmit, isLoading]
  );

  return (
    <div style={styles.root}>
      <AnimatePresence>
        {platform && (
          <motion.div
            style={{ ...styles.platformBadge, color: platform.color }}
            initial={{ opacity: 0, y: -10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
          >
            <span
              style={{ ...styles.platformIcon, backgroundColor: platform.color }}
            />
            {platform.name}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        style={{
          ...styles.inputWrapper,
          ...(error ? styles.inputWrapperError : {}),
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div style={styles.iconWrapper}>
          <Link24Regular />
        </div>

        <input
          style={styles.input}
          type="text"
          placeholder="Paste video URL here... (YouTube, Instagram, TikTok, etc.)"
          value={url}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />

        <div style={styles.actions}>
          <AnimatePresence>
            {url && (
              <motion.button
                style={styles.actionButton}
                onClick={handleClear}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Dismiss20Regular />
              </motion.button>
            )}
          </AnimatePresence>

          {!url && (
            <motion.button
              style={styles.actionButton}
              onClick={handlePaste}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Clipboard24Regular />
            </motion.button>
          )}

          <motion.button
            style={{
              ...styles.downloadButton,
              ...(isLoading || !url ? styles.downloadButtonDisabled : {}),
            }}
            onClick={handleSubmit}
            disabled={isLoading || !url}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {isLoading ? (
              <Spinner size="tiny" appearance="inverted" />
            ) : (
              <>
                <ArrowDownload24Filled />
                Download
              </>
            )}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            style={styles.errorMessage}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
