import React from "react";
import Sidebar from "../../Sidebar";
import {
  FieldManagerHeader,
  FieldTable,
  FieldPagination,
  FieldFormModal,
  DeleteConfirmModal,
} from "./manager/components";
import { useFieldManager } from "./manager/hooks";

const FieldManager: React.FC = () => {
  const {
    // State
    currentFields,
    searchKeyword,
    editId,
    showModal,
    showDeleteModal,
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
  } = useFieldManager(10);

  return (
    <>
      <Sidebar />
      <div className="min-h-screen flex flex-col bg-gray-50 pl-64 pt-16">
        <FieldManagerHeader
          searchKeyword={searchKeyword}
          onSearchChange={handleSearch}
          onAddNew={openCreateModal}
        />

        <main className="pt-16 min-h-screen bg-gray-50">
          <div className="max-w-screen-xl mx-auto px-4">
            <FieldTable
              fields={currentFields}
              onEdit={handleEdit}
              onDelete={openDeleteModal}
            />

            <FieldPagination
              paginationInfo={paginationInfo}
              onPageChange={goToPage}
              onPrevPage={goToPrevPage}
              onNextPage={goToNextPage}
            />
          </div>
        </main>

        <FieldFormModal
          isOpen={showModal}
          isEdit={editId !== null}
          formData={formData}
          onFormChange={handleFormChange}
          onSubmit={handleSubmit}
          onClose={resetForm}
        />

        <DeleteConfirmModal
          isOpen={showDeleteModal}
          onConfirm={handleDelete}
          onCancel={closeDeleteModal}
        />
      </div>
    </>
  );
};

export default FieldManager;
