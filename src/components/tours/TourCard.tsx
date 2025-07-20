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
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="relative h-48 w-full">
        <Image
          src={tour.imageUrl}
          alt={tour.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{tour.title}</CardTitle>
          <div className="flex items-center gap-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-yellow-500"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-sm font-medium">{tour.rating}</span>
            <span className="text-xs text-muted-foreground">({tour.reviews})</span>
          </div>
        </div>
        <CardDescription className="text-sm">{tour.destination}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <p className="line-clamp-2 text-sm text-muted-foreground">{tour.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">{tour.duration}</p>
          </div>
          <div>
            <p className="text-lg font-bold">{tour.price.toLocaleString('vi-VN')} đ</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link href={`/tours/${tour.id}`} className="w-full">
          <Button className="w-full">Xem chi tiết</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
