import React from "react";
import { Search, Plus } from "lucide-react";

interface UserSearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateUser: () => void;
  totalUsers: number;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onCreateUser,
  totalUsers,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Tìm kiếm theo email, tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Tổng số:{" "}
            <span className="font-semibold text-gray-900">{totalUsers}</span>{" "}
            người dùng
          </span>

          <button
            onClick={onCreateUser}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Thêm người dùng
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSearchBar;
