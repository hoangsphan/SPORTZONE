import React, { useState, useEffect } from "react";
import Sidebar from "../../Sidebar";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import RegulationFormModal from "./RegulationFormModal";
import type { RegulationFormData } from "./RegulationFormModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

type Regulation = {
  regulationSystemId: number;
  title: string;
  description: string;
  status: string;
  createAt?: string;
};

const RegulationManager: React.FC = () => {
  const [regulations, setRegulations] = useState<Regulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editRegulationId, setEditRegulationId] = useState<number | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteRegulationId, setDeleteRegulationId] = useState<number | null>(
    null
  );

  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch("https://localhost:7057/api/RegulationSystem", {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Lỗi khi lấy danh sách quy định");
        const data = await res.json();
        console.log("API quy định trả về:", data);
        setRegulations(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Open add modal
  const handleAddRegulation = () => {
    setEditRegulationId(null);
    setModalOpen(true);
  };

  // Open edit modal
  const handleEditRegulation = (id: number) => {
    setEditRegulationId(id);
    setModalOpen(true);
  };

  // Open delete modal
  const handleDeleteRegulation = (id: number) => {
    setDeleteRegulationId(id);
    setDeleteModalOpen(true);
  };

  // Thêm hoặc cập nhật regulation qua API
  const handleSubmitRegulation = async (data: RegulationFormData) => {
    setLoading(true);
    setError(null);
    const token = localStorage.getItem("token");
    try {
      if (editRegulationId === null) {
        const res = await fetch("https://localhost:7057/api/RegulationSystem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            title: data.regulationName,
            description: data.description,
            status: data.isActive ? "active" : "inactive",
          }),
        });
        if (!res.ok) throw new Error("Lỗi khi thêm quy định");
      } else {
        // Edit
        const res = await fetch(
          `https://localhost:7057/api/RegulationSystem/${editRegulationId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify({
              title: data.regulationName,
              description: data.description,
              status: data.isActive ? "active" : "inactive",
            }),
          }
        );
        if (!res.ok) throw new Error("Lỗi khi cập nhật quy định");
      }
      // Refresh list
      const res = await fetch("https://localhost:7057/api/RegulationSystem", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const newData = await res.json();
      setRegulations(Array.isArray(newData) ? newData : []);
      setModalOpen(false);
      setEditRegulationId(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Lỗi không xác định");
      } else {
        setError("Lỗi không xác định");
      }
    }
    setLoading(false);
  };

  // Xác nhận xóa regulation qua API
  const handleConfirmDelete = async () => {
    const token = localStorage.getItem("token");
    if (deleteRegulationId !== null) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://localhost:7057/api/RegulationSystem/${deleteRegulationId}`,
          {
            method: "DELETE",
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        if (!res.ok) throw new Error("Lỗi khi xóa quy định");
        // Refresh list
        const res2 = await fetch(
          "https://localhost:7057/api/RegulationSystem",
          {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );
        const newData = await res2.json();
        setRegulations(Array.isArray(newData) ? newData : []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message || "Lỗi không xác định");
        } else {
          setError("Lỗi không xác định");
        }
      }
      setLoading(false);
    }
    setDeleteModalOpen(false);
    setDeleteRegulationId(null);
  };

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const totalPages = Math.ceil(regulations.length / itemsPerPage);
  const paginatedRegulations = regulations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToPage = (page: number) => {
    setCurrentPage(page);
    // Scroll lên đầu bảng
    const tableSection = document.getElementById("regulation-table-section");
    if (tableSection) {
      tableSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex">
        <Sidebar />
        <div className="flex-1 ml-64 p-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Lỗi:</strong> {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-green-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">QUẢN LÝ QUY ĐỊNH HỆ THỐNG</h1>
              <p className="text-green-100 mt-1">
                Quản lý các quy định và chính sách của hệ thống
              </p>
            </div>
            <button
              onClick={handleAddRegulation}
              className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Thêm quy định
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Danh sách quy định
              </h2>
            </div>

            {/* Table */}
            <div id="regulation-table-section" className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      Tên quy định
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-black-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedRegulations.length > 0 ? (
                    paginatedRegulations.map((regulation, idx) => (
                      <tr
                        key={regulation.regulationSystemId ?? `row-${idx}`}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {regulation.title}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {regulation.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {regulation.createAt
                            ? new Date(regulation.createAt).toLocaleDateString(
                                "vi-VN"
                              )
                            : ""}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              regulation.status === "active"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {regulation.status === "active"
                              ? "Hoạt động"
                              : "Không hoạt động"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                regulation.regulationSystemId !== undefined &&
                                regulation.regulationSystemId !== null
                                  ? handleEditRegulation(
                                      regulation.regulationSystemId
                                    )
                                  : undefined
                              }
                              className={`text-green-600 hover:text-green-800 p-1${
                                regulation.regulationSystemId === undefined ||
                                regulation.regulationSystemId === null
                                  ? " opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title="Chỉnh sửa"
                              disabled={
                                regulation.regulationSystemId === undefined ||
                                regulation.regulationSystemId === null
                              }
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() =>
                                regulation.regulationSystemId !== undefined &&
                                regulation.regulationSystemId !== null
                                  ? handleDeleteRegulation(
                                      regulation.regulationSystemId
                                    )
                                  : undefined
                              }
                              className={`text-red-600 hover:text-red-800 p-1${
                                regulation.regulationSystemId === undefined ||
                                regulation.regulationSystemId === null
                                  ? " opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              title="Xóa"
                              disabled={
                                regulation.regulationSystemId === undefined ||
                                regulation.regulationSystemId === null
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        Không có quy định nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Hiển thị:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm"
                    title="Số item trên mỗi trang"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    title="Trang trước"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  <span className="text-sm text-gray-700">
                    Trang {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() =>
                      goToPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    title="Trang sau"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Thêm/Sửa */}
        <RegulationFormModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditRegulationId(null);
          }}
          onSubmit={handleSubmitRegulation}
          initialData={
            editRegulationId !== null
              ? (() => {
                  const r = regulations.find(
                    (r) => r.regulationSystemId === editRegulationId
                  );
                  return r
                    ? {
                        regulationName: r.title,
                        description: r.description,
                        isActive: r.status === "active",
                      }
                    : null;
                })()
              : null
          }
        />

        {/* Modal Xác nhận xóa */}
        <ConfirmDeleteModal
          open={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setDeleteRegulationId(null);
          }}
          onConfirm={handleConfirmDelete}
          regulationName={
            deleteRegulationId !== null
              ? regulations.find(
                  (r) => r.regulationSystemId === deleteRegulationId
                )?.title
              : ""
          }
        />
      </div>
    </div>
  );
};

export default RegulationManager;
