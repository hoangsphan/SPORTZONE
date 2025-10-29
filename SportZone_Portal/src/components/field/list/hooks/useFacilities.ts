import { useEffect, useState } from "react";

interface CategoryField {
  categoryFieldId: number;
  categoryFieldName: string;
}

interface ApiField {
  facId: number;
  userId: number;
  name: string;
  openTime: string;
  closeTime: string;
  address: string;
  description: string;
  subdescription: string;
  imageUrls: string[];
  categoryFields: CategoryField[];
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

export const useFacilities = () => {
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          "https://localhost:7057/api/Facility/with-details"
        );

        if (response.ok) {
          const apiFields: ApiField[] = await response.json();

          // Transform API data to component Field interface
          const transformedFields: Field[] = apiFields.map((apiField) => ({
            id: apiField.facId,
            name: apiField.name,
            location: apiField.address,
            openTime: apiField.openTime,
            closeTime: apiField.closeTime,
            description: apiField.description,
            subdescription: apiField.subdescription,
            image:
              apiField.imageUrls.length > 0
                ? `https://localhost:7057${apiField.imageUrls[0]}`
                : "/placeholder.svg",
            imageUrls: apiField.imageUrls.map(
              (url) => `https://localhost:7057${url}`
            ),
            categoryFields: apiField.categoryFields,
            available: true, // Default to available, can be updated based on actual availability logic
          }));

          setFields(transformedFields);
        } else {
          throw new Error("Failed to fetch facilities");
        }
      } catch (err) {
        console.error("Error fetching facilities:", err);
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  return { fields, loading, error };
};
