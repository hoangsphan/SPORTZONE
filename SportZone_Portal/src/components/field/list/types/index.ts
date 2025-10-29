export interface CategoryField {
  categoryFieldId: number;
  categoryFieldName: string;
}

export interface ApiField {
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

export interface Field {
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
