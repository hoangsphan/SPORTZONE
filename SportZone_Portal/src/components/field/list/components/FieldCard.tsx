import { Clock, MapPin } from "lucide-react";

interface CategoryField {
  categoryFieldId: number;
  categoryFieldName: string;
}

interface Field {
  id: number;
  name: string;
  location: string;
  openTime: string;
  closeTime: string;
  description: string;
  subdescription: string;
  image: string;
  imageUrls: string[];
  categoryFields: CategoryField[];
  available: boolean;
}

interface FieldCardProps {
  field: Field;
  onBookField: (field: Field) => void;
}

const FieldCard = ({ field, onBookField }: FieldCardProps) => {
  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5); // Remove seconds from "HH:MM:SS"
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={field.image || "/placeholder.svg"}
          alt={field.name}
          className="w-full h-48 object-cover"
        />
        {!field.available && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-medium">Đã được đặt</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{field.name}</h3>

        <div className="flex items-center text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-sm">{field.location}</span>
        </div>

        <div className="flex items-center mb-2">
          <Clock className="w-4 h-4 text-green-500 mr-1" />
          <span className="text-sm text-gray-600">
            {formatTime(field.openTime)} - {formatTime(field.closeTime)}
          </span>
        </div>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {field.subdescription}
        </p>

        <div className="flex flex-wrap gap-1 mb-3">
          {field.categoryFields.map((category) => (
            <span
              key={category.categoryFieldId}
              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
            >
              {category.categoryFieldName}
            </span>
          ))}
        </div>

        <div className="flex justify-end">
          <button
            disabled={!field.available}
            onClick={() => onBookField(field)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              field.available
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {field.available ? "Đặt sân" : "Hết chỗ"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FieldCard;
