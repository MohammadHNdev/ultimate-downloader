import { useEffect } from 'react';
import {
  Text,
  Switch,
  Dropdown,
  Option,
  Button,
  Input,
} from '@fluentui/react-components';
import {
  Folder24Regular,
  ArrowDownload24Regular,
  Color24Regular,
  Info24Regular,
  CheckmarkCircle24Regular,
} from '@fluentui/react-icons';
import { motion } from 'framer-motion';
import { useSettingsStore, QualityOption, ThemeOption } from '../../stores/settingsStore';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    gap: '32px',
    maxWidth: '800px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
  },
  title: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: '14px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  sections: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '24px',
    flex: 1,
    overflow: 'auto' as const,
    paddingRight: '8px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
    padding: '20px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.06)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  sectionIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'rgba(96, 103, 214, 0.15)',
    color: '#9597F5',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  sectionDescription: {
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
  },
  settingInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
  },
  settingLabel: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#FFFFFF',
  },
  settingDescription: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.45)',
  },
  settingControl: {
    flexShrink: 0,
    minWidth: '140px',
  },
  pathInput: {
    display: 'flex',
    gap: '8px',
    flex: 1,
    maxWidth: '400px',
  },
  versionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
    backgroundColor: 'rgba(96, 103, 214, 0.1)',
    borderRadius: '12px',
    marginTop: '8px',
  },
  versionText: {
    flex: 1,
  },
  versionNumber: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#FFFFFF',
  },
  versionLabel: {
    fontSize: '12px',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  checkUpdateBtn: {
    flexShrink: 0,
  },
};

export default function SettingsPage() {
  const {
    downloadPath,
    defaultQuality,
    theme,
    autoUpdate,
    notifications,
    simultaneousDownloads,
    embedMetadata,
    embedThumbnail,
    setDownloadPath,
    setDefaultQuality,
    setTheme,
    setAutoUpdate,
    setNotifications,
    setSimultaneousDownloads,
    setEmbedMetadata,
    setEmbedThumbnail,
  } = useSettingsStore();

  // Get default download path on mount
  useEffect(() => {
    const getDefaultPath = async () => {
      if (!downloadPath) {
        try {
          const { invoke } = await import('@tauri-apps/api/core');
          const path = await invoke<string>('get_default_download_path');
          setDownloadPath(path);
        } catch (error) {
          console.error('Failed to get default download path:', error);
        }
      }
    };
    getDefaultPath();
  }, [downloadPath, setDownloadPath]);

  const handleBrowse = async () => {
    try {
      const { open } = await import('@tauri-apps/plugin-dialog');
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: downloadPath || undefined,
      });
      if (selected) {
        setDownloadPath(selected as string);
      }
    } catch (error) {
      console.error('Failed to open folder dialog:', error);
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
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>
          Configure your download preferences and application settings
        </Text>
      </motion.div>

      <div style={styles.sections}>
        <motion.div
          style={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <Folder24Regular />
            </div>
            <div>
              <Text style={styles.sectionTitle}>Download Location</Text>
              <Text style={styles.sectionDescription}>
                Choose where your downloads will be saved
              </Text>
            </div>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Save Location</Text>
              <Text style={styles.settingDescription}>
                All downloaded files will be saved to this folder
              </Text>
            </div>
            <div style={styles.pathInput}>
              <Input
                value={downloadPath}
                onChange={(_, data) => setDownloadPath(data.value)}
                style={{ flex: 1 }}
              />
              <Button onClick={handleBrowse} appearance="primary">Browse</Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <ArrowDownload24Regular />
            </div>
            <div>
              <Text style={styles.sectionTitle}>Download Settings</Text>
              <Text style={styles.sectionDescription}>
                Configure download quality and behavior
              </Text>
            </div>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Default Quality</Text>
              <Text style={styles.settingDescription}>
                Preferred video quality for downloads
              </Text>
            </div>
            <Dropdown
              style={styles.settingControl}
              value={defaultQuality === 'best' ? 'Best Available' : defaultQuality}
              selectedOptions={[defaultQuality]}
              onOptionSelect={(_, data) => setDefaultQuality(data.optionValue as QualityOption)}
            >
              <Option value="best">Best Available</Option>
              <Option value="1080p">1080p (Full HD)</Option>
              <Option value="720p">720p (HD)</Option>
              <Option value="480p">480p (SD)</Option>
            </Dropdown>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Simultaneous Downloads</Text>
              <Text style={styles.settingDescription}>
                Maximum number of concurrent downloads
              </Text>
            </div>
            <Dropdown
              style={styles.settingControl}
              value={String(simultaneousDownloads)}
              selectedOptions={[String(simultaneousDownloads)]}
              onOptionSelect={(_, data) => setSimultaneousDownloads(Number(data.optionValue))}
            >
              <Option value="1">1</Option>
              <Option value="2">2</Option>
              <Option value="3">3</Option>
              <Option value="5">5</Option>
            </Dropdown>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Embed Metadata</Text>
              <Text style={styles.settingDescription}>
                Include title, artist, and other info in downloaded files
              </Text>
            </div>
            <Switch
              checked={embedMetadata}
              onChange={(_, data) => setEmbedMetadata(data.checked)}
            />
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Embed Thumbnail</Text>
              <Text style={styles.settingDescription}>
                Add thumbnail as album art to audio files
              </Text>
            </div>
            <Switch
              checked={embedThumbnail}
              onChange={(_, data) => setEmbedThumbnail(data.checked)}
            />
          </div>
        </motion.div>

        <motion.div
          style={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <Color24Regular />
            </div>
            <div>
              <Text style={styles.sectionTitle}>Appearance</Text>
              <Text style={styles.sectionDescription}>
                Customize the look and feel of the app
              </Text>
            </div>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Theme</Text>
              <Text style={styles.settingDescription}>
                Choose your preferred color scheme
              </Text>
            </div>
            <Dropdown
              style={styles.settingControl}
              value={theme.charAt(0).toUpperCase() + theme.slice(1)}
              selectedOptions={[theme]}
              onOptionSelect={(_, data) => setTheme(data.optionValue as ThemeOption)}
            >
              <Option value="dark">Dark</Option>
              <Option value="light">Light</Option>
              <Option value="system">System</Option>
            </Dropdown>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Notifications</Text>
              <Text style={styles.settingDescription}>
                Show notifications when downloads complete
              </Text>
            </div>
            <Switch
              checked={notifications}
              onChange={(_, data) => setNotifications(data.checked)}
            />
          </div>
        </motion.div>

        <motion.div
          style={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <Info24Regular />
            </div>
            <div>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.sectionDescription}>
                Application information and updates
              </Text>
            </div>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Auto Update</Text>
              <Text style={styles.settingDescription}>
                Automatically check for and install updates
              </Text>
            </div>
            <Switch
              checked={autoUpdate}
              onChange={(_, data) => setAutoUpdate(data.checked)}
            />
          </div>

          <div style={styles.versionInfo}>
            <CheckmarkCircle24Regular style={{ color: '#4ADE80' }} />
            <div style={styles.versionText}>
              <Text style={styles.versionNumber}>Ultimate Downloader v1.0.0</Text>
              <Text style={styles.versionLabel}>You're running the latest version</Text>
            </div>
            <Button style={styles.checkUpdateBtn} appearance="subtle">
              Check for Updates
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
