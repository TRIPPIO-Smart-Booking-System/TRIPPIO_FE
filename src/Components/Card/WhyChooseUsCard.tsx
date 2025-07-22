import Image from 'next/image';
import { FC } from 'react';
import { motion } from 'framer-motion';

export interface WhyChooseUsCardProps {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
}

const WhyChooseUsCard: FC<WhyChooseUsCardProps> = ({ icon, title, description, bgColor }) => {
  return (
    <motion.div
      className={`rounded-2xl p-6 text-center ${bgColor} cursor-pointer`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      whileHover={{
        y: -8,
        scale: 1.03,
        boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="flex justify-center mb-4">
        <div className="bg-white rounded-full p-3 shadow-md">
          <Image src={icon} alt={title} width={40} height={40} />
        </div>
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{description}</p>
      <button className="text-sm font-medium text-black hover:underline inline-flex items-center gap-1">
        Tìm hiểu thêm →
      </button>
    </motion.div>
  );
};

export default WhyChooseUsCard;
