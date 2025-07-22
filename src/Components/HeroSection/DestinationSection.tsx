'use client';

import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import DestinationCard from '../Card/DestinationCard';

const destinations = [
  { name: 'Đà Nẵng', imageUrl: '/Home/1.jpg' },
  { name: 'Phú Quốc', imageUrl: '/Home/2.jpg' },
  { name: 'Hà Nội', imageUrl: '/Home/3.jpg' },
  { name: 'Đà Lạt', imageUrl: '/Home/4.jpg' },
  { name: 'Phú Quý', imageUrl: '/Home/5.jpg' },
  { name: 'Nha Trang', imageUrl: '/Home/6.jpg' },
  { name: 'Nghệ An', imageUrl: '/Home/1.jpg' },
];

export default function DestinationSection() {
  return (
    <section className="px-4 md:px-8 xl:px-16 py-12 bg-[#f5fefe]">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">Điểm đến phổ biến nhất Việt Nam</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {destinations.map((d, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
          >
            <DestinationCard name={d.name} imageUrl={d.imageUrl} />
          </motion.div>
        ))}

        {/* CARD VIEW MORE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: destinations.length * 0.05 }}
          className="relative rounded-3xl border border-gray-200 shadow-md bg-gray-100 h-[240px] hover:shadow-xl transition-all duration-300"
        >
          <div className="absolute bottom-5 left-5">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-black text-white text-base font-semibold px-6 py-3 rounded-full hover:bg-gray-900 transition-all"
            >
              Tất cả các điểm đến{' '}
              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 5 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <ArrowRight size={18} />
              </motion.span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
