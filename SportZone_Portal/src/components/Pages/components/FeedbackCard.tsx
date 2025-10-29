import { FaStar } from "react-icons/fa";

interface FeedbackCardProps {
  name: string;
  comment: string;
  rating: number;
}

const FeedbackCard = ({ name, comment, rating }: FeedbackCardProps) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow text-left">
      <p className="italic text-gray-700">"{comment}"</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-semibold text-[#1a3c34]">– {name}</span>
        <div className="text-yellow-400 flex">
          {[...Array(rating)].map((_, i) => (
            <FaStar key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
