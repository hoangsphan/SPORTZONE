import React from "react";
import type { FieldFormData } from "../types";

interface FieldFormModalProps {
  isOpen: boolean;
  isEdit: boolean;
  formData: FieldFormData;
  onFormChange: (name: string, value: string | number | boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const FieldFormModal: React.FC<FieldFormModalProps> = ({
  isOpen,
  isEdit,
  formData,
  onFormChange,
  onSubmit,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value, type } = target;

    let val: string | number | boolean;
    if (type === "checkbox") {
      val = (target as HTMLInputElement).checked;
    } else if (type === "number") {
      val = Number(value);
    } else {
      val = value;
    }

    onFormChange(name, val);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={onClose}
        ></div>
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        ></span>
        <div className="inline-block bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {isEdit ? "Chỉnh sửa sân" : "Thêm sân mới"}
                  </h3>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    ❌
                  </button>
                </div>
                <form
                  id="field-form"
                  className="mt-4 space-y-4"
                  onSubmit={onSubmit}
                >
                  <div>
                    <label
                      htmlFor="field_name"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Tên sân
                    </label>
                    <input
                      type="text"
                      id="field_name"
                      name="field_name"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                      value={formData.field_name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fac_id"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ID cơ sở
                    </label>
                    <input
                      type="number"
                      id="fac_id"
                      name="fac_id"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                      value={formData.fac_id}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="category_id"
                      className="block text-sm font-medium text-gray-700"
                    >
                      ID loại sân
                    </label>
                    <input
                      type="number"
                      id="category_id"
                      name="category_id"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Giá (VND)
                    </label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="description"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Mô tả
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-600 focus:border-blue-600"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="is_booking_enable"
                        checked={formData.is_booking_enable}
                        onChange={handleInputChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Cho phép đặt sân
                      </span>
                    </label>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="submit"
              form="field-form"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Lưu
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto"
              onClick={onClose}
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldFormModal;
