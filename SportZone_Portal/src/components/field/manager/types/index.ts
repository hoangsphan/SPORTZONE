export interface Field {
  id: number;
  fac_id: number;
  category_id: number;
  field_name: string;
  description: string;
  price: number;
  is_booking_enable: boolean;
}

export type FieldFormData = Omit<Field, "id">;

export interface FieldManagerState {
  fields: Field[];
  filteredFields: Field[];
  searchKeyword: string;
  editId: number | null;
  showModal: boolean;
  showDeleteModal: boolean;
  fieldToDelete: number | null;
  formData: FieldFormData;
  currentPage: number;
  pageSize: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
