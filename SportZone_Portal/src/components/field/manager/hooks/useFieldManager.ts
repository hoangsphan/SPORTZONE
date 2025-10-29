import { useState, useMemo, useCallback } from "react";
import Swal from "sweetalert2";
import type { Field, FieldFormData, PaginationInfo } from "../types";

const initialFields: Field[] = [
  {
    id: 1,
    fac_id: 1,
    category_id: 1,
    field_name: "Sân 5A",
    description: "Sân bóng đá 5 người",
    price: 500000,
    is_booking_enable: true,
  },
  {
    id: 2,
    fac_id: 2,
    category_id: 2,
    field_name: "Sân 7B",
    description: "Sân bóng đá 7 người",
    price: 800000,
    is_booking_enable: false,
  },
];

const initialFormData: FieldFormData = {
  fac_id: 0,
  category_id: 0,
  field_name: "",
  description: "",
  price: 0,
  is_booking_enable: true,
};

export const useFieldManager = (pageSize: number = 10) => {
  // State management
  const [fields, setFields] = useState<Field[]>(initialFields);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fieldToDelete, setFieldToDelete] = useState<number | null>(null);
  const [formData, setFormData] = useState<FieldFormData>(initialFormData);
  const [currentPage, setCurrentPage] = useState(1);

  // Toast notification
  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: type,
        title: message,
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
    },
    []
  );

  // Filtered fields based on search
  const filteredFields = useMemo(() => {
    if (!searchKeyword) return fields;
    const keyword = searchKeyword.toLowerCase();
    return fields.filter(
      (field) =>
        field.field_name.toLowerCase().includes(keyword) ||
        field.description.toLowerCase().includes(keyword)
    );
  }, [fields, searchKeyword]);

  // Pagination info
  const paginationInfo: PaginationInfo = useMemo(() => {
    const totalItems = filteredFields.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }, [filteredFields.length, pageSize, currentPage]);

  // Current page fields
  const currentFields = useMemo(() => {
    const { startIndex, endIndex } = paginationInfo;
    return filteredFields.slice(startIndex, endIndex);
  }, [filteredFields, paginationInfo]);

  // Form handlers
  const resetForm = useCallback(() => {
    setFormData(initialFormData);
    setEditId(null);
    setShowModal(false);
  }, []);

  const handleFormChange = useCallback(
    (name: string, value: string | number | boolean) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      // Validation
      if (
        !formData.field_name ||
        !formData.description ||
        !formData.fac_id ||
        !formData.category_id ||
        !formData.price
      ) {
        showToast("Vui lòng điền đầy đủ thông tin!", "error");
        return;
      }

      if (editId !== null) {
        // Update existing field
        setFields((prev) =>
          prev.map((f) => (f.id === editId ? { ...f, ...formData } : f))
        );
        showToast("Cập nhật thành công!");
      } else {
        // Add new field
        const newField: Field = {
          id: Math.max(...fields.map((f) => f.id)) + 1 || 1,
          ...formData,
        };
        setFields((prev) => [...prev, newField]);
        showToast("Thêm thành công!");
      }

      resetForm();
    },
    [formData, editId, fields, showToast, resetForm]
  );

  // Modal handlers

  const handleEdit = useCallback(
    (id: number) => {
      const field = fields.find((f) => f.id === id);
      if (field) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _, ...rest } = field;
        setFormData(rest);
        setEditId(id);
        setShowModal(true);
      }
    },
    [fields]
  );

  const handleDelete = useCallback(() => {
    if (fieldToDelete === null) return;

    setFields((prev) => prev.filter((f) => f.id !== fieldToDelete));
    showToast("Xóa thành công!");
    setShowDeleteModal(false);
    setFieldToDelete(null);
  }, [fieldToDelete, showToast]);

  const openDeleteModal = useCallback((id: number) => {
    setFieldToDelete(id);
    setShowDeleteModal(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setFieldToDelete(null);
  }, []);

  // Search handler
  const handleSearch = useCallback((keyword: string) => {
    setSearchKeyword(keyword);
    setCurrentPage(1); // Reset to first page when searching
  }, []);

  // Pagination handlers
  const goToPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const goToPrevPage = useCallback(() => {
    if (paginationInfo.hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [paginationInfo.hasPrevPage]);

  const goToNextPage = useCallback(() => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [paginationInfo.hasNextPage]);

  const openCreateModal = useCallback(() => {
    setEditId(null);
    setFormData(initialFormData);
    setShowModal(true);
  }, []);

  return {
    // State
    fields,
    currentFields,
    filteredFields,
    searchKeyword,
    editId,
    showModal,
    showDeleteModal,
    fieldToDelete,
    formData,
    paginationInfo,

    // Handlers
    handleFormChange,
    handleSubmit,
    handleEdit,
    handleDelete,
    handleSearch,
    resetForm,
    openCreateModal,
    openDeleteModal,
    closeDeleteModal,
    goToPage,
    goToPrevPage,
    goToNextPage,
  };
};
