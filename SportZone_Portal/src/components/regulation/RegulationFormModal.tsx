import React, { useState, useEffect } from "react";

interface RegulationFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: RegulationFormData) => void;
  initialData?: RegulationFormData | null;
}

export type RegulationFormData = {
  regulationName: string;
  description: string;
  isActive: boolean;
};

const RegulationFormModal: React.FC<RegulationFormModalProps> = ({
  open,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [form, setForm] = useState<RegulationFormData>({
    regulationName: "",
    description: "",
    isActive: true,
  });

  useEffect(() => {
    if (initialData) {
      setForm(initialData);
    } else {
      setForm({ regulationName: "", description: "", isActive: true });
    }
  }, [initialData, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        <h3 className="text-lg font-semibold mb-4">
          {initialData ? "Chỉnh sửa quy định" : "Thêm quy định"}
        </h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Tên quy định
            </label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2"
              value={form.regulationName}
              onChange={(e) =>
                setForm({ ...form, regulationName: e.target.value })
              }
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mô tả</label>
            <textarea
              className="w-full border rounded px-3 py-2"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              id="isActive"
            />
            <label htmlFor="isActive" className="text-sm">
              Hoạt động
            </label>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
            >
              {initialData ? "Lưu" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegulationFormModal;
