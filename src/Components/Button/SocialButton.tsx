import React from 'react';
import styles from './SocialButton.module.css';
import type { JSX } from 'react/jsx-runtime';

interface SocialButtonProps {
  icon: JSX.Element;
  color: string;
}

export default function SocialButton({ icon, color }: SocialButtonProps) {
  return (
    <button
      className={styles.socialBtn}
      style={{ color }}
      onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#f5f5f5')}
      onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = '#fff')}
    >
      {icon}
    </button>
  );
}
