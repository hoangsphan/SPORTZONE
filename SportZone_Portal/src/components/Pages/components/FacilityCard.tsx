import { FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface ApiFacilityResponse {
  facId: number;
  userId: number;
  name: string;
  openTime: string;
  closeTime: string;
  address: string;
  description: string;
  subdescription: string;
  imageUrls: string[];
  categoryFields: { categoryFieldId: number; categoryFieldName: string }[];
}

interface FacilityCardProps {
  facility: ApiFacilityResponse;
}

const FacilityCard = ({ facility }: FacilityCardProps) => {
  const navigate = useNavigate();

  // Helper function to format image URL
  const getImageUrl = (imageUrl: string) => {
    if (imageUrl.startsWith("http")) return imageUrl;
    return `https://localhost:7057${imageUrl}`;
  };

  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg overflow-hidden">
      <img
        src={getImageUrl(facility.imageUrls[0])}
        alt={facility.name}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-xl font-semibold mb-1">{facility.name}</h3>
        <p className="text-gray-600 text-sm mb-2">
          <FaMapMarkerAlt className="inline mr-1" /> {facility.address}
        </p>
        <p className="text-gray-500 text-sm mb-2">{facility.subdescription}</p>
        <div className="flex flex-wrap gap-1 mt-2">
          {facility.categoryFields.map((category) => (
            <span
              key={category.categoryFieldId}
              className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
            >
              {category.categoryFieldName}
            </span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Mở cửa: {facility.openTime.slice(0, 5)} -{" "}
          {facility.closeTime.slice(0, 5)}
        </p>
        <button
          onClick={() => navigate(`/booking/${facility.facId}`)}
          className={`px-4 py-2 bg-green-100 mt-4 text-green-800 rounded-md text-sm font-bold transition-colors `}
        >
          Đặt sân
        </button>
      </div>
    </div>
  );
};

export default FacilityCard;
