'use client';

import { Heart, Users, Clock } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export interface TourCardProps {
  title: string;
  image: string;
  duration: string;
  groupSize: string;
  price: string;
  status?: 'top-rated' | 'best-sale' | 'discount';
  discountPercent?: number;
  rating?: number;
  reviews?: number;
}

const getStatusBadge = (status?: string, discountPercent?: number) => {
  switch (status) {
    case 'top-rated':
      return (
        <span className="absolute top-3 left-3 bg-orange-200 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
          Top Rated
        </span>
      );
    case 'best-sale':
      return (
        <span className="absolute top-3 left-3 bg-green-100 text-green-600 text-xs font-semibold px-3 py-1 rounded-full">
          Best Sale
        </span>
      );
    case 'discount':
      return (
        <span className="absolute top-3 left-3 bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full">
          {discountPercent}% Off
        </span>
      );
    default:
      return null;
  }
};

export default function FamousTourCard({
  image,
  title,
  duration,
  groupSize,
  price,
  status,
  discountPercent,
}: TourCardProps) {
  return (
    <motion.div
      className="rounded-xl shadow-md overflow-hidden bg-white"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      whileHover={{
        scale: 1.03,
        y: -6,
        boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.1)',
      }}
    >
      <div className="relative">
        <Image
          src={image}
          alt={title}
          width={400}
          height={250}
          className="w-full h-56 object-cover"
        />
        {getStatusBadge(status, discountPercent)}
        <button className="absolute top-3 right-3 bg-white p-1 rounded-full shadow">
          <Heart size={18} className="text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold">{title}</h3>
        <div className="flex items-center text-sm text-gray-600 gap-4">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {duration}
          </span>
          <span className="flex items-center gap-1">
            <Users size={14} /> {groupSize}
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="font-semibold text-black">
            VND {price} <span className="text-gray-500 text-sm">/ người</span>
          </p>
          <button className="bg-gray-200 hover:bg-gray-300 text-sm font-medium px-4 py-1.5 rounded-full">
            Đặt Ngay
          </button>
        </div>
      </div>
    </motion.div>
  );
}
