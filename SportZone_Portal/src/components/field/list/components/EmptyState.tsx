import { Search } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Search className="w-16 h-16 mx-auto" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Không tìm thấy sân phù hợp
      </h3>
      <p className="text-gray-600">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
    </div>
  );
};

export default EmptyState;
