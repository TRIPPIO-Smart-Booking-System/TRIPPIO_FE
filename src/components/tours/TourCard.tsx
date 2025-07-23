import { Tour } from '@/data/tours';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/Card';
import Image from 'next/image';
import Link from 'next/link';
import Button from '../ui/Button';

interface TourCardProps {
  tour: Tour;
}

export default function TourCard({ tour }: TourCardProps) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-0 shadow-sm">
      <div className="relative h-48 w-full">
        <Image
          src={tour.imageUrl}
          alt={tour.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute top-2 right-2 bg-white/90 rounded-full px-2 py-1 text-xs font-medium text-teal-500 flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-yellow-500 mr-1"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span>{tour.rating}</span>
          <span className="text-gray-500 ml-1">({tour.reviews})</span>
        </div>
      </div>
      <CardHeader className="p-4">
        <CardTitle className="text-lg">{tour.title}</CardTitle>
        <CardDescription className="flex items-center text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1 text-teal-500"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {tour.destination}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground">{tour.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1 text-teal-500"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {tour.duration}
          </div>
          <div>
            <p className="text-lg font-bold text-teal-500">
              {tour.price.toLocaleString('vi-VN')} đ
            </p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/tours/${tour.id}`} className="w-full">
          <Button className="w-full bg-teal-500 text-white hover:bg-teal-600">Xem chi tiết</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
