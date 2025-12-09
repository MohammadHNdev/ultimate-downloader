import { Tooltip } from '@fluentui/react-components';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home24Regular,
  Home24Filled,
  Settings24Regular,
  Settings24Filled,
  Library24Regular,
  Library24Filled,
  ArrowDownload24Regular,
  ArrowDownload24Filled,
} from '@fluentui/react-icons';
import { motion } from 'framer-motion';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '68px',
    height: '100%',
    backgroundColor: '#0A0B14',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    padding: '16px 0',
    gap: '8px',
    alignItems: 'center',
  },
  navSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  navItem: {
    position: 'relative' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '44px',
    height: '44px',
    borderRadius: '12px',
    border: 'none',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.5)',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  navItemActive: {
    backgroundColor: 'rgba(96, 103, 214, 0.15)',
    color: '#6067D6',
  },
  activeIndicator: {
    position: 'absolute' as const,
    left: '-12px',
    width: '3px',
    height: '20px',
    backgroundColor: '#6067D6',
    borderRadius: '0 4px 4px 0',
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    paddingTop: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  },
  downloadCount: {
    position: 'absolute' as const,
    top: '4px',
    right: '4px',
    minWidth: '18px',
    height: '18px',
    borderRadius: '9px',
    backgroundColor: '#6067D6',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
  },
};

interface NavItemProps {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  path: string;
  badge?: number;
}

function NavItem({ icon, activeIcon, label, path, badge }: NavItemProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === path;

  return (
    <Tooltip content={label} relationship="label" positioning="after">
      <motion.button
        style={{
          ...styles.navItem,
          ...(isActive ? styles.navItemActive : {}),
        }}
        onClick={() => navigate(path)}
        whileHover={{ scale: 1.05, backgroundColor: isActive ? 'rgba(96, 103, 214, 0.25)' : 'rgba(96, 103, 214, 0.1)' }}
        whileTap={{ scale: 0.95 }}
      >
        {isActive && (
          <motion.div
            style={styles.activeIndicator}
            layoutId="activeIndicator"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          />
        )}
        {isActive ? activeIcon : icon}
        {badge !== undefined && badge > 0 && (
          <motion.span
            style={styles.downloadCount}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            {badge > 99 ? '99+' : badge}
          </motion.span>
        )}
      </motion.button>
    </Tooltip>
  );
}

export default function Sidebar() {
  // TODO: Get active downloads count from store
  const activeDownloads = 0;

  return (
    <nav style={styles.root}>
      <div style={styles.navSection}>
        <NavItem
          icon={<Home24Regular />}
          activeIcon={<Home24Filled />}
          label="Home"
          path="/"
        />
        <NavItem
          icon={<ArrowDownload24Regular />}
          activeIcon={<ArrowDownload24Filled />}
          label="Downloads"
          path="/downloads"
          badge={activeDownloads}
        />
        <NavItem
          icon={<Library24Regular />}
          activeIcon={<Library24Filled />}
          label="Library"
          path="/library"
        />
      </div>

      <div style={styles.bottomSection}>
        <NavItem
          icon={<Settings24Regular />}
          activeIcon={<Settings24Filled />}
          label="Settings"
          path="/settings"
        />
      </div>
    </nav>
  );
}
