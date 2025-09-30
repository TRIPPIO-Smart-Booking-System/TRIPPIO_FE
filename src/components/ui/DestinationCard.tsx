import { Destination } from '@/types';

interface DestinationCardProps {
  destination: Destination;
  onClick?: (destinationId: string) => void;
  showAll?: boolean;
}

export default function DestinationCard({
  destination,
  onClick,
  showAll = false,
}: DestinationCardProps) {
  const handleClick = () => {
    onClick?.(destination.id);
  };

  if (showAll) {
    return (
      <div className="destination-vietnam-card show-all" onClick={handleClick}>
        <div className="show-all-content">
          <span className="show-all-text">Tất cả các điểm đến</span>
          <span className="show-all-arrow">→</span>
        </div>
      </div>
    );
  }

  return (
    <div className="destination-vietnam-card" onClick={handleClick}>
      <img src={destination.image} alt={destination.alt} />
      <div className="destination-vietnam-info">
        <h3>{destination.name}</h3>
        <span className="destination-arrow">→</span>
      </div>
    </div>
  );
}
