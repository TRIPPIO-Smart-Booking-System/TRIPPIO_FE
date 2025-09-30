import DestinationCard from '@/components/ui/DestinationCard';
import { vietnamDestinations } from '@/data/destinations';

export default function PopularDestinationsVietnam() {
  const handleDestinationClick = (destinationId: string) => {
    console.log('Navigate to destination:', destinationId);
    // TODO: Implement navigation logic
  };

  return (
    <section className="popular-destinations-vietnam">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Điểm đến phổ biến nhất Việt Nam</h2>
        </div>
        <div className="destinations-vietnam-grid">
          {vietnamDestinations.map((destination) => (
            <DestinationCard
              key={destination.id}
              destination={destination}
              onClick={handleDestinationClick}
            />
          ))}
          <DestinationCard
            destination={{ id: 'show-all', name: '', image: '', alt: '' }}
            onClick={() => handleDestinationClick('all')}
            showAll
          />
        </div>
      </div>
    </section>
  );
}
