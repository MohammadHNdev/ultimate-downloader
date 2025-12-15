import { useState } from 'react';
import { Text, tokens } from '@fluentui/react-components';
import { Heart24Filled, Heart24Regular } from '@fluentui/react-icons';
import { motion } from 'framer-motion';

// Font family for Persian text
const vazirFont = "'Vazirmatn', 'Vazir', Tahoma, Arial, sans-serif";

const styles = {
  root: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '32px',
    padding: '48px',
    direction: 'rtl' as const,
    fontFamily: vazirFont,
  },
  card: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '24px',
    padding: '48px',
    borderRadius: '24px',
    maxWidth: '500px',
    textAlign: 'center' as const,
    direction: 'rtl' as const,
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    fontFamily: vazirFont,
    direction: 'rtl' as const,
  },
  description: {
    fontSize: '15px',
    lineHeight: 2,
    fontFamily: vazirFont,
    direction: 'rtl' as const,
    textAlign: 'center' as const,
  },
  amounts: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    direction: 'rtl' as const,
  },
  amountButton: {
    padding: '12px 24px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 600,
    border: '2px solid transparent',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: vazirFont,
  },
  donateButton: {
    padding: '16px 48px',
    fontSize: '16px',
    fontWeight: 600,
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #FF6B9D 0%, #FF8E53 100%)',
    border: 'none',
    color: '#FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontFamily: vazirFont,
    direction: 'rtl' as const,
  },
  customInput: {
    padding: '12px 16px',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: 500,
    border: '2px solid',
    outline: 'none',
    width: '120px',
    textAlign: 'center' as const,
    fontFamily: vazirFont,
    direction: 'ltr' as const,
  },
  label: {
    fontSize: '14px',
    fontFamily: vazirFont,
    direction: 'rtl' as const,
  },
  footer: {
    fontSize: '12px',
    fontFamily: vazirFont,
    direction: 'rtl' as const,
  },
};

// Zibal merchant code
const ZIBAL_MERCHANT = '688e17eaa45c720010f6b731';

// Predefined amounts in Toman
const AMOUNTS = [
  { value: 10000, label: '۱۰,۰۰۰' },
  { value: 20000, label: '۲۰,۰۰۰' },
  { value: 50000, label: '۵۰,۰۰۰' },
  { value: 100000, label: '۱۰۰,۰۰۰' },
];

export default function DonatePage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(20000);
  const [customAmount, setCustomAmount] = useState<string>('');

  const handleDonate = async () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount;

    // Open payment gateway via arvangram.ir proxy (handles CORS)
    // This calls a PHP script that creates Zibal payment and redirects
    const paymentUrl = `https://arvangram.ir/donate/pay.php?amount=${amount}&merchant=${ZIBAL_MERCHANT}`;
    window.open(paymentUrl, '_blank');
  };

  return (
    <div style={styles.root}>
      <motion.div
        style={{
          ...styles.card,
          backgroundColor: tokens.colorNeutralBackground2,
          border: `1px solid ${tokens.colorNeutralStroke2}`,
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          style={styles.iconContainer}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Heart24Filled style={{ fontSize: '36px', color: '#FFFFFF' }} />
        </motion.div>

        <Text style={{ ...styles.title, color: tokens.colorNeutralForeground1 }}>
          حمایت از توسعه‌دهنده
        </Text>

        <Text style={{ ...styles.description, color: tokens.colorNeutralForeground2 }}>
          اگر از این نرم‌افزار راضی هستید، با حمایت مالی خود به ادامه توسعه و بهبود آن کمک کنید.
          کمک شما باعث می‌شود قابلیت‌های جدید اضافه شود.
        </Text>

        <Text style={{ ...styles.label, color: tokens.colorNeutralForeground3 }}>
          مبلغ را انتخاب کنید (تومان):
        </Text>

        <div style={styles.amounts}>
          {AMOUNTS.map((amt) => (
            <motion.button
              key={amt.value}
              style={{
                ...styles.amountButton,
                backgroundColor: selectedAmount === amt.value && !customAmount
                  ? 'rgba(255, 107, 157, 0.2)'
                  : tokens.colorNeutralBackground3,
                borderColor: selectedAmount === amt.value && !customAmount
                  ? '#FF6B9D'
                  : 'transparent',
                color: selectedAmount === amt.value && !customAmount
                  ? '#FF6B9D'
                  : tokens.colorNeutralForeground2,
              }}
              onClick={() => {
                setSelectedAmount(amt.value);
                setCustomAmount('');
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {amt.label}
            </motion.button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', direction: 'rtl', fontFamily: vazirFont }}>
          <Text style={{ ...styles.label, color: tokens.colorNeutralForeground3 }}>
            یا مبلغ دلخواه:
          </Text>
          <input
            type="number"
            placeholder="مبلغ"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            style={{
              ...styles.customInput,
              backgroundColor: tokens.colorNeutralBackground3,
              borderColor: customAmount ? '#FF6B9D' : tokens.colorNeutralStroke2,
              color: tokens.colorNeutralForeground1,
            }}
          />
          <Text style={{ ...styles.label, color: tokens.colorNeutralForeground3 }}>تومان</Text>
        </div>

        <motion.button
          style={styles.donateButton}
          onClick={handleDonate}
          whileHover={{ scale: 1.05, boxShadow: '0 8px 30px rgba(255, 107, 157, 0.3)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Heart24Regular />
          پرداخت امن با زیبال
        </motion.button>

        <Text style={{ ...styles.footer, color: tokens.colorNeutralForeground4 }}>
          پرداخت امن توسط درگاه زیبال
        </Text>
      </motion.div>
    </div>
  );
}
