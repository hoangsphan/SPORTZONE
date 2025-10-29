import React from "react";

interface FieldManagerHeaderProps {
  searchKeyword: string;
  onSearchChange: (keyword: string) => void;
  onAddNew: () => void;
}

const FieldManagerHeader: React.FC<FieldManagerHeaderProps> = ({
  searchKeyword,
  onSearchChange,
  onAddNew,
}) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Quản lý Sân</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              🔍
            </div>
            <input
              type="text"
              id="search-input"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-md pl-10 pr-4 py-2 focus:ring-blue-600 focus:border-blue-600 block w-64"
              placeholder="Tìm kiếm sân..."
              value={searchKeyword}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
            onClick={onAddNew}
          >
            <span>➕</span>
            <span>Thêm mới</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default FieldManagerHeader;
