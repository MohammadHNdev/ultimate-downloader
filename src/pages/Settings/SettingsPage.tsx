import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Text,
  Switch,
  Dropdown,
  Option,
  Button,
  Input,
  tokens,
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
    borderRadius: '16px',
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
  settingRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 0',
  },
  settingInfo: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px',
    flex: 1,
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
  checkUpdateBtn: {
    flexShrink: 0,
  },
};

export default function SettingsPage() {
  const { t } = useTranslation();
  const {
    downloadPath,
    defaultQuality,
    theme,
    embedMetadata,
    embedThumbnail,
    setDownloadPath,
    setDefaultQuality,
    setTheme,
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
        <Text style={{ fontSize: '28px', fontWeight: 700, color: tokens.colorNeutralForeground1 }}>{t('settings.title')}</Text>
        <Text style={{ fontSize: '14px', color: tokens.colorNeutralForeground3 }}>{t('settings.subtitle')}</Text>
      </motion.div>

      <div style={styles.sections}>
        <motion.div
          style={{ ...styles.section, backgroundColor: tokens.colorNeutralBackground2, border: `1px solid ${tokens.colorNeutralStroke2}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <Folder24Regular />
            </div>
            <div>
              <Text style={{ fontSize: '16px', fontWeight: 600, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.download.title')}</Text>
              <Text style={{ fontSize: '13px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.download.description')}</Text>
            </div>
          </div>

          <div style={{ ...styles.settingRow, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <div style={styles.settingInfo}>
              <Text style={{ fontSize: '14px', fontWeight: 500, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.download.saveLocation')}</Text>
              <Text style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.download.saveLocationDesc')}</Text>
            </div>
            <div style={styles.pathInput}>
              <Input
                value={downloadPath}
                onChange={(_, data) => setDownloadPath(data.value)}
                style={{ flex: 1 }}
              />
              <Button onClick={handleBrowse} appearance="primary">{t('settings.sections.download.browse')}</Button>
            </div>
          </div>
        </motion.div>

        <motion.div
          style={{ ...styles.section, backgroundColor: tokens.colorNeutralBackground2, border: `1px solid ${tokens.colorNeutralStroke2}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <ArrowDownload24Regular />
            </div>
            <div>
              <Text style={{ fontSize: '16px', fontWeight: 600, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.downloadSettings.title')}</Text>
              <Text style={{ fontSize: '13px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.downloadSettings.description')}</Text>
            </div>
          </div>

          <div style={{ ...styles.settingRow, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <div style={styles.settingInfo}>
              <Text style={{ fontSize: '14px', fontWeight: 500, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.downloadSettings.quality')}</Text>
              <Text style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.downloadSettings.qualityDesc')}</Text>
            </div>
            <Dropdown
              style={styles.settingControl}
              value={defaultQuality === 'best' ? t('settings.sections.downloadSettings.qualityBest') : defaultQuality}
              selectedOptions={[defaultQuality]}
              onOptionSelect={(_, data) => setDefaultQuality(data.optionValue as QualityOption)}
            >
              <Option value="best">{t('settings.sections.downloadSettings.qualityBest')}</Option>
              <Option value="1080p">1080p (Full HD)</Option>
              <Option value="720p">720p (HD)</Option>
              <Option value="480p">480p (SD)</Option>
            </Dropdown>
          </div>

          <div style={{ ...styles.settingRow, borderBottom: `1px solid ${tokens.colorNeutralStroke2}` }}>
            <div style={styles.settingInfo}>
              <Text style={{ fontSize: '14px', fontWeight: 500, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.downloadSettings.metadata')}</Text>
              <Text style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.downloadSettings.metadataDesc')}</Text>
            </div>
            <Switch
              checked={embedMetadata}
              onChange={(_, data) => setEmbedMetadata(data.checked)}
            />
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={{ fontSize: '14px', fontWeight: 500, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.downloadSettings.thumbnail')}</Text>
              <Text style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.downloadSettings.thumbnailDesc')}</Text>
            </div>
            <Switch
              checked={embedThumbnail}
              onChange={(_, data) => setEmbedThumbnail(data.checked)}
            />
          </div>
        </motion.div>

        <motion.div
          style={{ ...styles.section, backgroundColor: tokens.colorNeutralBackground2, border: `1px solid ${tokens.colorNeutralStroke2}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <Color24Regular />
            </div>
            <div>
              <Text style={{ fontSize: '16px', fontWeight: 600, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.appearance.title')}</Text>
              <Text style={{ fontSize: '13px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.appearance.description')}</Text>
            </div>
          </div>

          <div style={styles.settingRow}>
            <div style={styles.settingInfo}>
              <Text style={{ fontSize: '14px', fontWeight: 500, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.appearance.theme')}</Text>
              <Text style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.appearance.themeDesc')}</Text>
            </div>
            <Dropdown
              style={styles.settingControl}
              value={theme === 'dark' ? t('settings.sections.appearance.themeDark') : theme === 'light' ? t('settings.sections.appearance.themeLight') : t('settings.sections.appearance.themeSystem')}
              selectedOptions={[theme]}
              onOptionSelect={(_, data) => setTheme(data.optionValue as ThemeOption)}
            >
              <Option value="dark">{t('settings.sections.appearance.themeDark')}</Option>
              <Option value="light">{t('settings.sections.appearance.themeLight')}</Option>
              <Option value="system">{t('settings.sections.appearance.themeSystem')}</Option>
            </Dropdown>
          </div>

        </motion.div>

        <motion.div
          style={{ ...styles.section, backgroundColor: tokens.colorNeutralBackground2, border: `1px solid ${tokens.colorNeutralStroke2}` }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <Info24Regular />
            </div>
            <div>
              <Text style={{ fontSize: '16px', fontWeight: 600, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.about.title')}</Text>
              <Text style={{ fontSize: '13px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.about.description')}</Text>
            </div>
          </div>

          <div style={styles.versionInfo}>
            <CheckmarkCircle24Regular style={{ color: '#4ADE80' }} />
            <div style={styles.versionText}>
              <Text style={{ fontSize: '14px', fontWeight: 600, color: tokens.colorNeutralForeground1 }}>{t('settings.sections.about.version')} v1.6.0</Text>
              <Text style={{ fontSize: '12px', color: tokens.colorNeutralForeground3 }}>{t('settings.sections.about.latestVersion')}</Text>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
