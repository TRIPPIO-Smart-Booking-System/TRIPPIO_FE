import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

interface DestinationCardProps {
  name: string;
  imageUrl: string;
  onClick?: () => void;
}

export default function DestinationCard({ name, imageUrl, onClick }: DestinationCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-2xl shadow-sm border border-gray-200 p-4 w-full h-[240px] hover:shadow-md transition-all duration-200"
    >
      <div className="relative w-full h-[140px] rounded-xl overflow-hidden mb-3">
        <Image src={imageUrl} alt={name} fill className="object-cover" />
      </div>
      <div className="flex items-center justify-between">
        <p className="font-semibold text-base md:text-lg">{name}</p>
        <div className="bg-gray-100 p-1.5 rounded-full">
          <ArrowRight size={16} />
        </div>
      </div>
    </div>
  );
}
