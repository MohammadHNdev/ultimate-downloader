import { Text, tokens } from '@fluentui/react-components';
import {
  Subtract20Regular,
  Square20Regular,
  Dismiss20Regular,
  ArrowDownload24Filled,
} from '@fluentui/react-icons';
import { motion } from 'framer-motion';

const styles = {
  root: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '40px',
    paddingLeft: '16px',
    paddingRight: '0',
    userSelect: 'none' as const,
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
  controls: {
    display: 'flex',
    height: '100%',
  },
};

export default function TitleBar() {
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
    <div style={{
      ...styles.root,
      backgroundColor: tokens.colorNeutralBackground1,
      borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    }}>
      <div style={styles.dragRegion} data-tauri-drag-region>
        <div style={styles.logo}>
          <motion.div
            style={styles.logoIcon}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDownload24Filled style={{ fontSize: '16px' }} />
          </motion.div>
          <Text style={{ fontSize: '13px', fontWeight: 600, color: tokens.colorNeutralForeground1, letterSpacing: '0.3px' }}>
            Ultimate Downloader
          </Text>
        </div>
      </div>

      <div style={styles.controls}>
        <motion.button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '100%',
            border: 'none',
            background: 'transparent',
            color: tokens.colorNeutralForeground2,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={handleMinimize}
          whileHover={{ scale: 1.05, backgroundColor: tokens.colorNeutralBackground1Hover }}
          whileTap={{ scale: 0.95 }}
        >
          <Subtract20Regular />
        </motion.button>
        <motion.button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '100%',
            border: 'none',
            background: 'transparent',
            color: tokens.colorNeutralForeground2,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={handleMaximize}
          whileHover={{ scale: 1.05, backgroundColor: tokens.colorNeutralBackground1Hover }}
          whileTap={{ scale: 0.95 }}
        >
          <Square20Regular />
        </motion.button>
        <motion.button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '100%',
            border: 'none',
            background: 'transparent',
            color: tokens.colorNeutralForeground2,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
          onClick={handleClose}
          whileHover={{ scale: 1.05, backgroundColor: '#E81123' }}
          whileTap={{ scale: 0.95 }}
        >
          <Dismiss20Regular />
        </motion.button>
      </div>
    </div>
  );
}
