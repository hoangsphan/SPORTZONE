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

interface FieldListItemProps {
  field: Field;
  onBookField: (field: Field) => void;
}

const FieldListItem = ({ field, onBookField }: FieldListItemProps) => {
  const formatTime = (timeString: string): string => {
    return timeString.slice(0, 5); // Remove seconds from "HH:MM:SS"
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="md:w-48 h-32 relative">
          <img
            src={field.image || "/placeholder.svg"}
            alt={field.name}
            className="w-full h-full object-cover rounded-lg"
          />
          {!field.available && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <span className="text-white font-medium text-sm">
                Đã được đặt
              </span>
            </div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-xl">{field.name}</h3>
          </div>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span>{field.location}</span>
          </div>

          <div className="flex items-center mb-2">
            <Clock className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-gray-600">
              {formatTime(field.openTime)} - {formatTime(field.closeTime)}
            </span>
          </div>

          <p className="text-gray-600 mb-3">{field.description}</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {field.categoryFields.map((category) => (
              <span
                key={category.categoryFieldId}
                className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded"
              >
                {category.categoryFieldName}
              </span>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              disabled={!field.available}
              onClick={() => onBookField(field)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                field.available
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {field.available ? "Đặt sân ngay" : "Hết chỗ"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldListItem;
