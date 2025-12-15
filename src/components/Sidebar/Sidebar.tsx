import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { tokens } from '@fluentui/react-components';
import {
  Home24Regular,
  Home24Filled,
  Settings24Regular,
  Settings24Filled,
  Library24Regular,
  Library24Filled,
  ArrowDownload24Regular,
  ArrowDownload24Filled,
  Heart24Regular,
  Heart24Filled,
} from '@fluentui/react-icons';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '68px',
    height: '100%',
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
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activeIndicator: {
    position: 'absolute' as const,
    right: '-12px', // RTL: indicator on right
    width: '3px',
    height: '20px',
    backgroundColor: '#6067D6',
    borderRadius: '4px 0 0 4px', // RTL: rounded on left
  },
  bottomSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    paddingTop: '16px',
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
    <button
      style={{
        ...styles.navItem,
        backgroundColor: isActive ? 'rgba(96, 103, 214, 0.2)' : 'transparent',
        color: isActive ? '#9597F5' : tokens.colorNeutralForeground3,
      }}
      onClick={() => navigate(path)}
      title={label}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'rgba(96, 103, 214, 0.15)';
          e.currentTarget.style.color = tokens.colorNeutralForeground1;
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = tokens.colorNeutralForeground3;
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
    >
      {isActive && (
        <div style={styles.activeIndicator} />
      )}
      {isActive ? activeIcon : icon}
      {badge !== undefined && badge > 0 && (
        <span style={styles.downloadCount}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const activeDownloads = 0;

  return (
    <nav style={{
      ...styles.root,
      backgroundColor: tokens.colorNeutralBackground1,
      borderLeft: `1px solid ${tokens.colorNeutralStroke2}`, // RTL: border on left
    }}>
      <div style={styles.navSection}>
        <NavItem
          icon={<Home24Regular />}
          activeIcon={<Home24Filled />}
          label={t('nav.home')}
          path="/"
        />
        <NavItem
          icon={<ArrowDownload24Regular />}
          activeIcon={<ArrowDownload24Filled />}
          label={t('nav.downloads')}
          path="/downloads"
          badge={activeDownloads}
        />
        <NavItem
          icon={<Library24Regular />}
          activeIcon={<Library24Filled />}
          label={t('nav.library')}
          path="/library"
        />
      </div>

      <div style={{
        ...styles.bottomSection,
        borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
      }}>
        <NavItem
          icon={<Heart24Regular />}
          activeIcon={<Heart24Filled />}
          label={t('nav.donate')}
          path="/donate"
        />
        <NavItem
          icon={<Settings24Regular />}
          activeIcon={<Settings24Filled />}
          label={t('nav.settings')}
          path="/settings"
        />
      </div>
    </nav>
  );
}
