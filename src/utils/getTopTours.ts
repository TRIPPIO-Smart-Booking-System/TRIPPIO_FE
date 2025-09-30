// utils/getTopTours.ts
import { Tour } from '@/data/tours';

export function getTopToursByRating(all: Tour[], limit = 10): Tour[] {
  return [...all].sort((a, b) => b.rating - a.rating || b.reviews - a.reviews).slice(0, limit);
}
