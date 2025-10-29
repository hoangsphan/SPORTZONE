import { Search } from "lucide-react";

const LoadingState = () => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <Search className="w-16 h-16 mx-auto animate-spin" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Đang tải dữ liệu...
      </h3>
    </div>
  );
};

export default LoadingState;
