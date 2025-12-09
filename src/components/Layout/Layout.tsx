import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import TitleBar from '../TitleBar/TitleBar';
import Sidebar from '../Sidebar/Sidebar';

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    width: '100vw',
    height: '100vh',
    overflow: 'hidden' as const,
    backgroundColor: '#0A0B14',
  },
  container: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden' as const,
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    overflow: 'hidden' as const,
    position: 'relative' as const,
  },
  content: {
    flex: 1,
    overflow: 'auto' as const,
    padding: '24px',
    position: 'relative' as const,
    background: `
      radial-gradient(ellipse at 20% 0%, rgba(96, 103, 214, 0.15) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 100%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)
    `,
  },
  contentInner: {
    position: 'relative' as const,
    zIndex: 1,
    height: '100%',
  },
};

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={styles.root}>
      <TitleBar />
      <div style={styles.container}>
        <Sidebar />
        <main style={styles.main}>
          <div style={styles.content}>
            <motion.div
              style={styles.contentInner}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
