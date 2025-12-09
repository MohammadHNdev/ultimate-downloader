import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { tokens } from '@fluentui/react-components';
import TitleBar from '../TitleBar/TitleBar';
import Sidebar from '../Sidebar/Sidebar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: tokens.colorNeutralBackground1,
    }}>
      <TitleBar />
      <div style={{
        display: 'flex',
        flex: 1,
        overflow: 'hidden',
      }}>
        <Sidebar />
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '24px',
            position: 'relative',
            background: `
              radial-gradient(ellipse at 20% 0%, rgba(96, 103, 214, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 100%, rgba(0, 217, 255, 0.1) 0%, transparent 50%)
            `,
          }}>
            <motion.div
              style={{
                position: 'relative',
                zIndex: 1,
                height: '100%',
              }}
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
