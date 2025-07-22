interface PromoCardProps {
  tag: string;
  title: string;
  description?: string;
}

export default function PromoCard({ tag, title, description }: PromoCardProps) {
  return (
    <div className="bg-gray-400 rounded-2xl p-6 flex flex-col justify-between w-[400px] h-[240px] shrink-0">
      <div>
        <p className="text-sm text-black mb-2">{tag}</p>
        <h3 className="text-xl font-bold text-black">{title}</h3>
        {description && <p className="text-base text-black">{description}</p>}
      </div>

      <button className="bg-[#e7f9f7] text-sm px-4 py-2 rounded-full flex items-center gap-2 mt-4 w-fit">
        View More <span className="ml-1">→</span>
      </button>
    </div>
  );
}
