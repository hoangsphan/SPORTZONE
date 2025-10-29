import { Search } from "lucide-react";

interface SearchAndFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
}

const SearchAndFilterBar = ({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
}: SearchAndFilterBarProps) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Tìm kiếm theo tên sân, địa điểm, mô tả hoặc loại sân..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full h-12 pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
        />
      </div>

      {/* Category Filter */}
      <div className="md:w-64">
        <select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
          className="w-full h-12 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          title="Chọn loại thể thao"
        >
          <option value="all">Tất cả môn thể thao</option>
          <option value="bóng đá">Bóng đá</option>
          <option value="cầu lông">Cầu lông</option>
          <option value="pickleball">Pickleball</option>
          <option value="tennis">Tennis</option>
          <option value="bóng rổ">Bóng rổ</option>
        </select>
      </div>
    </div>
  );
};

export default SearchAndFilterBar;
