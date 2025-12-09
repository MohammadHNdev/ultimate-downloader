import { makeStyles, Text } from '@fluentui/react-components';
import {
  Subtract20Regular,
  Square20Regular,
  Dismiss20Regular,
} from '@fluentui/react-icons';
import { motion } from 'framer-motion';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '40px',
    backgroundColor: '#0A0B14',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    paddingLeft: '16px',
    paddingRight: '0',
    userSelect: 'none',
  },
  dragRegion: {
    flex: 1,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  logoIcon: {
    width: '24px',
    height: '24px',
    background: 'linear-gradient(135deg, #6067D6 0%, #9597F5 100%)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
  },
  title: {
    fontSize: '13px',
    fontWeight: 600,
    color: 'rgba(255, 255, 255, 0.9)',
    letterSpacing: '0.3px',
  },
  controls: {
    display: 'flex',
    height: '100%',
  },
  controlButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '46px',
    height: '100%',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: '#FFFFFF',
    },
  },
  closeButton: {
    '&:hover': {
      backgroundColor: '#E81123',
      color: '#FFFFFF',
    },
  },
});

export default function TitleBar() {
  const styles = useStyles();

  const handleMinimize = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().minimize();
  };

  const handleMaximize = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const window = getCurrentWindow();
    const isMaximized = await window.isMaximized();
    if (isMaximized) {
      await window.unmaximize();
    } else {
      await window.maximize();
    }
  };

  const handleClose = async () => {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().close();
  };

  return (
    <div className={styles.root}>
      <div className={styles.dragRegion} data-tauri-drag-region>
        <div className={styles.logo}>
          <motion.div
            className={styles.logoIcon}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ⬇
          </motion.div>
          <Text className={styles.title}>Ultimate Downloader</Text>
        </div>
      </div>

      <div className={styles.controls}>
        <motion.button
          className={styles.controlButton}
          onClick={handleMinimize}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Subtract20Regular />
        </motion.button>
        <motion.button
          className={styles.controlButton}
          onClick={handleMaximize}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Square20Regular />
        </motion.button>
        <motion.button
          className={`${styles.controlButton} ${styles.closeButton}`}
          onClick={handleClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Dismiss20Regular />
        </motion.button>
      </div>
    </div>
  );
}
