import { ReactNode } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { motion } from 'framer-motion';
import TitleBar from '../TitleBar/TitleBar';
import Sidebar from '../Sidebar/Sidebar';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: '#0A0B14',
  },
  container: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    overflow: 'auto',
    padding: '24px',
    position: 'relative',
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `
        radial-gradient(ellipse at 20% 0%, rgba(96, 103, 214, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 100%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)
      `,
      pointerEvents: 'none',
      zIndex: 0,
    },
  },
  contentInner: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
  },
});

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const styles = useStyles();

  return (
    <div className={styles.root}>
      <TitleBar />
      <div className={styles.container}>
        <Sidebar />
        <main className={styles.main}>
          <div className={styles.content}>
            <motion.div
              className={styles.contentInner}
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
