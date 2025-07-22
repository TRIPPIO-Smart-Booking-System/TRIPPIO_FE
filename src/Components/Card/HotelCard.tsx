import { FaStar, FaUserFriends, FaRegHeart } from 'react-icons/fa';
import { MdCalendarToday } from 'react-icons/md';
import Image from 'next/image';

interface HotelCardProps {
  image: string;
  name: string;
  duration: string;
  guests: string;
  price: string;
  rating: number;
  reviews: number;
}

export default function HotelCard({
  image,
  name,
  duration,
  guests,
  price,
  rating,
  reviews,
}: HotelCardProps) {
  return (
    <div className="w-full max-w-[330px] bg-white rounded-3xl shadow-lg overflow-hidden relative transform transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl">
      <div className="relative w-full h-[220px]">
        <Image src={image} alt={name} layout="fill" objectFit="cover" className="rounded-t-3xl" />
        <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md z-10">
          <FaRegHeart className="text-gray-600" />
        </div>
      </div>

      <div className="absolute right-4 top-[200px] z-20">
        <div className="bg-white rounded-full px-3 py-1 flex items-center gap-1 shadow-md text-sm">
          <FaStar className="text-yellow-500" />
          <span className="font-semibold">{rating}</span>
          <span className="text-gray-500">({reviews} reviews)</span>
        </div>
      </div>

      <div className="p-5 pt-8 bg-white rounded-3xl shadow-inner -mt-4 z-10 relative">
        <h3 className="text-lg font-bold mb-2">{name}</h3>

        <div className="flex items-center text-gray-500 text-sm gap-4 mb-3">
          <div className="flex items-center gap-1">
            <MdCalendarToday className="text-[16px]" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <FaUserFriends className="text-[16px]" />
            <span>{guests}</span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <div className="text-black font-bold">
              {price}
              <span className="text-sm font-normal"> / người</span>
            </div>
            <div className="text-xs text-gray-400">Chưa bao gồm thuế và phí</div>
          </div>
          <button className="bg-gray-100 hover:bg-gray-200 text-sm font-semibold px-4 py-2 rounded-full transition">
            Đặt ngay
          </button>
        </div>
      </div>
    </div>
  );
}
