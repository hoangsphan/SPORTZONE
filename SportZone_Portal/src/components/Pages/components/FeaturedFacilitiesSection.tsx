import { useState, useEffect } from "react";
import FacilityCard from "./FacilityCard";

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

// API Function
const fetchFacilities = async (): Promise<ApiFacilityResponse[]> => {
  const response = await fetch(
    "https://localhost:7057/api/Facility/with-details"
  );
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return await response.json();
};

const FeaturedFacilitiesSection = () => {
  const [facilities, setFacilities] = useState<ApiFacilityResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load facilities on component mount
  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoading(true);
        const facilitiesData = await fetchFacilities();
        // Lấy 3 sân đầu tiên
        setFacilities(facilitiesData.slice(0, 3));
      } catch (err) {
        console.error("Error loading facilities:", err);
        setError("Không thể tải danh sách sân. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, []);

  return (
    <section className="py-20 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">
          Các sân nổi bật
        </h2>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-gray-600">
              Đang tải danh sách sân...
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-8">
              {facilities.map((facility) => (
                <FacilityCard key={facility.facId} facility={facility} />
              ))}
            </div>
            <div className="mt-8 text-center">
              <a
                href="/field_list"
                style={{ borderRadius: "8px" }}
                className="text-[#ffff] p-4 bg-[#1ebd6f] hover:text-[#1a3c34] font-semibold"
              >
                Xem tất cả sân
              </a>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedFacilitiesSection;
