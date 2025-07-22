'use client';

import { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Header from './Header';

export default function HeaderWithMotion() {
  const controls = useAnimation();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;

      if (currentY > scrollY && currentY > 100) {
        // scroll down -> hide
        controls.start({ y: -100 });
      } else {
        // scroll up -> show
        controls.start({ y: 0 });
      }

      setScrollY(currentY);
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollY, controls]);

  return (
    <motion.div
      initial={{ y: 0 }}
      animate={controls}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-50 bg-white shadow-md"
    >
      <Header />
    </motion.div>
  );
}
